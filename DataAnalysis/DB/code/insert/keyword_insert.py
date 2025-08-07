#!/usr/bin/env python3
# keyword_insert.py ─ Oracle KEYWORD 테이블 업서트 스크립트 (중복 자동 제거)

import pandas as pd
import oracledb
from pathlib import Path

# ───────────────────── 1) Oracle 접속 정보 ──────────────────────
DB_USER     = "PARK"
DB_PASSWORD = "smhrd2"
DB_DSN      = "project-db-campus.smhrd.com:1523/XE"

# ───────────────────── 2) CSV 경로 ─────────────────────────────
BASE_DIR  = Path(__file__).resolve().parents[2]          # DB/code → DB
CSV_PATH  = BASE_DIR / "all" / "combined_keyword_mentions.csv"

# ───────────────────── 3) CSV 로드 & 선처리 ────────────────────
df = (
    pd.read_csv(CSV_PATH, encoding="utf-8-sig")
      .loc[:, ["KEYWORD_ID", "KEYWORD_NAME", "KEYWORDUP"]]   # 필요한 컬럼만
      .dropna(subset=["KEYWORD_ID", "KEYWORD_NAME"])         # 필수값 결측 제거
      .astype({"KEYWORD_ID": "int64", "KEYWORD_NAME": "string", "KEYWORDUP": "int64"})
)

# 3-1) 같은 KEYWORD_ID가 여러 번 나오면 KEYWORDUP이 큰 값을 우선
df = (
    df.sort_values(["KEYWORD_ID", "KEYWORDUP"], ascending=[True, False])
      .drop_duplicates(subset="KEYWORD_ID", keep="first")
)

# 3-2) (선택) KEYWORD_NAME이 중복인데 ID가 다른 경우 최상위만 남기려면 추가 처리
# df = df.sort_values(["KEYWORD_NAME", "KEYWORDUP"], ascending=[True, False])\
#        .drop_duplicates(subset="KEYWORD_NAME", keep="first")

# ───────────────────── 4) Oracle 연결 ──────────────────────────
oracledb.init_oracle_client()  # 필요 시 lib_dir 지정
with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
    with conn.cursor() as cur:
        merge_sql = """
        MERGE INTO KEYWORD k
        USING (SELECT :1 AS KEYWORD_ID,
                      :2 AS KEYWORD_NAME,
                      :3 AS KEYWORDUP FROM dual) src
        ON (k.KEYWORD_ID = src.KEYWORD_ID)
        WHEN MATCHED THEN
            UPDATE SET k.KEYWORD_NAME = src.KEYWORD_NAME,
                       k.KEYWORDUP    = src.KEYWORDUP
        WHEN NOT MATCHED THEN
            INSERT (KEYWORD_ID, KEYWORD_NAME, KEYWORDUP)
            VALUES (src.KEYWORD_ID, src.KEYWORD_NAME, src.KEYWORDUP)
        """

        data = list(df.itertuples(index=False, name=None))  # (id, name, up) 튜플 리스트
        cur.executemany(merge_sql, data, batcherrors=True)

        # 개별 행 오류 출력
        for err in cur.getbatcherrors():
            print(f"[Row {err.offset}] {err.message}")

    conn.commit()

print("✅ KEYWORD 테이블 업서트 완료 (중복 행 자동 제거).")
