#!/usr/bin/env python3
# kote_main_stats_upsert.py ─ KEYWORD_MAIN_STATS 업서트 스크립트
#  - KEYWORD_DAILY_STATS에서 키워드 정보 조회
#  - SENTIMENT_RESULT에서 주요 감정 집계
#  - OpenAI로 subtitle(소제목), trend(확산배경) 생성 (API 키 직접 선언)
#  - MAIN_EMOTIONS 4000자 초과 시 건너뜀, 없으면 '감정없음'
#  - MERGE INTO로 KEYWORD_MAIN_STATS upsert
#  - 진행률 표시 및 JSON 응답 강제화
#  - CREATED_AT: stats_date, UPDATED_AT: SYSDATE

import json
import warnings
import oracledb
from openai import OpenAI
from tqdm import tqdm
import re

# 워닝 억제
warnings.filterwarnings("ignore", message=".*sequence length.*")

# OpenAI 클라이언트 초기화 (API 키 직접 선언)
client = OpenAI(api_key="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")  # 실제 키를 입력하세요

# Instant Client Thick 모드
oracledb.init_oracle_client()

# Oracle DB 연결
conn = oracledb.connect(
    user="PARK",
    password="smhrd2",
    dsn="project-db-campus.smhrd.com:1523/XE"
)
cur = conn.cursor()

# 1) DAILY_STATS 조회
cur.execute("SELECT KEYWORD_ID, KEYWORD_NAME, STATS_DATE FROM KEYWORD_DAILY_STATS")
daily_stats = cur.fetchall()

# 2) SENTIMENT_RESULT에서 감정 레이블 집계
cur.execute("SELECT SOURCE_ID, LABEL FROM SENTIMENT_RESULT")
sent_rows = cur.fetchall()
emotion_map = {}
for src_id, label_json in sent_rows:
    try:
        labels = json.loads(label_json)
        emotion_map.setdefault(src_id, set()).update(labels)
    except:
        continue

# 3) MERGE INTO SQL (SUBTITLE, TREND_EXPLANATION)
merge_sql = """
MERGE INTO KEYWORD_MAIN_STATS tgt
USING (
  SELECT :kw AS KEYWORD_ID,
         :cr AS CURRENT_RANK,
         :st AS SHORT_DESCRIPTION,
         :te AS TREND_EXPLANATION,
         :me AS MAIN_EMOTIONS,
         TO_DATE(:cd, 'YYYY-MM-DD') AS CREATED_AT
    FROM dual
) src
ON (tgt.KEYWORD_ID = src.KEYWORD_ID)
WHEN MATCHED THEN
  UPDATE SET
    CURRENT_RANK      = src.CURRENT_RANK,
    SHORT_DESCRIPTION          = src.SHORT_DESCRIPTION,
    TREND_EXPLANATION = src.TREND_EXPLANATION,
    MAIN_EMOTIONS     = src.MAIN_EMOTIONS,
    UPDATED_AT        = SYSDATE
WHEN NOT MATCHED THEN
  INSERT (KEYWORD_ID, CURRENT_RANK, SHORT_DESCRIPTION, TREND_EXPLANATION, MAIN_EMOTIONS, CREATED_AT, UPDATED_AT)
  VALUES (src.KEYWORD_ID, src.CURRENT_RANK, src.SHORT_DESCRIPTION, src.TREND_EXPLANATION, src.MAIN_EMOTIONS, src.CREATED_AT, SYSDATE)
"""

processed = set()             # 이미 처리한 keyword_id 기억용

# 4) 키워드별 처리
for keyword_id, keyword_name, stats_date in tqdm(daily_stats,
                                                 desc="Upserting keywords",
                                                 total=len(daily_stats)):

    # ── 중복 방지 ──────────────────────────────────────────────
    if keyword_id in processed:
        continue
    processed.add(keyword_id)
    # ─────────────────────────────────────────────────────────

    emotions = emotion_map.get(keyword_id, set())
    main_emotions = ", ".join(sorted(emotions)) if emotions else "감정없음"
    if len(main_emotions) > 4000:
        tqdm.write(f"SKIP {keyword_id}: 감정 길이 {len(main_emotions)} > 4000")
        continue

    system_msg = (
        "당신은 전문 트렌드 분석가입니다. 'subtitle','trend' 필드만 포함된 "
        "유효한 JSON을 반환하세요. 추가 텍스트는 생략하세요."
    )
    user_msg = (
        f"키워드 '{keyword_name}'에 대해 'subtitle'(소제목-30자 이내), "
        f"'trend'(확산배경-3줄 이내 전문가 요약)를 포함한 JSON을 생성하세요. "
        f"언급 날짜: {stats_date}."
    )
    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_msg},
                {"role": "user",   "content": user_msg}
            ],
            temperature=0.7,
            max_tokens=200
        )
        raw = response.choices[0].message.content.strip()

        try:
            data = json.loads(raw)
        except json.JSONDecodeError:
            m = re.search(r"\{[\s\S]*\}", raw)
            data = json.loads(m.group(0)) if m else {}

        subtitle = data.get("subtitle", "")
        trend_exp = data.get("trend", "")
        if not isinstance(subtitle, str):
            subtitle = json.dumps(subtitle, ensure_ascii=False)
        if not isinstance(trend_exp, str):
            trend_exp = json.dumps(trend_exp, ensure_ascii=False)

    except Exception as e:
        tqdm.write(f"JSON/응답 처리 실패 for {keyword_id}: {e}")
        continue

    cur.execute(merge_sql, {
        "kw": keyword_id,
        "cr": 0,
        "st": subtitle,
        "te": trend_exp,
        "me": main_emotions,
        "cd": stats_date
    })
    conn.commit()
    tqdm.write(f"Upsert 완료: {keyword_id}")


# 종료
cur.close()
conn.close()
print("모든 키워드 처리 완료.")

