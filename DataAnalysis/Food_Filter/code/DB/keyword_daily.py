#!/usr/bin/env python3
# keyword_daily.py ─ Oracle KEYWORD_DAILY_STATS 테이블 업서트 스크립트

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
CSV_DIR   = BASE_DIR / "keywordDailyCount"

print(f"📂 키워드 일별 통계 데이터 경로: {CSV_DIR}")

# ───────────────────── 3) CSV 파일들 로드 & 전처리 ────────────────────
if not CSV_DIR.exists():
    raise FileNotFoundError(f"키워드 일별 통계 데이터 디렉토리가 없습니다: {CSV_DIR}")

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
    "STATS_ID": "STATS_ID",
    "KEYWORD_ID": "KEYWORD_ID",
    "KEYWORD_NAME": "KEYWORD_NAME",
    "DAILY_COUNT": "DAILY_COUNT",
    "STATS_DATE": "STATS_DATE"
}

# 존재하는 컬럼만 선택
available_columns = {k: v for k, v in required_columns.items() if k in df.columns}
df = df[list(available_columns.keys())]

# 컬럼명 변경 (필요시)
df = df.rename(columns=available_columns)

print(f"📋 선택된 컬럼: {list(df.columns)}")

# 데이터 전처리
# NULL 값 처리
df['KEYWORD_ID'] = df['KEYWORD_ID'].fillna(0)
df['KEYWORD_NAME'] = df['KEYWORD_NAME'].fillna('기타')
df['DAILY_COUNT'] = df['DAILY_COUNT'].fillna(0)
df['STATS_DATE'] = df['STATS_DATE'].fillna('2024-08-05')

# 빈 문자열이나 공백만 있는 경우도 기본값으로 변경
df.loc[df['KEYWORD_NAME'].astype(str).str.strip() == '', 'KEYWORD_NAME'] = '기타'
df.loc[df['STATS_DATE'].astype(str).str.strip() == '', 'STATS_DATE'] = '2024-08-05'

# STATS_ID가 NULL인 경우 제외 (필수값)
df = df.dropna(subset=['STATS_ID'])
print(f"📊 STATS_ID NULL 제거 후: {len(df)}개 행")

# STATS_ID 데이터 확인
print(f"📋 STATS_ID 샘플: {df['STATS_ID'].head().tolist()}")
print(f"📋 STATS_ID 타입: {df['STATS_ID'].dtype}")

# 데이터 타입 변환
df['STATS_ID'] = pd.to_numeric(df['STATS_ID'], errors='coerce')
df['KEYWORD_ID'] = pd.to_numeric(df['KEYWORD_ID'], errors='coerce')
df['DAILY_COUNT'] = pd.to_numeric(df['DAILY_COUNT'], errors='coerce')

# 숫자 변환 실패한 행 제거
df = df.dropna(subset=['STATS_ID'])
print(f"📊 STATS_ID 변환 후: {len(df)}개 행")

# 문자열 컬럼 처리
df['KEYWORD_NAME'] = df['KEYWORD_NAME'].astype(str)
df['STATS_DATE'] = df['STATS_DATE'].astype(str)

# 날짜 형식 정규화
def normalize_date(date_str):
    """날짜 문자열을 YYYY-MM-DD 형식으로 정규화"""
    try:
        date_str = str(date_str).strip()
        if len(date_str) >= 10:
            return date_str[:10]
        else:
            return '2024-08-05'
    except:
        return '2024-08-05'

df['STATS_DATE'] = df['STATS_DATE'].apply(normalize_date)
print(f"📅 날짜 샘플: {df['STATS_DATE'].head().tolist()}")

# 데이터 길이 제한 (Oracle 컬럼 크기에 맞춤)
df['KEYWORD_NAME'] = df['KEYWORD_NAME'].str[:100]  # VARCHAR2(100)

# 중복 제거 (STATS_ID 기준만)
original_count = len(df)
df = df.drop_duplicates(subset="STATS_ID", keep="first")
print(f"🔄 중복 제거 (STATS_ID 기준): {original_count}개 → {len(df)}개 행")

print(f"✅ 전처리 완료: {len(df)}개 행")

