#!/usr/bin/env python3
# keyword_upsert.py ─ Oracle KEYWORD 테이블 업서트 스크립트 (komoran 키워드 사전 사용)

import pandas as pd
import oracledb
from pathlib import Path

# ───────────────────── 1) Oracle 접속 정보 ──────────────────────
DB_USER     = "PARK"
DB_PASSWORD = "smhrd2"
DB_DSN      = "project-db-campus.smhrd.com:1523/XE"

# ───────────────────── 2) CSV 경로 ─────────────────────────────
BASE_DIR  = Path(__file__).resolve().parents[2]          # Food_Filter/code/DB → Food_Filter
CSV_PATH  = BASE_DIR / "komoran" / "resultDic" / "keyword_dictionary.csv"

print(f"📂 키워드 사전 경로: {CSV_PATH}")

# ───────────────────── 3) CSV 로드 & 전처리 ────────────────────
if not CSV_PATH.exists():
    raise FileNotFoundError(f"키워드 사전 파일이 없습니다: {CSV_PATH}")

df = pd.read_csv(CSV_PATH, encoding="utf-8-sig")
print(f"📊 원본 데이터: {len(df)}개 행")
print(f"📋 컬럼: {list(df.columns)}")

# 필요한 컬럼만 선택 및 컬럼명 매핑
column_mapping = {
    "keywordid": "KEYWORD_ID",
    "keywordname": "KEYWORD_NAME",
    "type": "TYPE",
    "priority": "PRIORITY"
}

# 컬럼명 변경
df = df.rename(columns=column_mapping)

# 필요한 컬럼만 선택 (KEYWORDUP 제외)
required_columns = ["KEYWORD_ID", "KEYWORD_NAME", "TYPE", "PRIORITY"]
df = df[required_columns]

# KEYWORDUP은 STATS 테이블에서 관리하므로 제외

# 데이터 타입 변환
df = df.astype({
    "KEYWORD_ID": "int64",
    "KEYWORD_NAME": "string",
    "TYPE": "string",
    "PRIORITY": "int64"
})

# 결측값 제거
df = df.dropna(subset=["KEYWORD_ID", "KEYWORD_NAME"])

# 중복 제거 (KEYWORD_ID 기준)
df = df.drop_duplicates(subset="KEYWORD_ID", keep="first")

print(f"✅ 전처리 완료: {len(df)}개 행")
print(f"📋 최종 컬럼: {list(df.columns)}")

# ───────────────────── 4) Oracle 연결 ──────────────────────────
print("\n🔗 Oracle 데이터베이스 연결 중...")

try:
    oracledb.init_oracle_client()  # 필요 시 lib_dir 지정

    with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
        print("✅ 데이터베이스 연결 성공")

        with conn.cursor() as cur:
            # MERGE 쿼리 (UPSERT) - KEYWORDUP 제외
            merge_sql = """
            MERGE INTO KEYWORD k
            USING (SELECT :1 AS KEYWORD_ID,
                          :2 AS KEYWORD_NAME,
                          :3 AS TYPE,
                          :4 AS PRIORITY FROM dual) src
            ON (k.KEYWORD_ID = src.KEYWORD_ID)
            WHEN MATCHED THEN
                UPDATE SET k.KEYWORD_NAME = src.KEYWORD_NAME,
                           k.TYPE         = src.TYPE,
                           k.PRIORITY     = src.PRIORITY
            WHEN NOT MATCHED THEN
                INSERT (KEYWORD_ID, KEYWORD_NAME, TYPE, PRIORITY)
                VALUES (src.KEYWORD_ID, src.KEYWORD_NAME, src.TYPE, src.PRIORITY)
            """

            # 데이터 준비 (KEYWORD_ID, KEYWORD_NAME, TYPE, PRIORITY 순서)
            data = []
            for _, row in df.iterrows():
                data.append((
                    int(row['KEYWORD_ID']),
                    str(row['KEYWORD_NAME']),
                    str(row['TYPE']),
                    int(row['PRIORITY'])
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

print("\n🎉 KEYWORD 테이블 업서트 완료!")
print(f"📊 처리된 키워드: {len(df)}개")
print("=" * 50)