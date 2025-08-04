#!/usr/bin/env python3
# youtube_video_insert.py  ―  YOUTUBE_VIDEO 테이블 UPSERT

import pandas as pd
import oracledb
from pathlib import Path
import glob

# ───────────────────── 1) Oracle 접속 정보 ──────────────────────
DB_USER     = "PARK"
DB_PASSWORD = "smhrd2"
DB_DSN      = "project-db-campus.smhrd.com:1523/XE"

# ───────────────────── 2) CSV 불러오기 ─────────────────────────
BASE_DIR  = Path(__file__).resolve().parents[2]          # DB/code → DB
CSV_FILES = glob.glob(str(BASE_DIR / "all" / "youtube" / "*_videos_food.csv"))

if not CSV_FILES:
    raise FileNotFoundError("all/youtube/*_videos_food.csv 파일을 찾지 못했습니다.")

dfs = [pd.read_csv(fp, encoding="utf-8-sig") for fp in CSV_FILES]

df = pd.concat(dfs, ignore_index=True)

# 2-1) DESCRIPTION 비어 있으면 DURATION 값으로 대체
if "DURATION" in df.columns:
    df["DESCRIPTION"] = df["DESCRIPTION"].fillna(df["DURATION"])

# 테이블에 없는 DURATION 열은 이제 버림
df = df.loc[:, ["VIDEO_ID", "KEYWORD_ID", "TITLE", "DESCRIPTION",
                "CHANNEL_TITLE", "PUBLISHED_AT",
                "VIEW_COUNT", "LIKE_COUNT", "COMMENT_COUNT", "PLATFORM"]]

df.replace({"": pd.NA}, inplace=True)

# ───────────────────── 3) 타입 보정 & 중복 제거 ─────────────────
df["PUBLISHED_AT"] = pd.to_datetime(df["PUBLISHED_AT"], errors="coerce").dt.date
for col in ["KEYWORD_ID", "VIEW_COUNT", "LIKE_COUNT", "COMMENT_COUNT"]:
    df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype("int64")

df = (df.sort_values(["VIDEO_ID", "VIEW_COUNT"], ascending=[True, False])
        .drop_duplicates(subset="VIDEO_ID", keep="first"))

# ───────────────────── 4) Oracle MERGE ─────────────────────────
oracledb.init_oracle_client()
with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
    with conn.cursor() as cur:

        merge_sql = """
        MERGE INTO YOUTUBE_VIDEO v
        USING (
            SELECT :1 AS VIDEO_ID,
                   :2 AS KEYWORD_ID,
                   :3 AS TITLE,
                   :4 AS DESCRIPTION,
                   :5 AS CHANNEL_TITLE,
                   :6 AS PUBLISHED_AT,
                   :7 AS VIEW_COUNT,
                   :8 AS LIKE_COUNT,
                   :9 AS COMMENT_COUNT,
                   :10 AS PLATFORM
            FROM dual
        ) src
        ON (v.VIDEO_ID = src.VIDEO_ID)
        WHEN MATCHED THEN
            UPDATE SET v.KEYWORD_ID    = src.KEYWORD_ID,
                       v.TITLE         = src.TITLE,
                       v.DESCRIPTION   = src.DESCRIPTION,
                       v.CHANNEL_TITLE = src.CHANNEL_TITLE,
                       v.PUBLISHED_AT  = src.PUBLISHED_AT,
                       v.VIEW_COUNT    = src.VIEW_COUNT,
                       v.LIKE_COUNT    = src.LIKE_COUNT,
                       v.COMMENT_COUNT = src.COMMENT_COUNT,
                       v.PLATFORM      = src.PLATFORM
        WHEN NOT MATCHED THEN
            INSERT (VIDEO_ID, KEYWORD_ID, TITLE, DESCRIPTION, CHANNEL_TITLE,
                    PUBLISHED_AT, VIEW_COUNT, LIKE_COUNT, COMMENT_COUNT, PLATFORM)
            VALUES (src.VIDEO_ID, src.KEYWORD_ID, src.TITLE, src.DESCRIPTION,
                    src.CHANNEL_TITLE, src.PUBLISHED_AT, src.VIEW_COUNT,
                    src.LIKE_COUNT, src.COMMENT_COUNT, src.PLATFORM)
        """

        data = [
            (
                str(r.VIDEO_ID),
                int(r.KEYWORD_ID) if r.KEYWORD_ID else None,
                str(r.TITLE) if not pd.isna(r.TITLE) else None,
                str(r.DESCRIPTION) if not pd.isna(r.DESCRIPTION) else None,
                str(r.CHANNEL_TITLE) if not pd.isna(r.CHANNEL_TITLE) else None,
                r.PUBLISHED_AT if not pd.isna(r.PUBLISHED_AT) else None,
                int(r.VIEW_COUNT),
                int(r.LIKE_COUNT),
                int(r.COMMENT_COUNT),
                str(r.PLATFORM) if not pd.isna(r.PLATFORM) else 'youtube'
            )
            for r in df.itertuples(index=False)
        ]

        cur.executemany(merge_sql, data, batcherrors=True)
        for err in cur.getbatcherrors():
            print(f"[Row {err.offset}] {err.message}")

    conn.commit()

print("✅ YOUTUBE_VIDEO 테이블 업서트 완료 (빈 설명엔 DURATION 값 사용).")
# keyword_id.py 수행 직후, 각 CSV 별 누락 건수 확인
print("KEYWORD_ID 결측:",
      df["KEYWORD_ID"].isna().sum() + (df["KEYWORD_ID"] == "").sum())