# ───────────────────── 4) Oracle 연결 ──────────────────────────
print("\n🔗 Oracle 데이터베이스 연결 중...")

try:
    oracledb.init_oracle_client()  # 필요 시 lib_dir 지정

    with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
        print("✅ 데이터베이스 연결 성공")

        with conn.cursor() as cur:
            # MERGE 쿼리 (UPSERT) - STATS_ID 기준
            merge_sql = """
            MERGE INTO KEYWORD_DAILY_STATS kds
            USING (SELECT :1 AS STATS_ID,
                          :2 AS KEYWORD_ID,
                          :3 AS KEYWORD_NAME,
                          :4 AS DAILY_COUNT,
                          CASE
                            WHEN LENGTH(:5) = 10 AND :5 LIKE '____-__-__' THEN TO_DATE(:5, 'YYYY-MM-DD')
                            WHEN LENGTH(:5) = 19 AND :5 LIKE '____-__-__ __:__:__' THEN TO_DATE(:5, 'YYYY-MM-DD HH24:MI:SS')
                            ELSE TO_DATE('2024-08-05', 'YYYY-MM-DD')
                          END AS STATS_DATE FROM dual) src
            ON (kds.STATS_ID = src.STATS_ID)
            WHEN MATCHED THEN
                UPDATE SET kds.KEYWORD_ID = src.KEYWORD_ID,
                           kds.KEYWORD_NAME = src.KEYWORD_NAME,
                           kds.DAILY_COUNT = src.DAILY_COUNT,
                           kds.STATS_DATE = src.STATS_DATE
            WHEN NOT MATCHED THEN
                INSERT (STATS_ID, KEYWORD_ID, KEYWORD_NAME, DAILY_COUNT, STATS_DATE)
                VALUES (src.STATS_ID, src.KEYWORD_ID, src.KEYWORD_NAME, src.DAILY_COUNT, src.STATS_DATE)
            """

            # 데이터 준비
            data = []
            for _, row in df.iterrows():
                data.append((
                    int(row['STATS_ID']),
                    int(row['KEYWORD_ID']) if pd.notna(row['KEYWORD_ID']) else 0,
                    str(row['KEYWORD_NAME']),
                    int(row['DAILY_COUNT']) if pd.notna(row['DAILY_COUNT']) else 0,
                    str(row['STATS_DATE'])
                ))

            print(f"📤 총 {len(data)}개 행을 5,000개씩 배치 처리...")

            # 5,000개씩 배치 처리
            batch_size = 5000
            total_batches = (len(data) + batch_size - 1) // batch_size
            total_errors = 0

            for i in range(0, len(data), batch_size):
                batch_data = data[i:i + batch_size]
                batch_num = (i // batch_size) + 1

                print(f"🔄 배치 {batch_num}/{total_batches}: {len(batch_data)}개 행 처리 중...")

                try:
                    # 배치 실행
                    cur.executemany(merge_sql, batch_data, batcherrors=True)

                    # 개별 행 오류 출력
                    errors = cur.getbatcherrors()
                    if errors:
                        print(f"⚠️  배치 {batch_num}에서 {len(errors)}개 행 오류:")
                        for err in errors[:5]:  # 처음 5개만 출력
                            print(f"   [Row {err.offset}] {err.message}")
                        if len(errors) > 5:
                            print(f"   ... 외 {len(errors)-5}개 오류")
                        total_errors += len(errors)
                    else:
                        print(f"✅ 배치 {batch_num} 처리 성공")

                except Exception as e:
                    print(f"❌ 배치 {batch_num} 처리 실패: {e}")
                    total_errors += len(batch_data)

            print(f"📊 전체 처리 완료: {len(data) - total_errors}개 성공, {total_errors}개 실패")

        # 커밋
        conn.commit()
        print("✅ 트랜잭션 커밋 완료")

except oracledb.Error as e:
    print(f"❌ Oracle 오류: {e}")
    raise
except Exception as e:
    print(f"❌ 일반 오류: {e}")
    raise

print("\n🎉 KEYWORD_DAILY_STATS 테이블 업서트 완료!")
print(f"📊 처리된 통계: {len(df)}개")
print("=" * 50)