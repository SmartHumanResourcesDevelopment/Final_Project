#!/usr/bin/env python3
# kote_upsert_full.py ─ KOTE 감성 결과 업서트 스크립트
#  - 스키마 없이 전체 테이블 처음부터 처리
#  - 긴 텍스트는 512토큰 초과 시 건너뜀
#  - 키워드별 INSTAGRAM 100개 + YOUTUBE 100개 댓글만 처리
#  - MERGE INTO로 Upsert
#  - 진행률 bar 출력

import json
import warnings
import oracledb
from transformers import pipeline
import collections
from tqdm import tqdm

# 워닝 억제
warnings.filterwarnings("ignore", message=".*sequence length.*")

# Instant Client Thick 모드
oracledb.init_oracle_client()

# 감성분석기 초기화
classifier = pipeline(
    "text-classification",
    model="searle-j/kote_for_easygoing_people",
    top_k=None,
    device=0
)

# DB 연결
conn = oracledb.connect(
    user="PARK",
    password="smhrd2",
    dsn="project-db-campus.smhrd.com:1523/XE"
)
cur = conn.cursor()

# 댓글+키워드 조회 함수
def fetch_comments(table_comment, table_post,
                   col_comment_id, col_source_id,
                   col_text, col_date, platform):
    sql = f"""
    SELECT c.{col_comment_id}, p.keyword_id, c.{col_text}, c.{col_date}
      FROM {table_comment} c
      JOIN {table_post} p
        ON c.{col_source_id} = p.{col_source_id}
     WHERE c.{col_text} IS NOT NULL
    """
    cur.execute(sql)
    for comment_id, keyword_id, text, created_at in cur:
        yield comment_id, keyword_id, text, created_at, platform

# 각 플랫폼별 댓글 수집
insta_comments = list(fetch_comments(
    "INSTAGRAM_COMMENT", "INSTAGRAM_POST",
    "COMMENT_ID", "POST_ID",
    "COMMENT_TEXT", "COMMENT_DATE",
    "INSTAGRAM"
))
youtube_comments = list(fetch_comments(
    "YOUTUBE_COMMENT", "YOUTUBE_VIDEO",
    "COMMENT_ID", "VIDEO_ID",
    "COMMENT_TEXT", "PUBLISHED_AT",
    "YOUTUBE"
))

# 키워드별 최대 개수 설정
max_per_platform = 100
counts_insta = collections.defaultdict(int)
counts_youtube = collections.defaultdict(int)

# MERGE Upsert SQL
t_sql = """
MERGE INTO SENTIMENT_RESULT tgt
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
    PLATFORM    = src.PLATFORM,
    SOURCE_ID   = src.SOURCE_ID,
    SOURCE_TYPE = src.SOURCE_TYPE,
    LABEL       = src.LABEL,
    SCORE       = src.SCORE,
    CREATED_AT  = src.CREATED_AT
WHEN NOT MATCHED THEN
  INSERT (SR_ID, PLATFORM, SOURCE_ID, SOURCE_TYPE, LABEL, SCORE, CREATED_AT)
  VALUES (src.SR_ID, src.PLATFORM, src.SOURCE_ID, src.SOURCE_TYPE, src.LABEL, src.SCORE, src.CREATED_AT)
"""

# 전체 처리
sr_id = 1
all_comments = [(insta_comments, counts_insta), (youtube_comments, counts_youtube)]
total_comments = len(insta_comments) + len(youtube_comments)

with tqdm(total=total_comments, desc="Processing") as pbar:
    for platform_comments, counts in all_comments:
        for idx, (_, keyword_id, text, created_at, platform) in enumerate(platform_comments, start=1):
            if counts[keyword_id] >= max_per_platform:
                pbar.update(1)
                continue

            text_str = str(text or "").strip()
            tok = classifier.tokenizer(text_str, return_length=True)
            length_info = tok.get("length")
            length = length_info[0] if isinstance(length_info, list) else length_info

            if length > 512 or not text_str:
                label, score = "감성분석 실패", 0.0
            else:
                try:
                    scores = classifier(text_str)[0]
                    filtered = [p for p in scores if p["score"] >= 0.5]
                    if not filtered:
                        raise ValueError("no filtered scores")
                    label = json.dumps([p["label"] for p in filtered], ensure_ascii=False)
                    score = max(p["score"] for p in filtered)
                except Exception:
                    label, score = "감성분석 실패", 0.0

            cur.execute(t_sql, {
                "sr":   sr_id,
                "pf":   platform,
                "src":  keyword_id,
                "type": "comments",
                "lbl":  label,
                "scr":  float(score),
                "dt":   created_at
            })

            counts[keyword_id] += 1
            sr_id += 1
            pbar.update(1)

# 커밋 및 종료
conn.commit()
cur.close()
conn.close()
print(f"✅ 키워드별 최대 {max_per_platform}개씩, 총 {sr_id-1}개 댓글 Upsert 완료.")
