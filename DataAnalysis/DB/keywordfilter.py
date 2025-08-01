#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from pathlib import Path
import pandas as pd
import oracledb
from transformers import pipeline

# ==================================================
# 0) Oracle Thick 모드 초기화 (필요 시)
# ==================================================
instant_dir = r"C:\oraclexe\instantclient_19_28"  # oci.dll 이 여기에 있어야 합니다
os.environ["PATH"] = instant_dir + ";" + os.environ.get("PATH", "")
oracledb.init_oracle_client(lib_dir=instant_dir)

# ==================================================
# 1) Zero-Shot 분류기 설정
# ==================================================
classifier = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    device=0
)
candidate_labels = [
    "food", "dessert", "snack",
    "beverage", "meal", "korean food",
    "non-food"
]
threshold = 0.6

# ==================================================
# 2) DB 연결
# ==================================================
conn = oracledb.connect(
    user="PARK",
    password="smhrd2",
    dsn="project-db-campus.smhrd.com:1523/XE"
)
cur = conn.cursor()

# ==================================================
# 3) CSV 읽기 헬퍼 (인코딩 자동 감지)
# ==================================================
def read_csv_with_encoding(path: Path) -> pd.DataFrame:
    for enc in ("utf-8-sig", "cp949", "euc-kr"):
        try:
            return pd.read_csv(path, encoding=enc)
        except UnicodeDecodeError:
            continue
    return pd.read_csv(path, encoding="latin1")



# ==================================================
# 4) CSV 파일 리스트
# ==================================================
BASE_DIR = Path(__file__).resolve().parent
CSV_DIR  = BASE_DIR / "Filtered"
CSV_FILES = list(CSV_DIR.glob("*_filtered_food_posts.csv"))



# ==================================================
# 5) KEYWORD 테이블 MERGE + 언급량(KEYWORDUP) 업데이트
# ==================================================
for csv_path in CSV_FILES:
    # 1) CSV 읽기
    df = read_csv_with_encoding(csv_path)

    # 2) 컬럼명 BOM/공백 제거
    df.columns = df.columns.str.replace('\ufeff', '').str.strip()

    # (디버그) 실제 컬럼 확인
    print(f"{csv_path.name} 컬럼 목록:", df.columns.tolist())

    # 3) KEYWORD MERGE
    for raw_tags in df["해시태그"].dropna():
        for tag in raw_tags.split(","):
            ht = tag.strip().lstrip("#")
            if not ht:
                continue
            # Zero-Shot 분류
            res   = classifier(ht, candidate_labels)
            label = res["labels"][0]
            score = res["scores"][0]
            if label != "non-food" and score >= threshold:
                cur.execute("""
                  MERGE INTO KEYWORD tgt
                  USING (SELECT :hn AS keyword_name FROM DUAL) src
                    ON (tgt.keyword_name = src.keyword_name)
                  WHEN MATCHED THEN
                    UPDATE SET tgt.KEYWORDUP = tgt.KEYWORDUP + 1
                  WHEN NOT MATCHED THEN
                    INSERT (keyword_id, keyword_name, KEYWORDUP)
                    VALUES (KEYWORD_SEQ.NEXTVAL, src.keyword_name, 1)
                """, hn=ht)
conn.commit()
print("✅ KEYWORD 언급량(KEYWORDUP) 업데이트 완료")

# ==================================================
# 6) 키워드 맵 로드
# ==================================================
cur.execute("SELECT keyword_id, keyword_name FROM KEYWORD")
kw_map = { name: kid for kid, name in cur.fetchall() }
# ——————————————————————————————
# 5) INSTAGRAM_POST / INSTAGRAM_COMMENT 적재
# ——————————————————————————————
post_sql = """
INSERT INTO INSTAGRAM_POST
  (keyword_id, post_text, hashtags, author_id, post_date, like_count)
VALUES
  (:1, :2, :3, :4, TO_DATE(:5,'YYYY-MM-DD'), :6)
"""
comment_sql = """
INSERT INTO INSTAGRAM_COMMENT
  (post_id, commenter_id, comment_text, comment_date)
VALUES
  (:1, :2, :3, TO_DATE(:4,'YYYY-MM-DD'))
"""

for csv_path in CSV_FILES:
    df = read_csv_with_encoding(csv_path)
    posts = []
    comments_buf = []

    for idx, row in df.iterrows():
        first_ht = str(row.get("해시태그","")).split(",")[0].strip().lstrip("#")
        kw_id = kw_map.get(first_ht)
        if not kw_id:
            continue

        pt = row.get("본문","") or ""
        au = csv_path.stem.split("_")[0]
        dt = pd.to_datetime(row["작성일"], errors="coerce")
        ds = dt.strftime("%Y-%m-%d") if not pd.isna(dt) else None
        lk = int(str(row.get("좋아요 수",0)).replace(",","") or 0)

        posts.append([kw_id, pt, row.get("해시태그","") or "", au, ds, lk])

        for line in str(row.get("댓글 목록","")).splitlines():
            parts = [p.strip() for p in line.split("|")]
            if len(parts) >= 3:
                comments_buf.append((idx, parts[0], parts[2], parts[1]))

    cur.executemany(post_sql, posts)
    conn.commit()

    n = len(posts)
    cur.execute(f"""
      SELECT post_id FROM (
        SELECT post_id FROM INSTAGRAM_POST ORDER BY post_id DESC
      ) WHERE ROWNUM <= :n
    """, [n])
    new_ids = [r[0] for r in cur.fetchall()][::-1]

    c_batch = []
    for row_idx, commenter, text, cdate in comments_buf:
        c_batch.append([new_ids[row_idx], commenter, text, cdate])
    if c_batch:
        cur.executemany(comment_sql, c_batch)
        conn.commit()

    print(f"✅ '{csv_path.name}' 적재 완료")

# ——————————————————————————————
# 6) 종료
# ——————————————————————————————
cur.close()
conn.close()
print("모든 처리 완료")
