#!/usr/bin/env python3
# insert_comment_youtube.py — YOUTUBE_COMMENT UPSERT (CLOB + batch)

import pandas as pd, oracledb, glob
from pathlib import Path

DB_USER, DB_PASSWORD = "PARK", "smhrd2"
DB_DSN   = "project-db-campus.smhrd.com:1523/XE"
BATCH    = 5_000         # 한 번에 보낼 행 수

BASE_DIR = Path(__file__).resolve().parents[2]
CSV_DIR  = BASE_DIR / "all" / "youtube" / "comment"
CSV_FILES = glob.glob(str(CSV_DIR / "*_comments.csv"))
if not CSV_FILES:
    raise FileNotFoundError("all/youtube/comment/*_comments.csv 파일이 없습니다.")

# ────────── 1. CSV 병합 ────────────────────────────────────────
dfs = [pd.read_csv(fp, encoding="utf-8-sig", engine="python") for fp in CSV_FILES]
df  = (pd.concat(dfs, ignore_index=True)
         .loc[:, ["COMMENT_ID","VIDEO_ID","AUTHOR_NAME","COMMENT_TEXT","PUBLISHED_AT"]])

df["PUBLISHED_AT"] = pd.to_datetime(df["PUBLISHED_AT"], errors="coerce").dt.date
df = df.replace({"": pd.NA})
df = (df.sort_values(["COMMENT_ID","PUBLISHED_AT"], ascending=[True, False])
        .drop_duplicates(subset="COMMENT_ID", keep="first")
        .dropna(subset=["COMMENT_ID","VIDEO_ID","COMMENT_TEXT","PUBLISHED_AT"]))

def rowtuple(r):
    return (str(r.COMMENT_ID),
            str(r.VIDEO_ID),
            str(r.AUTHOR_NAME) if not pd.isna(r.AUTHOR_NAME) else None,
            str(r.COMMENT_TEXT),
            r.PUBLISHED_AT)

data = [rowtuple(r) for r in df.itertuples(index=False)]

# ────────── 2. MERGE SQL ──────────────────────────────────────
merge_sql = """
MERGE INTO YOUTUBE_COMMENT c
USING (
    SELECT :1 AS COMMENT_ID,
           :2 AS VIDEO_ID,
           :3 AS AUTHOR_NAME,
           :4 AS COMMENT_TEXT,
           :5 AS PUBLISHED_AT
    FROM dual
) src
ON (c.COMMENT_ID = src.COMMENT_ID)
WHEN MATCHED THEN
  UPDATE SET c.VIDEO_ID     = src.VIDEO_ID,
             c.AUTHOR_NAME  = src.AUTHOR_NAME,
             c.COMMENT_TEXT = src.COMMENT_TEXT,
             c.PUBLISHED_AT = src.PUBLISHED_AT
WHEN NOT MATCHED THEN
  INSERT (COMMENT_ID, VIDEO_ID, AUTHOR_NAME, COMMENT_TEXT, PUBLISHED_AT)
  VALUES (src.COMMENT_ID, src.VIDEO_ID, src.AUTHOR_NAME, src.COMMENT_TEXT, src.PUBLISHED_AT)
"""

# ────────── 3. DB 업서트 (CLOB 바인드 + 배치) ───────────────────
oracledb.init_oracle_client()
total = fail = 0
with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
    with conn.cursor() as cur:
        #           :1      :2      :3           :4(CLOB)     :5
        cur.setinputsizes(None,   None,   None,  oracledb.DB_TYPE_CLOB, None)

        for i in range(0, len(data), BATCH):
            chunk = data[i:i+BATCH]
            cur.executemany(merge_sql, chunk, batcherrors=True)
            errs = cur.getbatcherrors()
            fail  += len(errs)
            total += len(chunk)
            for e in errs:
                print(f"[Row {i+e.offset}] {e.message}")  # 상세 오류(옵션)
        conn.commit()

print(f"✅ YOUTUBE_COMMENT 업서트 완료 — 시도 {total}행, 성공 {total-fail}행, 오류 {fail}행")




