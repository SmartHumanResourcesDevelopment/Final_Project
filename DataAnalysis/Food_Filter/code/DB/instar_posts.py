#!/usr/bin/env python3
# instar_posts.py ─ Oracle INSTAGRAM_POST 테이블 업서트 스크립트

import pandas as pd
import oracledb
import glob
import os
from pathlib import Path

# ───────────────────── 1) Oracle 접속 정보 ──────────────────────
DB_USER     = "PARK"
DB_PASSWORD = "smhrd2"
DB_DSN      = "project-db-campus.smhrd.com:1523/XE"

# ───────────────────── 2) CSV 경로 ─────────────────────────────
BASE_DIR  = Path(__file__).resolve().parents[2]          # Food_Filter/code/DB → Food_Filter
CSV_DIR   = BASE_DIR / "instar_post_filter" / "keyword" / "matching"

print(f"📂 인스타그램 데이터 경로: {CSV_DIR}")

# ───────────────────── 3) CSV 파일들 로드 & 전처리 ────────────────────
if not CSV_DIR.exists():
    raise FileNotFoundError(f"인스타그램 데이터 디렉토리가 없습니다: {CSV_DIR}")

# CSV 파일들 찾기
csv_files = list(CSV_DIR.glob("*_keywordid.csv"))
if not csv_files:
    raise FileNotFoundError(f"처리할 CSV 파일이 없습니다: {CSV_DIR}")

print(f"📊 발견된 CSV 파일: {len(csv_files)}개")
for i, file in enumerate(csv_files, 1):
    print(f"   {i}. {file.name}")

# 모든 CSV 파일 합치기
all_dfs = []
for csv_file in csv_files:
    try:
        df = pd.read_csv(csv_file, encoding="utf-8-sig")
        print(f"✅ {csv_file.name}: {len(df)}개 행 로드")
        all_dfs.append(df)
    except Exception as e:
        print(f"❌ {csv_file.name} 로드 오류: {e}")

if not all_dfs:
    raise ValueError("로드된 데이터가 없습니다.")

# 데이터 합치기
df = pd.concat(all_dfs, ignore_index=True)
print(f"📊 전체 데이터: {len(df)}개 행")
print(f"📋 컬럼: {list(df.columns)}")

# 필요한 컬럼만 선택 및 컬럼명 매핑
required_columns = {
    "POST_ID": "POST_ID",
    "KEYWORD_ID": "KEYWORD_ID",
    "POST_TEXT": "POST_TEXT",
    "HASHTAGS": "HASHTAGS",
    "AUTHOR_ID": "AUTHOR_ID",
    "POST_DATE": "POST_DATE",
    "LIKE_COUNT": "LIKE_COUNT",
    "PLATFORM": "PLATFORM"
}

# 존재하는 컬럼만 선택
available_columns = {k: v for k, v in required_columns.items() if k in df.columns}
df = df[list(available_columns.keys())]

# 컬럼명 변경 (필요시)
df = df.rename(columns=available_columns)

print(f"📋 선택된 컬럼: {list(df.columns)}")

# 데이터 전처리
# POST_TEXT가 CLOB이므로 길이 제한 없음, 하지만 NULL 처리
df['POST_TEXT'] = df['POST_TEXT'].fillna('')
df['HASHTAGS'] = df['HASHTAGS'].fillna('')
df['AUTHOR_ID'] = df['AUTHOR_ID'].fillna('')

# KEYWORD_ID가 NULL인 경우 제외 (필수값)
df = df.dropna(subset=['POST_ID', 'POST_DATE'])

# 데이터 타입 변환
df = df.astype({
    "POST_ID": "string",
    "POST_TEXT": "string",
    "HASHTAGS": "string",
    "AUTHOR_ID": "string",
    "POST_DATE": "string",
    "PLATFORM": "string"
})

