#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KEYWORD_SIMILARITY 테이블 중복 제거 스크립트
INPUT_ID가 중복인 경우 REASON이 가장 긴 레코드만 남기고 나머지 삭제
"""

import os
from tqdm import tqdm
y
# Oracle 라이브러리 import (우선순위: oracledb -> cx_Oracle)
try:
    import oracledb
    ORACLE_LIB = "oracledb"
    print("📦 oracledb 라이브러리 사용")
except ImportError:
    try:
        import cx_Oracle as oracledb
        ORACLE_LIB = "cx_Oracle"
        print("📦 cx_Oracle 라이브러리 사용")
    except ImportError:
        print("❌ Oracle 라이브러리가 설치되지 않았습니다.")
        print("💡 설치 명령: pip install oracledb 또는 pip install cx_Oracle")
        exit(1)

# ───────────────────── Oracle 접속 정보 ──────────────────────
DB_USER     = "PARK"
DB_PASSWORD = "smhrd2"
DB_DSN      = "project-db-campus.smhrd.com:1523/XE"

def get_db_connection():
    """데이터베이스 연결"""
    try:
        print(f"🔗 {ORACLE_LIB} 라이브러리로 데이터베이스 연결 시도...")

        # oracledb 사용 시 thick 모드 초기화 시도
        if ORACLE_LIB == "oracledb":
            try:
                oracledb.init_oracle_client()
                print("🔧 Oracle thick 모드 초기화 성공")
            except Exception as init_error:
                print(f"⚠️ Oracle thick 모드 초기화 실패, thin 모드로 시도: {init_error}")

        # 데이터베이스 연결
        if ORACLE_LIB == "cx_Oracle":
            # cx_Oracle 방식
            connection = oracledb.connect(f"{DB_USER}/{DB_PASSWORD}@{DB_DSN}")
        else:
            # oracledb 방식
            connection = oracledb.connect(
                user=DB_USER,
                password=DB_PASSWORD,
                dsn=DB_DSN
            )

        print("✅ 데이터베이스 연결 성공")
        return connection

    except Exception as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        print("💡 해결 방법:")
        print("   1. Oracle Instant Client 설치")
        print("   2. 다른 Oracle 라이브러리 시도: pip install cx_Oracle")
        print("   3. 데이터베이스 서버 상태 확인")
        print("   4. 네트워크 연결 확인")
        return None

def analyze_duplicates(connection):
    """중복 데이터 분석"""
    try:
        
        cursor = connection.cursor()

        # INPUT_ID별 중복 개수 조회
        query = """
        SELECT
            INPUT_ID,
            COUNT(*) as duplicate_count
        FROM KEYWORD_SIMILARITY
        GROUP BY INPUT_ID
        HAVING COUNT(*) > 1
        ORDER BY COUNT(*) DESC
        """

        cursor.execute(query)
        duplicates = cursor.fetchall()

        print(f"📊 중복된 INPUT_ID 개수: {len(duplicates)}")

        total_duplicates = 0
        for input_id, count in duplicates:
            total_duplicates += (count - 1)  # 삭제될 레코드 수
            print(f"   INPUT_ID {input_id}: {count}개 (삭제 예정: {count-1}개)")

        print(f"📊 총 삭제 예정 레코드 수: {total_duplicates}")

        cursor.close()
        return duplicates

    except Exception as e:
        print(f"❌ 중복 분석 실패: {e}")
        return []

def get_records_to_delete(connection, input_id):
    """특정 INPUT_ID의 삭제 대상 레코드 조회"""
    try:
        cursor = connection.cursor()

        # REASON 길이 기준으로 정렬하여 가장 긴 것 제외하고 나머지 조회
        query = """
        SELECT ID, INPUT_ID, LENGTH(REASON) as reason_length
        FROM KEYWORD_SIMILARITY
        WHERE INPUT_ID = :input_id
        ORDER BY LENGTH(REASON) DESC, ID ASC
        """

        cursor.execute(query, {'input_id': input_id})
        records = cursor.fetchall()

        # 첫 번째(가장 긴 REASON)를 제외하고 나머지 반환
        records_to_delete = records[1:] if len(records) > 1 else []

        cursor.close()
        return records_to_delete

    except Exception as e:
        print(f"❌ 삭제 대상 조회 실패 (INPUT_ID: {input_id}): {e}")
        return []

def delete_duplicate_records(connection, dry_run=True):
    """중복 레코드 삭제"""
    try:
        # 중복 데이터 분석
        duplicates = analyze_duplicates(connection)

        if not duplicates:
            print("✅ 중복 데이터가 없습니다.")
            return

        # 사용자 확인
        if not dry_run:
            confirm = input(f"\n정말로 {len(duplicates)}개 INPUT_ID의 중복 레코드를 삭제하시겠습니까? (y/N): ")
            if confirm.lower() != 'y':
                print("❌ 삭제 작업이 취소되었습니다.")
                return

        cursor = connection.cursor()
        total_deleted = 0

        print(f"\n{'🔍 [DRY RUN]' if dry_run else '🗑️ [실제 삭제]'} 중복 레코드 처리 시작...")

        # 각 중복 INPUT_ID 처리
        for input_id, count in tqdm(duplicates, desc="중복 처리"):
            # 삭제 대상 레코드 조회
            records_to_delete = get_records_to_delete(connection, input_id)

            if not records_to_delete:
                continue

            # 삭제 대상 정보 출력
            print(f"\n📋 INPUT_ID {input_id} 처리:")
            print(f"   총 레코드: {count}개")
            print(f"   삭제 대상: {len(records_to_delete)}개")

            for record_id, _, reason_length in records_to_delete:
                print(f"   - ID {record_id} (REASON 길이: {reason_length})")

            # 실제 삭제 (dry_run이 False인 경우만)
            if not dry_run:
                for record_id, _, _ in records_to_delete:
                    delete_query = "DELETE FROM KEYWORD_SIMILARITY WHERE ID = :record_id"
                    cursor.execute(delete_query, {'record_id': record_id})
                    total_deleted += 1

        if not dry_run:
            # 커밋
            connection.commit()
            print(f"\n✅ 총 {total_deleted}개 레코드 삭제 완료")
        else:
            print(f"\n🔍 DRY RUN 완료 - 실제로는 {sum(len(get_records_to_delete(connection, input_id)) for input_id, _ in duplicates)}개 레코드가 삭제될 예정")

        cursor.close()

    except Exception as e:
        print(f"❌ 삭제 작업 실패: {e}")
        if not dry_run:
            connection.rollback()

def verify_cleanup(connection):
    """정리 결과 확인"""
    try:
        cursor = connection.cursor()

        # 중복 확인
        query = """
        SELECT COUNT(*) as duplicate_count
        FROM (
            SELECT INPUT_ID
            FROM KEYWORD_SIMILARITY
            GROUP BY INPUT_ID
            HAVING COUNT(*) > 1
        )
        """

        cursor.execute(query)
        duplicate_count = cursor.fetchone()[0]

        # 전체 레코드 수 확인
        cursor.execute("SELECT COUNT(*) FROM KEYWORD_SIMILARITY")
        total_count = cursor.fetchone()[0]

        print(f"\n📊 정리 결과:")
        print(f"   전체 레코드 수: {total_count}")
        print(f"   중복 INPUT_ID 수: {duplicate_count}")

        if duplicate_count == 0:
            print("✅ 모든 중복이 성공적으로 제거되었습니다!")
        else:
            print("⚠️ 아직 중복이 남아있습니다.")

        cursor.close()

    except Exception as e:
        print(f"❌ 결과 확인 실패: {e}")

def test_connection():
    """데이터베이스 연결 테스트"""
    print("🧪 데이터베이스 연결 테스트")
    print("-" * 40)

    connection = get_db_connection()
    if not connection:
        return False

    try:
        cursor = connection.cursor()
        cursor.execute("SELECT COUNT(*) FROM KEYWORD_SIMILARITY")
        count = cursor.fetchone()[0]
        print(f"✅ KEYWORD_SIMILARITY 테이블 레코드 수: {count}")
        cursor.close()
        connection.close()
        return True
    except Exception as e:
        print(f"❌ 테이블 접근 실패: {e}")
        connection.close()
        return False

def main():
    """메인 함수"""
    print("🗑️ KEYWORD_SIMILARITY 테이블 중복 제거 스크립트")
    print("=" * 60)
    print(f"📡 연결 정보: {DB_USER}@{DB_DSN}")

    # 연결 테스트 먼저 실행
    if not test_connection():
        print("\n❌ 데이터베이스 연결 테스트 실패")
        print("💡 cx_Oracle 설치 시도: pip install cx_Oracle")
        return

    # 데이터베이스 연결
    connection = get_db_connection()
    if not connection:
        return

    try:
        # 1. 현재 상태 확인
        print("\n1️⃣ 현재 중복 상태 분석...")
        verify_cleanup(connection)

        # 2. DRY RUN (실제 삭제하지 않고 시뮬레이션)
        print("\n2️⃣ DRY RUN 실행...")
        delete_duplicate_records(connection, dry_run=True)

        # 3. 실제 삭제 여부 확인
        print("\n3️⃣ 실제 삭제 실행 여부 선택")
        choice = input("실제 삭제를 진행하시겠습니까? (y/N): ")

        if choice.lower() == 'y':
            # 4. 실제 삭제 실행
            print("\n4️⃣ 실제 삭제 실행...")
            delete_duplicate_records(connection, dry_run=False)

            # 5. 결과 확인
            print("\n5️⃣ 최종 결과 확인...")
            verify_cleanup(connection)
        else:
            print("❌ 실제 삭제가 취소되었습니다.")

    finally:
        connection.close()
        print("\n✅ 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()

def main():
    """메인 함수"""
    print("🗑️ KEYWORD_SIMILARITY 테이블 중복 제거 스크립트")
    print("=" * 60)

    # 데이터베이스 연결
    connection = get_db_connection()
    if not connection:
        return

    try:
        # 1. 현재 상태 확인
        print("\n1️⃣ 현재 중복 상태 분석...")
        verify_cleanup(connection)

        # 2. DRY RUN (실제 삭제하지 않고 시뮬레이션)
        print("\n2️⃣ DRY RUN 실행...")
        delete_duplicate_records(connection, dry_run=True)

        # 3. 실제 삭제 여부 확인
        print("\n3️⃣ 실제 삭제 실행 여부 선택")
        choice = input("실제 삭제를 진행하시겠습니까? (y/N): ")

        if choice.lower() == 'y':
            # 4. 실제 삭제 실행
            print("\n4️⃣ 실제 삭제 실행...")
            delete_duplicate_records(connection, dry_run=False)

            # 5. 결과 확인
            print("\n5️⃣ 최종 결과 확인...")
            verify_cleanup(connection)
        else:
            print("❌ 실제 삭제가 취소되었습니다.")

    finally:
        connection.close()
        print("\n✅ 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()