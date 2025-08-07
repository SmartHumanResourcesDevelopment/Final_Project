#!/usr/bin/env python3
# instar_post_insert.py ─ Oracle INSTAGRAM_POST 테이블 업서트 스크립트

import pandas as pd
import oracledb
from pathlib import Path
from datetime import datetime
import glob

# ───────────────────── 1) Oracle 접속 정보 ──────────────────────
DB_USER     = "PARK"
DB_PASSWORD = "smhrd2"
DB_DSN      = "project-db-campus.smhrd.com:1523/XE"

# ───────────────────── 2) CSV 모으기 ────────────────────────────
BASE_DIR   = Path(__file__).resolve().parents[2]   # DB/code → DB
CSV_FILES  = glob.glob(str(BASE_DIR / "all" / "instar" / "*_posts.csv"))

if not CSV_FILES:
    raise FileNotFoundError("all/instar/*_posts.csv 파일을 찾지 못했습니다.")

dfs = []
for fp in CSV_FILES:
    df = pd.read_csv(fp, encoding="utf-8-sig")
    dfs.append(df)

df = (
    pd.concat(dfs, ignore_index=True)
      .loc[:, ["POST_ID", "KEYWORD_ID", "POST_TEXT", "HASHTAGS",
               "AUTHOR_ID", "POST_DATE", "LIKE_COUNT", "PLATFORM"]]
      # 빈 문자열 → NaN → None
      .replace({"": pd.NA})
)

# ───────────────────── 3) 타입 보정 & 중복 제거 ─────────────────
# (1) 날짜
df["POST_DATE"] = pd.to_datetime(df["POST_DATE"], errors="coerce").dt.date

# (2) KEYWORD_ID: 숫자 변환 실패 시 NULL
df["KEYWORD_ID"] = pd.to_numeric(df["KEYWORD_ID"], errors="coerce").astype("Int64")

# (3) LIKE_COUNT
df["LIKE_COUNT"] = pd.to_numeric(df["LIKE_COUNT"], errors="coerce").fillna(0).astype("int64")

# (4) 중복: POST_ID 기준으로 최신(=LIKE_COUNT 큰) 행 선택
df = (df.sort_values(["POST_ID", "LIKE_COUNT"], ascending=[True, False])
        .drop_duplicates(subset="POST_ID", keep="first"))

# ───────────────────── 4) Oracle 연결 & MERGE ──────────────────
oracledb.init_oracle_client()    # 필요 시 lib_dir 지정
with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
    with conn.cursor() as cur:

        merge_sql = """
        MERGE INTO INSTAGRAM_POST p
        USING (
            SELECT :1 AS POST_ID,
                   :2 AS KEYWORD_ID,
                   :3 AS POST_TEXT,
                   :4 AS HASHTAGS,
                   :5 AS AUTHOR_ID,
                   :6 AS POST_DATE,
                   :7 AS LIKE_COUNT,
                   :8 AS PLATFORM
            FROM dual
        ) src
        ON (p.POST_ID = src.POST_ID)
        WHEN MATCHED THEN
            UPDATE SET p.KEYWORD_ID  = src.KEYWORD_ID,
                       p.POST_TEXT   = src.POST_TEXT,
                       p.HASHTAGS    = src.HASHTAGS,
                       p.AUTHOR_ID   = src.AUTHOR_ID,
                       p.POST_DATE   = src.POST_DATE,
                       p.LIKE_COUNT  = src.LIKE_COUNT,
                       p.PLATFORM    = src.PLATFORM
        WHEN NOT MATCHED THEN
            INSERT (POST_ID, KEYWORD_ID, POST_TEXT, HASHTAGS,
                    AUTHOR_ID, POST_DATE, LIKE_COUNT, PLATFORM)
            VALUES (src.POST_ID, src.KEYWORD_ID, src.POST_TEXT, src.HASHTAGS,
                    src.AUTHOR_ID, src.POST_DATE, src.LIKE_COUNT, src.PLATFORM)
        """

        data = [
            (
                str(r.POST_ID),
                None if pd.isna(r.KEYWORD_ID) else int(r.KEYWORD_ID),
                str(r.POST_TEXT) if not pd.isna(r.POST_TEXT) else None,
                str(r.HASHTAGS)  if not pd.isna(r.HASHTAGS)  else None,
                str(r.AUTHOR_ID) if not pd.isna(r.AUTHOR_ID) else None,
                r.POST_DATE if not pd.isna(r.POST_DATE) else None,
                int(r.LIKE_COUNT),
                str(r.PLATFORM)
            )
            for r in df.itertuples(index=False)
        ]

        cur.executemany(merge_sql, data, batcherrors=True)

        for err in cur.getbatcherrors():
            print(f"[Row {err.offset}] {err.message}")

    conn.commit()

print("✅ INSTAGRAM_POST 테이블 업서트 완료.")
