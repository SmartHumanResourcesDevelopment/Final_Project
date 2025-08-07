#!/usr/bin/env python3 
# youtube_videos.py ─ Oracle YOUTUBE_VIDEO 테이블 업서트 스크립트
 
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
CSV_DIR   = BASE_DIR / "youtube_video_filter" / "keyword" / "matching"

print(f"📂 유튜브 데이터 경로: {CSV_DIR}")

# ───────────────────── 3) CSV 파일들 로드 & 전처리 ──────────────────── 
if not CSV_DIR.exists():
    raise FileNotFoundError(f"유튜브 데이터 디렉토리가 없습니다: {CSV_DIR}")

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
    "VIDEO_ID": "VIDEO_ID",
    "KEYWORD_ID": "KEYWORD_ID", 
    "TITLE": "TITLE",
    "DESCRIPTION": "DESCRIPTION",
    "CHANNEL_TITLE": "CHANNEL_TITLE",
    "PUBLISHED_AT": "PUBLISHED_AT",
    "VIEW_COUNT": "VIEW_COUNT",
    "LIKE_COUNT": "LIKE_COUNT",
    "COMMENT_COUNT": "COMMENT_COUNT",
    "PLATFORM": "PLATFORM"
}

# 존재하는 컬럼만 선택
available_columns = {k: v for k, v in required_columns.items() if k in df.columns}
df = df[list(available_columns.keys())]

# 컬럼명 변경 (필요시)
df = df.rename(columns=available_columns)

print(f"📋 선택된 컬럼: {list(df.columns)}")

# 데이터 전처리
# Oracle에서는 빈 문자열도 NULL로 처리되므로 기본값 설정
df['TITLE'] = df['TITLE'].fillna('#쇼츠, #shots')
df['DESCRIPTION'] = df['DESCRIPTION'].fillna('#쇼츠, #shots')
df['CHANNEL_TITLE'] = df['CHANNEL_TITLE'].fillna('#쇼츠, #shots')

# 빈 문자열이나 공백만 있는 경우도 기본값으로 변경
df.loc[df['TITLE'].astype(str).str.strip() == '', 'TITLE'] = '#쇼츠, #shots'
df.loc[df['DESCRIPTION'].astype(str).str.strip() == '', 'DESCRIPTION'] = '#쇼츠, #shots'
df.loc[df['CHANNEL_TITLE'].astype(str).str.strip() == '', 'CHANNEL_TITLE'] = '#쇼츠, #shots'

# VIDEO_ID가 NULL인 경우 제외 (필수값)
df = df.dropna(subset=['VIDEO_ID'])

# 데이터 타입 변환
df = df.astype({
    "VIDEO_ID": "string",
    "TITLE": "string", 
    "DESCRIPTION": "string",
    "CHANNEL_TITLE": "string",
    "PUBLISHED_AT": "string",
    "PLATFORM": "string"
})

# 숫자형 컬럼들은 숫자형으로 변환 (NULL 허용)
df['KEYWORD_ID'] = pd.to_numeric(df['KEYWORD_ID'], errors='coerce')
df['VIEW_COUNT'] = pd.to_numeric(df['VIEW_COUNT'], errors='coerce')
df['LIKE_COUNT'] = pd.to_numeric(df['LIKE_COUNT'], errors='coerce')
df['COMMENT_COUNT'] = pd.to_numeric(df['COMMENT_COUNT'], errors='coerce')

# 중복 제거 (VIDEO_ID 기준)
original_count = len(df)
df = df.drop_duplicates(subset="VIDEO_ID", keep="first")
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
            MERGE INTO YOUTUBE_VIDEO yv 
            USING (SELECT :1 AS VIDEO_ID, 
                          :2 AS KEYWORD_ID, 
                          :3 AS TITLE,
                          :4 AS DESCRIPTION,
                          :5 AS CHANNEL_TITLE,
                          TO_DATE(:6, 'YYYY-MM-DD') AS PUBLISHED_AT,
                          :7 AS VIEW_COUNT,
                          :8 AS LIKE_COUNT,
                          :9 AS COMMENT_COUNT,
                          :10 AS PLATFORM FROM dual) src 
            ON (yv.VIDEO_ID = src.VIDEO_ID) 
            WHEN MATCHED THEN 
                UPDATE SET yv.KEYWORD_ID = src.KEYWORD_ID, 
                           yv.TITLE = src.TITLE,
                           yv.DESCRIPTION = src.DESCRIPTION,
                           yv.CHANNEL_TITLE = src.CHANNEL_TITLE,
                           yv.PUBLISHED_AT = src.PUBLISHED_AT,
                           yv.VIEW_COUNT = src.VIEW_COUNT,
                           yv.LIKE_COUNT = src.LIKE_COUNT,
                           yv.COMMENT_COUNT = src.COMMENT_COUNT,
                           yv.PLATFORM = src.PLATFORM
            WHEN NOT MATCHED THEN 
                INSERT (VIDEO_ID, KEYWORD_ID, TITLE, DESCRIPTION, CHANNEL_TITLE, PUBLISHED_AT, VIEW_COUNT, LIKE_COUNT, COMMENT_COUNT, PLATFORM) 
                VALUES (src.VIDEO_ID, src.KEYWORD_ID, src.TITLE, src.DESCRIPTION, src.CHANNEL_TITLE, src.PUBLISHED_AT, src.VIEW_COUNT, src.LIKE_COUNT, src.COMMENT_COUNT, src.PLATFORM) 
            """
 
            # 데이터 준비
            data = []
            for _, row in df.iterrows():
                data.append((
                    str(row['VIDEO_ID']),
                    int(row['KEYWORD_ID']) if pd.notna(row['KEYWORD_ID']) else None,
                    str(row['TITLE']),
                    str(row['DESCRIPTION']),
                    str(row['CHANNEL_TITLE']),
                    str(row['PUBLISHED_AT']),
                    int(row['VIEW_COUNT']) if pd.notna(row['VIEW_COUNT']) else 0,
                    int(row['LIKE_COUNT']) if pd.notna(row['LIKE_COUNT']) else 0,
                    int(row['COMMENT_COUNT']) if pd.notna(row['COMMENT_COUNT']) else 0,
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

print("\n🎉 YOUTUBE_VIDEO 테이블 업서트 완료!")
print(f"📊 처리된 비디오: {len(df)}개")
print("=" * 50)
