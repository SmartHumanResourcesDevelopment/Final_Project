#!/usr/bin/env python3
# youtube_comment.py ─ Oracle YOUTUBE_COMMENT 테이블 업서트 스크립트

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
CSV_DIR   = BASE_DIR / "youtube_video_filter" / "comment" / "filtered"

print(f"📂 유튜브 댓글 데이터 경로: {CSV_DIR}")

# ───────────────────── 3) CSV 파일들 로드 & 전처리 ────────────────────
if not CSV_DIR.exists():
    raise FileNotFoundError(f"유튜브 댓글 데이터 디렉토리가 없습니다: {CSV_DIR}")

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
    "VIDEO_ID": "VIDEO_ID",
    "AUTHOR_NAME": "AUTHOR_NAME",
    "COMMENT_TEXT": "COMMENT_TEXT",
    "PUBLISHED_AT": "PUBLISHED_AT"
}

# 존재하는 컬럼만 선택
available_columns = {k: v for k, v in required_columns.items() if k in df.columns}
df = df[list(available_columns.keys())]

# 컬럼명 변경 (필요시)
df = df.rename(columns=available_columns)

print(f"📋 선택된 컬럼: {list(df.columns)}")

# 데이터 전처리
# Oracle에서는 빈 문자열도 NULL로 처리되므로 기본값 설정
df['VIDEO_ID'] = df['VIDEO_ID'].fillna('#쇼츠, #shots')
df['AUTHOR_NAME'] = df['AUTHOR_NAME'].fillna('#쇼츠, #shots')
df['COMMENT_TEXT'] = df['COMMENT_TEXT'].fillna('#쇼츠, #shots')
df['PUBLISHED_AT'] = df['PUBLISHED_AT'].fillna('2024-08-05')

# 빈 문자열이나 공백만 있는 경우도 기본값으로 변경
df.loc[df['VIDEO_ID'].astype(str).str.strip() == '', 'VIDEO_ID'] = '#쇼츠, #shots'
df.loc[df['AUTHOR_NAME'].astype(str).str.strip() == '', 'AUTHOR_NAME'] = '#쇼츠, #shots'
df.loc[df['COMMENT_TEXT'].astype(str).str.strip() == '', 'COMMENT_TEXT'] = '#쇼츠, #shots'
df.loc[df['PUBLISHED_AT'].astype(str).str.strip() == '', 'PUBLISHED_AT'] = '2024-08-05'

# 날짜 형식 정규화
def normalize_date(date_str):
    """날짜 문자열을 YYYY-MM-DD 형식으로 정규화"""
    try:
        date_str = str(date_str).strip()
        if len(date_str) >= 10:
            # YYYY-MM-DD 형식으로 자르기
            return date_str[:10]
        else:
            return '2024-08-05'
    except:
        return '2024-08-05'

df['PUBLISHED_AT'] = df['PUBLISHED_AT'].apply(normalize_date)
print(f"📅 날짜 샘플: {df['PUBLISHED_AT'].head().tolist()}")

# COMMENT_ID가 NULL인 경우 제외 (필수값)
df = df.dropna(subset=['COMMENT_ID'])
print(f"📊 COMMENT_ID NULL 제거 후: {len(df)}개 행")

# COMMENT_ID 데이터 확인
print(f"📋 COMMENT_ID 샘플: {df['COMMENT_ID'].head().tolist()}")
print(f"📋 COMMENT_ID 타입: {df['COMMENT_ID'].dtype}")

# COMMENT_ID를 문자열로 처리 (숫자가 아닐 수 있음)
df['COMMENT_ID'] = df['COMMENT_ID'].astype(str)

# 빈 COMMENT_ID 제거
df = df[df['COMMENT_ID'].str.strip() != '']
df = df[df['COMMENT_ID'] != 'nan']
print(f"📊 빈 COMMENT_ID 제거 후: {len(df)}개 행")

# 데이터 타입 변환
df = df.astype({
    "VIDEO_ID": "string",
    "AUTHOR_NAME": "string",
    "COMMENT_TEXT": "string",
    "PUBLISHED_AT": "string"
})

# 데이터 길이 확인
print(f"📏 COMMENT_ID 최대 길이: {df['COMMENT_ID'].str.len().max()}")
print(f"📏 VIDEO_ID 최대 길이: {df['VIDEO_ID'].str.len().max()}")
print(f"📏 AUTHOR_NAME 최대 길이: {df['AUTHOR_NAME'].str.len().max()}")
print(f"📏 COMMENT_TEXT 최대 길이: {df['COMMENT_TEXT'].str.len().max()}")

# COMMENT_TEXT 길이 제한 (CLOB이지만 Oracle 바인딩 제한 고려)
max_comment_length = 4000  # Oracle CLOB 바인딩 안전 길이
long_comments = df['COMMENT_TEXT'].str.len() > max_comment_length
if long_comments.any():
    print(f"⚠️ {long_comments.sum()}개 댓글이 {max_comment_length}자를 초과합니다.")
    df.loc[long_comments, 'COMMENT_TEXT'] = df.loc[long_comments, 'COMMENT_TEXT'].str[:max_comment_length]
    print(f"📏 COMMENT_TEXT 길이 제한 후 최대: {df['COMMENT_TEXT'].str.len().max()}")

