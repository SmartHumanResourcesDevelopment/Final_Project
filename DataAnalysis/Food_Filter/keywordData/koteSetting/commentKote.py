#!/usr/bin/env python3
# commentKote.py ─ 각 댓글 테이블에 직접 감성분석 결과 업데이트
#  - INSTAGRAM_COMMENT.EMOTIONS, YOUTUBE_COMMENT.EMOTIONS 컬럼에 직접 저장
#  - 5000개씩 배치 처리로 안전한 업데이트
#  - 긴 텍스트는 512토큰 초과 시 "분석불가" 처리
#  - 진행률 표시 및 에러 처리

import json
import warnings
import oracledb
from transformers import pipeline
from tqdm import tqdm
import time

# 워닝 억제
warnings.filterwarnings("ignore", message=".*sequence length.*")

# Instant Client Thick 모드
oracledb.init_oracle_client()

# M4 칩용 디바이스 설정
import torch

def get_device():
    """M4 칩에 최적화된 디바이스 선택"""
    if torch.backends.mps.is_available():
        print("🍎 Apple M4 MPS 사용")
        return "mps"
    elif torch.cuda.is_available():
        print("🔥 CUDA GPU 사용")
        return 0
    else:
        print("💻 CPU 사용")
        return -1

device = get_device()

# 감성분석기 초기화
print("🤖 KOTE 감성분석 모델 로딩 중...")
classifier = pipeline(
    "text-classification",
    model="searle-j/kote_for_easygoing_people",
    top_k=None,
    device=device
)
print("✅ 모델 로딩 완료!")

# DB 연결
print("🔗 데이터베이스 연결 중...")
conn = oracledb.connect(
    user="PARK",
    password="smhrd2",
    dsn="project-db-campus.smhrd.com:1523/XE"
)
cur = conn.cursor()
print("✅ 데이터베이스 연결 완료!")

# M4 칩에 최적화된 배치 크기 설정
BATCH_SIZE = 2000  # M4는 메모리가 제한적이므로 배치 크기 줄임

def analyze_emotion(text):
    """
    텍스트 감성분석 수행 (M4 최적화)
    """
    try:
        text_str = str(text or "").strip()
        if not text_str:
            return "[]"

        # 토큰 길이 체크
        tok = classifier.tokenizer(text_str, return_length=True)
        length_info = tok.get("length")
        length = length_info[0] if isinstance(length_info, list) else length_info

        if length > 512:
            return '["분석불가"]'

        # M4에서 메모리 효율적인 감성분석 수행
        with torch.no_grad():  # 메모리 절약
            scores = classifier(text_str)[0]

        # 0.5 이상 점수만 필터링
        filtered = [p for p in scores if p["score"] >= 0.5]

        if not filtered:
            return '["없음"]'

        # 감정 라벨들을 JSON 배열로 변환
        emotions = [p["label"] for p in filtered]
        return json.dumps(emotions, ensure_ascii=False)

    except RuntimeError as e:
        if "out of memory" in str(e).lower():
            print(f"⚠️ 메모리 부족: {e}")
            # M4에서 메모리 정리
            if torch.backends.mps.is_available():
                torch.mps.empty_cache()
            return '["메모리부족"]'
        else:
            print(f"⚠️ 런타임 오류: {e}")
            return '["분석실패"]'
    except Exception as e:
        print(f"⚠️ 감성분석 오류: {e}")
        return '["분석실패"]'