# KEYWORD_ID와 LIKE_COUNT는 숫자형으로 변환 (NULL 허용)
df['KEYWORD_ID'] = pd.to_numeric(df['KEYWORD_ID'], errors='coerce')
df['LIKE_COUNT'] = pd.to_numeric(df['LIKE_COUNT'], errors='coerce')

# 중복 제거 (POST_ID 기준)
original_count = len(df)
df = df.drop_duplicates(subset="POST_ID", keep="first")
print(f"🔄 중복 제거: {original_count}개 → {len(df)}개 행")

print(f"✅ 전처리 완료: {len(df)}개 행")

# ───────────────────── 4) Oracle 연결 ──────────────────────────
print("\n🔗 Oracle 데이터베이스 연결 중...")

try:
    oracledb.init_oracle_client()  # 필요 시 lib_dir 지정

    with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
        print("✅ 데이터베이스 연결 성공")

        with conn.cursor() as cur:
            # MERGE 쿼리 (UPSERT)
            merge_sql = """
            MERGE INTO INSTAGRAM_POST ip
            USING (SELECT :1 AS POST_ID,
                          :2 AS KEYWORD_ID,
                          :3 AS POST_TEXT,
                          :4 AS HASHTAGS,
                          :5 AS AUTHOR_ID,
                          TO_DATE(:6, 'YYYY-MM-DD') AS POST_DATE,
                          :7 AS LIKE_COUNT,
                          :8 AS PLATFORM FROM dual) src
            ON (ip.POST_ID = src.POST_ID)
            WHEN MATCHED THEN
                UPDATE SET ip.KEYWORD_ID = src.KEYWORD_ID,
                           ip.POST_TEXT  = src.POST_TEXT,
                           ip.HASHTAGS   = src.HASHTAGS,
                           ip.AUTHOR_ID  = src.AUTHOR_ID,
                           ip.POST_DATE  = src.POST_DATE,
                           ip.LIKE_COUNT = src.LIKE_COUNT,
                           ip.PLATFORM   = src.PLATFORM
            WHEN NOT MATCHED THEN
                INSERT (POST_ID, KEYWORD_ID, POST_TEXT, HASHTAGS, AUTHOR_ID, POST_DATE, LIKE_COUNT, PLATFORM)
                VALUES (src.POST_ID, src.KEYWORD_ID, src.POST_TEXT, src.HASHTAGS, src.AUTHOR_ID, src.POST_DATE, src.LIKE_COUNT, src.PLATFORM)
            """

            # 데이터 준비
            data = []
            for _, row in df.iterrows():
                data.append((
                    str(row['POST_ID']),
                    int(row['KEYWORD_ID']) if pd.notna(row['KEYWORD_ID']) else None,
                    str(row['POST_TEXT']),
                    str(row['HASHTAGS']),
                    str(row['AUTHOR_ID']),
                    str(row['POST_DATE']),
                    int(row['LIKE_COUNT']) if pd.notna(row['LIKE_COUNT']) else 0,
                    str(row['PLATFORM'])
                ))

            print(f"📤 {len(data)}개 행 업서트 중...")

            # 배치 실행
            cur.executemany(merge_sql, data, batcherrors=True)

            # 개별 행 오류 출력
            errors = cur.getbatcherrors()
            if errors:
                print(f"⚠️  {len(errors)}개 행에서 오류 발생:")
                for err in errors:
                    print(f"   [Row {err.offset}] {err.message}")
            else:
                print("✅ 모든 행 처리 성공")

        # 커밋
        conn.commit()
        print("✅ 트랜잭션 커밋 완료")

except oracledb.Error as e:
    print(f"❌ Oracle 오류: {e}")
    raise
except Exception as e:
    print(f"❌ 일반 오류: {e}")
    raise

print("\n🎉 INSTAGRAM_POST 테이블 업서트 완료!")
print(f"📊 처리된 포스트: {len(df)}개")
print("=" * 50)