# COMMENT_ID 스마트 자르기 함수
def smart_truncate_comment_id(comment_id, max_length=4000):
    """핵심 부분(영어_날짜_카운터)을 보존하고 앞부분만 자름"""
    try:
        comment_id = str(comment_id)
        if len(comment_id) <= max_length:
            return comment_id

        import re

        # 핵심 패턴 찾기: 영어단어들_날짜_c숫자
        # 예: weird_sweets_shop_20250223_c523
        core_pattern = re.search(r'[a-zA-Z][a-zA-Z0-9_]*_\d{8}_c\d+$', comment_id)

        if core_pattern:
            # 핵심 부분 추출
            core_part = core_pattern.group()
            core_start = core_pattern.start()

            # 핵심 부분이 이미 길이 제한을 초과하는 경우
            if len(core_part) > max_length:
                print(f"⚠️ 핵심 부분이 너무 김: {len(core_part)}자")
                return core_part[:max_length]

            # 앞부분에서 사용 가능한 길이
            available_length = max_length - len(core_part)

            if available_length <= 0:
                # 핵심 부분만 반환
                return core_part

            # 앞부분을 단어 경계에서 자르기
            front_part = comment_id[:core_start]

            if len(front_part) <= available_length:
                # 앞부분이 길이 제한 내에 있음
                return comment_id

            # 앞부분을 단어 단위로 자르기
            words = front_part.rstrip('_').split('_')  # 마지막 _ 제거 후 분할
            truncated_words = []
            current_length = 0

            for word in words:
                # 다음 단어를 추가했을 때의 길이 (언더스코어 포함)
                word_length = len(word) + (1 if truncated_words else 0)

                if current_length + word_length <= available_length - 1:  # 연결용 _ 고려
                    truncated_words.append(word)
                    current_length += word_length
                else:
                    break

            # 결과 조합
            if truncated_words:
                result = '_'.join(truncated_words) + '_' + core_part
                return result
            else:
                # 앞부분을 모두 제거하고 핵심 부분만
                return core_part

        # 핵심 패턴이 없으면 단순 카운터만 찾기
        counter_match = re.search(r'_c\d+$', comment_id)
        if counter_match:
            counter_part = counter_match.group()
            available_length = max_length - len(counter_part)

            if available_length > 0:
                front_part = comment_id[:counter_match.start()]
                if len(front_part) <= available_length:
                    return comment_id
                else:
                    return front_part[:available_length] + counter_part

        # 패턴이 없으면 뒤에서부터 자르기 (뒷부분이 더 중요)
        return comment_id[-max_length:]

    except Exception as e:
        print(f"⚠️ COMMENT_ID 자르기 오류: {e}")
        return str(comment_id)[-max_length:]  # 뒤에서부터 자르기

# 데이터 길이 제한 (Oracle 컬럼 크기에 맞춤)
print("🔄 COMMENT_ID 스마트 자르기 적용 중...")
df['COMMENT_ID'] = df['COMMENT_ID'].apply(lambda x: smart_truncate_comment_id(x, 4000))
df['VIDEO_ID'] = df['VIDEO_ID'].str[:2500]      # VARCHAR2(2500)
df['AUTHOR_NAME'] = df['AUTHOR_NAME'].str[:2000] # VARCHAR2(2000)
# COMMENT_TEXT는 CLOB이므로 제한 없음

print(f"📏 길이 제한 후:")
print(f"   COMMENT_ID 최대: {df['COMMENT_ID'].str.len().max()}")
print(f"   VIDEO_ID 최대: {df['VIDEO_ID'].str.len().max()}")
print(f"   AUTHOR_NAME 최대: {df['AUTHOR_NAME'].str.len().max()}")

# 자르기 예시 출력
long_ids = df[df['COMMENT_ID'].str.len() > 3900]['COMMENT_ID'].head(3)
if len(long_ids) > 0:
    print(f"📋 자르기 적용 예시:")
    for i, comment_id in enumerate(long_ids, 1):
        print(f"   {i}. ...{comment_id[-50:]} (길이: {len(comment_id)})")

# 중복 제거 (COMMENT_ID 기준만)
original_count = len(df)
df = df.drop_duplicates(subset="COMMENT_ID", keep="first")
print(f"🔄 중복 제거 (COMMENT_ID 기준): {original_count}개 → {len(df)}개 행")

print(f"✅ 전처리 완료: {len(df)}개 행")

# ───────────────────── 4) Oracle 연결 ──────────────────────────
print("\n🔗 Oracle 데이터베이스 연결 중...")

