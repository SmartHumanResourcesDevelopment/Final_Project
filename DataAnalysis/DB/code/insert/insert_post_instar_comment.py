#!/usr/bin/env python3
# insert_comment_instar.py ─ INSTAGRAM_COMMENT 테이블 UPSERT

import pandas as pd, oracledb, glob
from pathlib import Path

# ───────────────────── 1) Oracle 접속 정보 ─────────────────────
DB_USER, DB_PASSWORD = "PARK", "smhrd2"
DB_DSN = "project-db-campus.smhrd.com:1523/XE"

# ───────────────────── 2) CSV 병합 ────────────────────────────
BASE_DIR  = Path(__file__).resolve().parents[2]
CSV_FILES = glob.glob(str(BASE_DIR / "all" / "instar" / "comment" / "*_comments.csv"))
if not CSV_FILES:
    raise FileNotFoundError("all/instar/comment/*_comments.csv 파일을 찾지 못했습니다.")

dfs = [pd.read_csv(fp, encoding="utf-8-sig", engine="python") for fp in CSV_FILES]
df  = pd.concat(dfs, ignore_index=True)

# ───────────────────── 3) 컬럼·타입 정리 ───────────────────────
df = df.loc[:, ["COMMENT_ID", "POST_ID", "COMMENTER_ID", "COMMENT_TEXT", "COMMENT_DATE"]]
df["COMMENT_DATE"] = pd.to_datetime(df["COMMENT_DATE"], errors="coerce").dt.date
df["COMMENT_ID"]   = pd.to_numeric(df["COMMENT_ID"], errors="coerce").astype("Int64")
df = df.dropna(subset=["COMMENT_ID", "POST_ID", "COMMENT_TEXT", "COMMENT_DATE"])

# 중복 COMMENT_ID → 가장 최근 댓글만 유지
df = (
    df.sort_values(["COMMENT_ID", "COMMENT_DATE"], ascending=[True, False])
      .drop_duplicates(subset="COMMENT_ID", keep="first")
)

# ───────────────────── 4) Oracle MERGE ─────────────────────────
oracledb.init_oracle_client()
with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
    with conn.cursor() as cur:
        merge_sql = """
        MERGE INTO INSTAGRAM_COMMENT c
        USING (
            SELECT :1 AS COMMENT_ID,
                   :2 AS POST_ID,
                   :3 AS COMMENTER_ID,
                   :4 AS COMMENT_TEXT,
                   :5 AS COMMENT_DATE
            FROM dual
        ) src
        ON (c.COMMENT_ID = src.COMMENT_ID)
        WHEN MATCHED THEN
            UPDATE SET c.POST_ID       = src.POST_ID,
                       c.COMMENTER_ID  = src.COMMENTER_ID,
                       c.COMMENT_TEXT  = src.COMMENT_TEXT,
                       c.COMMENT_DATE  = src.COMMENT_DATE
        WHEN NOT MATCHED THEN
            INSERT (COMMENT_ID, POST_ID, COMMENTER_ID, COMMENT_TEXT, COMMENT_DATE)
            VALUES (src.COMMENT_ID, src.POST_ID, src.COMMENTER_ID,
                    src.COMMENT_TEXT, src.COMMENT_DATE)
        """

        data = [
            (
                int(r.COMMENT_ID),
                str(r.POST_ID),
                str(r.COMMENTER_ID) if not pd.isna(r.COMMENTER_ID) else None,
                str(r.COMMENT_TEXT),
                r.COMMENT_DATE,
            )
            for r in df.itertuples(index=False)
        ]

        cur.executemany(merge_sql, data, batcherrors=True)

        errors = cur.getbatcherrors()
        for e in errors:
            print(f"[Row {e.offset}] {e.message}")

    conn.commit()

total  = len(data)
failed = len(errors)
success = total - failed
print(f"✅ INSTAGRAM_COMMENT 업서트 완료 — 시도 {total}행, 성공 {success}행, 오류 {failed}행")