def process_instagram_comments():
    """
    Instagram 댓글 감성분석 처리
    """
    print("\n📸 Instagram 댓글 감성분석 시작...")

    # 전체 댓글 수 조회
    cur.execute("SELECT COUNT(*) FROM INSTAGRAM_COMMENT WHERE COMMENT_TEXT IS NOT NULL")
    total_count = cur.fetchone()[0]
    print(f"📊 총 Instagram 댓글 수: {total_count:,}개")

    if total_count == 0:
        print("⚠️ 처리할 Instagram 댓글이 없습니다.")
        return

    # 배치별로 처리
    processed = 0

    with tqdm(total=total_count, desc="Instagram 댓글 처리", unit="개") as pbar:
        while processed < total_count:
            # 배치 데이터 조회
            cur.execute("""
                SELECT COMMENT_ID, COMMENT_TEXT
                FROM (
                    SELECT COMMENT_ID, COMMENT_TEXT,
                           ROW_NUMBER() OVER (ORDER BY COMMENT_ID) as rn
                    FROM INSTAGRAM_COMMENT
                    WHERE COMMENT_TEXT IS NOT NULL
                )
                WHERE rn > :offset AND rn <= :limit
            """, {
                "offset": processed,
                "limit": processed + BATCH_SIZE
            })

            batch_data = cur.fetchall()
            if not batch_data:
                break

            # 배치 처리
            update_data = []
            for comment_id, comment_text in batch_data:
                emotions = analyze_emotion(comment_text)
                update_data.append((emotions, comment_id))

            # 배치 업데이트
            if update_data:
                cur.executemany("""
                    UPDATE INSTAGRAM_COMMENT
                    SET EMOTIONS = :emotions
                    WHERE COMMENT_ID = :comment_id
                """, update_data)

                conn.commit()
                pbar.update(len(update_data))
                processed += len(update_data)

                print(f"✅ Instagram 배치 완료: {processed:,}/{total_count:,}")

                # M4 메모리 정리
                if torch.backends.mps.is_available():
                    torch.mps.empty_cache()

                time.sleep(0.2)  # M4에서 더 긴 대기시간으로 안정성 확보

    print(f"🎉 Instagram 댓글 감성분석 완료: {processed:,}개")

def process_youtube_comments():
    """
    YouTube 댓글 감성분석 처리
    """
    print("\n🎥 YouTube 댓글 감성분석 시작...")

    # 전체 댓글 수 조회
    cur.execute("SELECT COUNT(*) FROM YOUTUBE_COMMENT WHERE COMMENT_TEXT IS NOT NULL")
    total_count = cur.fetchone()[0]
    print(f"📊 총 YouTube 댓글 수: {total_count:,}개")

    if total_count == 0:
        print("⚠️ 처리할 YouTube 댓글이 없습니다.")
        return

    # 배치별로 처리
    processed = 0

    with tqdm(total=total_count, desc="YouTube 댓글 처리", unit="개") as pbar:
        while processed < total_count:
            # 배치 데이터 조회
            cur.execute("""
                SELECT COMMENT_ID, COMMENT_TEXT
                FROM (
                    SELECT COMMENT_ID, COMMENT_TEXT,
                           ROW_NUMBER() OVER (ORDER BY COMMENT_ID) as rn
                    FROM YOUTUBE_COMMENT
                    WHERE COMMENT_TEXT IS NOT NULL
                )
                WHERE rn > :offset AND rn <= :limit
            """, {
                "offset": processed,
                "limit": processed + BATCH_SIZE
            })

            batch_data = cur.fetchall()
            if not batch_data:
                break

            # 배치 처리
            update_data = []
            for comment_id, comment_text in batch_data:
                emotions = analyze_emotion(comment_text)
                update_data.append((emotions, comment_id))

            # 배치 업데이트
            if update_data:
                cur.executemany("""
                    UPDATE YOUTUBE_COMMENT
                    SET EMOTIONS = :emotions
                    WHERE COMMENT_ID = :comment_id
                """, update_data)

                conn.commit()
                pbar.update(len(update_data))
                processed += len(update_data)

                print(f"✅ YouTube 배치 완료: {processed:,}/{total_count:,}")

                # M4 메모리 정리
                if torch.backends.mps.is_available():
                    torch.mps.empty_cache()

                time.sleep(0.2)  # M4에서 더 긴 대기시간으로 안정성 확보

    print(f"🎉 YouTube 댓글 감성분석 완료: {processed:,}개")

def main():
    """
    메인 실행 함수
    """
    start_time = time.time()

    print("=" * 60)
    print("🎯 댓글 감성분석 배치 처리 시작 (M4 최적화)")
    print(f"🖥️ 사용 디바이스: {device}")
    print(f"📦 배치 크기: {BATCH_SIZE:,}개")
    print("=" * 60)

    try:
        # Instagram 댓글 처리
        process_instagram_comments()

        # YouTube 댓글 처리
        process_youtube_comments()

        # 완료 메시지
        end_time = time.time()
        elapsed = end_time - start_time

        print("\n" + "=" * 60)
        print("🎉 모든 댓글 감성분석 완료!")
        print(f"⏱️ 총 소요시간: {elapsed:.2f}초")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ 처리 중 오류 발생: {e}")
        import traceback
        traceback.print_exc()

    finally:
        # DB 연결 종료
        cur.close()
        conn.close()
        print("🔗 데이터베이스 연결 종료")

if __name__ == "__main__":
    main()