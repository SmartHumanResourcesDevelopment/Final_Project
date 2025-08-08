#!/usr/bin/env python3
# kote_upsert_resume.py ─ KOTE 감성 결과 업서트 스크립트
#  - PARK 스키마
#  - MERGE INTO 로 upsert
#  - 긴 텍스트 자동 잘림
#  - DB에 들어간 마지막 SR_ID 기준으로 재개
#  - 개별 처리 시 오류 발생하면 건너뛰고 계속 진행하며, 각 행 커밋

import json
import warnings
import oracledb
from transformers import pipeline

# ── 0) 워닝 억제 ────────────────────────────────────────────────
warnings.filterwarnings("ignore", message=".*sequence length.*")

# ── 1) Instant Client Thick 모드 전환 ────────────────────────────
oracledb.init_oracle_client()

# ── 2) 감성분석기 초기화 ──────────────────────────────────────────
classifier = pipeline(
    "text-classification",
    model="searle-j/kote_for_easygoing_people",
    tokenizer_kwargs={"truncation": True, "max_length": 512},
    top_k=None,
    device=0
)

# ── 3) DB 연결 및 마지막 SR_ID 조회 ─────────────────────────────
conn = oracledb.connect(
    user="PARK",
    password="smhrd2",
    dsn="project-db-campus.smhrd.com:1523/XE"
)
cur = conn.cursor()

cur.execute("SELECT NVL(MAX(SR_ID), 0) FROM PARK.SENTIMENT_RESULT")
last_sr = cur.fetchone()[0]
print(f"▶ 이미 upsert 된 마지막 SR_ID: {last_sr}  (다음 idx 부터 재개)")

# ── 4) 댓글+키워드 로딩 함수 ─────────────────────────────────────
def fetch_comments(table_comment, table_post,
                   col_comment_id, col_source_id,
                   col_text, col_date, platform):
    sql = f"""
    SELECT c.{col_comment_id}, p.keyword_id, c.{col_text}, c.{col_date}
      FROM PARK.{table_comment} c
      JOIN PARK.{table_post}   p
        ON c.{col_source_id} = p.{col_source_id}
     WHERE c.{col_text} IS NOT NULL
    """
    cur.execute(sql)
    for comment_id, keyword_id, text, created_at in cur:
        yield comment_id, keyword_id, text, created_at, platform

# ── 5) batches 정의 ─────────────────────────────────────────────
batches = []
batches.extend(fetch_comments("INSTAGRAM_COMMENT", "INSTAGRAM_POST",
                              "COMMENT_ID", "POST_ID",
                              "COMMENT_TEXT", "COMMENT_DATE",
                              "INSTAGRAM"))
batches.extend(fetch_comments("YOUTUBE_COMMENT", "YOUTUBE_VIDEO",
                              "COMMENT_ID", "VIDEO_ID",
                              "COMMENT_TEXT", "PUBLISHED_AT",
                              "YOUTUBE"))

total = len(batches)
print(f"🔍 총 {total}개 댓글 중 idx={last_sr+1}부터 처리 시작")

# ── 6) MERGE UPsert SQL ─────────────────────────────────────────
MERGE_SQL = """
MERGE INTO PARK.SENTIMENT_RESULT tgt
USING (
  SELECT :sr AS SR_ID,
         :pf AS PLATFORM,
         :src AS SOURCE_ID,
         :type AS SOURCE_TYPE,
         :lbl AS LABEL,
         :scr AS SCORE,
         :dt AS CREATED_AT
    FROM dual
) src
ON (tgt.SR_ID = src.SR_ID)
WHEN MATCHED THEN
  UPDATE SET
    tgt.PLATFORM    = src.PLATFORM,
    tgt.SOURCE_ID   = src.SOURCE_ID,
    tgt.SOURCE_TYPE = src.SOURCE_TYPE,
    tgt.LABEL       = src.LABEL,
    tgt.SCORE       = src.SCORE,
    tgt.CREATED_AT  = src.CREATED_AT
WHEN NOT MATCHED THEN
  INSERT (SR_ID, PLATFORM, SOURCE_ID, SOURCE_TYPE, LABEL, SCORE, CREATED_AT)
  VALUES (src.SR_ID, src.PLATFORM, src.SOURCE_ID, src.SOURCE_TYPE, src.LABEL, src.SCORE, src.CREATED_AT)
"""

# ── 7) 루프: 마지막 SR_ID 다음 idx부터 처리 및 개별 커밋 ─────────
sr_id_counter = last_sr + 1
upserted = 0

for idx, (_, keyword_id, text, created_at, platform) in enumerate(batches, start=1):
    if idx <= last_sr:
        continue
    print(f"[{idx}/{total}] 처리 중: keyword_id={keyword_id}, platform={platform}")
    try:
        text_str = str(text or "").strip()
        if not text_str:
            raise ValueError("empty text")
        scores = classifier(text_str)[0]
        filt = [p for p in scores if p["score"] >= 0.5]
        if not filt:
            raise ValueError("no filtered scores")
        label = json.dumps([p["label"] for p in filt], ensure_ascii=False)
        score = max(p["score"] for p in filt)
    except Exception as e:
        print(f"  - 처리 오류: {e} → '감성분석 실패'")
        label = "감성분석 실패"
        score = 0.0
    try:
        cur.execute(MERGE_SQL, {
            "sr":   sr_id_counter,
            "pf":   platform,
            "src":  keyword_id,
            "type": "comments",
            "lbl":  label,
            "scr":  float(score),
            "dt":   created_at
        })
        conn.commit()
        print(f"  → SR_ID={sr_id_counter} upsert 완료, LABEL={label}, SCORE={score:.2f}")
        upserted += 1
        sr_id_counter += 1
    except Exception as e:
        print(f"  - DB upsert 오류: {e} → 건너뜀")

# ── 8) 종료 메시지 ─────────────────────────────────────────────
cur.close()
conn.close()
print(f"🎉 완료: {upserted}개 댓글 upsert 되었습니다. SR_ID {last_sr+1}..{sr_id_counter-1}")