try:
    oracledb.init_oracle_client()  # 필요 시 lib_dir 지정

    with oracledb.connect(user=DB_USER, password=DB_PASSWORD, dsn=DB_DSN) as conn:
        print("✅ 데이터베이스 연결 성공")

        with conn.cursor() as cur:
            # CLOB 문제 해결을 위한 2단계 처리
            # 1단계: CLOB 없이 기본 데이터 MERGE
            merge_sql = """
            MERGE INTO YOUTUBE_COMMENT yc
            USING (SELECT :1 AS COMMENT_ID,
                          :2 AS VIDEO_ID,
                          :3 AS AUTHOR_NAME,
                          CASE
                            WHEN LENGTH(:4) = 10 AND :4 LIKE '____-__-__' THEN TO_DATE(:4, 'YYYY-MM-DD')
                            WHEN LENGTH(:4) = 19 AND :4 LIKE '____-__-__ __:__:__' THEN TO_DATE(:4, 'YYYY-MM-DD HH24:MI:SS')
                            ELSE TO_DATE('2024-08-05', 'YYYY-MM-DD')
                          END AS PUBLISHED_AT FROM dual) src
            ON (yc.COMMENT_ID = src.COMMENT_ID)
            WHEN MATCHED THEN
                UPDATE SET yc.VIDEO_ID = src.VIDEO_ID,
                           yc.AUTHOR_NAME = src.AUTHOR_NAME,
                           yc.PUBLISHED_AT = src.PUBLISHED_AT
            WHEN NOT MATCHED THEN
                INSERT (COMMENT_ID, VIDEO_ID, AUTHOR_NAME, COMMENT_TEXT, PUBLISHED_AT)
                VALUES (src.COMMENT_ID, src.VIDEO_ID, src.AUTHOR_NAME, EMPTY_CLOB(), src.PUBLISHED_AT)
            """

            # 2단계: CLOB 업데이트
            update_clob_sql = """
            UPDATE YOUTUBE_COMMENT
            SET COMMENT_TEXT = :1
            WHERE COMMENT_ID = :2
            """

            # 데이터 준비 - 2단계 처리용
            merge_data = []  # 1단계: 기본 데이터
            clob_data = []   # 2단계: CLOB 데이터

            for _, row in df.iterrows():
                comment_text = str(row['COMMENT_TEXT'])
                if len(comment_text) > 4000:
                    comment_text = comment_text[:4000]

                # 1단계 데이터 (CLOB 제외)
                merge_data.append((
                    str(row['COMMENT_ID']),
                    str(row['VIDEO_ID']),
                    str(row['AUTHOR_NAME']),
                    str(row['PUBLISHED_AT'])
                ))

                # 2단계 데이터 (CLOB만)
                clob_data.append((
                    comment_text,
                    str(row['COMMENT_ID'])
                ))

            print(f"📤 총 {len(merge_data)}개 행을 2단계로 5,000개씩 배치 처리...")

            # 5,000개씩 배치 처리
            batch_size = 5000
            total_batches = (len(merge_data) + batch_size - 1) // batch_size
            total_errors = 0

            # 1단계: 기본 데이터 MERGE
            print("🔄 1단계: 기본 데이터 처리...")
            for i in range(0, len(merge_data), batch_size):
                batch_data = merge_data[i:i + batch_size]
                batch_num = (i // batch_size) + 1

                print(f"   배치 {batch_num}/{total_batches}: {len(batch_data)}개 행...")

                try:
                    cur.executemany(merge_sql, batch_data, batcherrors=True)
                    errors = cur.getbatcherrors()
                    if errors:
                        print(f"   ⚠️ {len(errors)}개 오류")
                        total_errors += len(errors)
                    else:
                        print(f"   ✅ 성공")
                except Exception as e:
                    print(f"   ❌ 실패: {e}")
                    total_errors += len(batch_data)

            # 2단계: CLOB 데이터 업데이트
            print("🔄 2단계: CLOB 데이터 처리...")
            clob_errors = 0
            for i in range(0, len(clob_data), batch_size):
                batch_data = clob_data[i:i + batch_size]
                batch_num = (i // batch_size) + 1

                print(f"   배치 {batch_num}/{total_batches}: {len(batch_data)}개 행...")

                try:
                    cur.executemany(update_clob_sql, batch_data, batcherrors=True)
                    errors = cur.getbatcherrors()
                    if errors:
                        print(f"   ⚠️ {len(errors)}개 오류")
                        clob_errors += len(errors)
                    else:
                        print(f"   ✅ 성공")
                except Exception as e:
                    print(f"   ❌ 실패: {e}")
                    clob_errors += len(batch_data)

            print(f"📊 처리 완료:")
            print(f"   1단계: {len(merge_data) - total_errors}개 성공, {total_errors}개 실패")
            print(f"   2단계: {len(clob_data) - clob_errors}개 성공, {clob_errors}개 실패")

        # 커밋
        conn.commit()
        print("✅ 트랜잭션 커밋 완료")

except oracledb.Error as e:
    print(f"❌ Oracle 오류: {e}")
    raise
except Exception as e:
    print(f"❌ 일반 오류: {e}")
    raise

print("\n🎉 YOUTUBE_COMMENT 테이블 업서트 완료!")
print(f"📊 처리된 댓글: {len(df)}개")
print("=" * 50)