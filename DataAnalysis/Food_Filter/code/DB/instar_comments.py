#!/usr/bin/env python3
# instar_comments.py ─ Oracle INSTAGRAM_COMMENT 테이블 업서트 스크립트

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
CSV_DIR   = BASE_DIR / "instar_post_filter" / "comment" / "filtered"

print(f"📂 인스타그램 댓글 데이터 경로: {CSV_DIR}")

# ───────────────────── 3) CSV 파일들 로드 & 전처리 ────────────────────
if not CSV_DIR.exists():
    raise FileNotFoundError(f"인스타그램 댓글 데이터 디렉토리가 없습니다: {CSV_DIR}")

# CSV 파일들 찾기
csv_files = list(CSV_DIR.glob("*.csv"))
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
    "COMMENT_ID": "COMMENT_ID",
    "POST_ID": "POST_ID",
    "COMMENTER_ID": "COMMENTER_ID",
    "COMMENT_TEXT": "COMMENT_TEXT",
    "COMMENT_DATE": "COMMENT_DATE"
}

# 존재하는 컬럼만 선택
available_columns = {k: v for k, v in required_columns.items() if k in df.columns}
df = df[list(available_columns.keys())]

# 컬럼명 변경 (필요시)
df = df.rename(columns=available_columns)

print(f"📋 선택된 컬럼: {list(df.columns)}")

# 데이터 전처리
# Oracle에서는 빈 문자열도 NULL로 처리되므로 기본값 설정
df['POST_ID'] = df['POST_ID'].fillna('#쇼츠, #shots')
df['COMMENTER_ID'] = df['COMMENTER_ID'].fillna('#쇼츠, #shots')
df['COMMENT_TEXT'] = df['COMMENT_TEXT'].fillna('#쇼츠, #shots')
df['COMMENT_DATE'] = df['COMMENT_DATE'].fillna('2024-01-01')

# 빈 문자열이나 공백만 있는 경우도 기본값으로 변경
df.loc[df['POST_ID'].astype(str).str.strip() == '', 'POST_ID'] = '#쇼츠, #shots'
df.loc[df['COMMENTER_ID'].astype(str).str.strip() == '', 'COMMENTER_ID'] = '#쇼츠, #shots'
df.loc[df['COMMENT_TEXT'].astype(str).str.strip() == '', 'COMMENT_TEXT'] = '#쇼츠, #shots'
df.loc[df['COMMENT_DATE'].astype(str).str.strip() == '', 'COMMENT_DATE'] = '2024-01-01'

# COMMENT_ID가 NULL인 경우 제외 (필수값)
df = df.dropna(subset=['COMMENT_ID'])

# 데이터 타입 변환
df = df.astype({
    "POST_ID": "string",
    "COMMENTER_ID": "string",
    "COMMENT_TEXT": "string",
    "COMMENT_DATE": "string"
})

# COMMENT_ID는 숫자형으로 변환
df['COMMENT_ID'] = pd.to_numeric(df['COMMENT_ID'], errors='coerce')

# COMMENT_ID가 변환되지 않은 행 제거
df = df.dropna(subset=['COMMENT_ID'])

# 중복 제거 (COMMENT_ID 기준)
original_count = len(df)
df = df.drop_duplicates(subset="COMMENT_ID", keep="first")
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
            MERGE INTO INSTAGRAM_COMMENT ic
            USING (SELECT :1 AS COMMENT_ID,
                          :2 AS POST_ID,
                          :3 AS COMMENTER_ID,
                          :4 AS COMMENT_TEXT,
                          TO_DATE(:5, 'YYYY-MM-DD') AS COMMENT_DATE FROM dual) src
            ON (ic.COMMENT_ID = src.COMMENT_ID)
            WHEN MATCHED THEN
                UPDATE SET ic.POST_ID = src.POST_ID,
                           ic.COMMENTER_ID = src.COMMENTER_ID,
                           ic.COMMENT_TEXT = src.COMMENT_TEXT,
                           ic.COMMENT_DATE = src.COMMENT_DATE
            WHEN NOT MATCHED THEN
                INSERT (COMMENT_ID, POST_ID, COMMENTER_ID, COMMENT_TEXT, COMMENT_DATE)
                VALUES (src.COMMENT_ID, src.POST_ID, src.COMMENTER_ID, src.COMMENT_TEXT, src.COMMENT_DATE)
            """

            # 데이터 준비
            data = []
            for _, row in df.iterrows():
                data.append((
                    int(row['COMMENT_ID']),
                    str(row['POST_ID']),
                    str(row['COMMENTER_ID']),
                    str(row['COMMENT_TEXT']),
                    str(row['COMMENT_DATE'])
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

print("\n🎉 INSTAGRAM_COMMENT 테이블 업서트 완료!")
print(f"📊 처리된 댓글: {len(df)}개")
print("=" * 50)