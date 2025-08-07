# 인스타 키워드 음식과 관련 키워드로 추출
# 1) 환경 준비
# pip install pandas transformers
import torch
import pandas as pd
from transformers import pipeline

#assert torch.cuda.is_available(), "CUDA가 활성화된 PyTorch가 필요합니다!"

def filter_and_save_food_posts(input_csv: str,
                               output_csv: str,
                               threshold: float = 0.8,
                               device: int = 0):
    """
    Zero-Shot 멀티-라벨 분류로 음식 관련(식문화) 포스트만 CSV로 저장
    :param input_csv: 원본 CSV 경로
    :param output_csv: 결과 CSV 경로
    :param threshold: 레이블별 확률 임계치
    :param device: GPU 인덱스(0 이상) 또는 CPU-only일 땐 -1
    """
    df = pd.read_csv(input_csv, encoding='utf-8-sig', parse_dates=['작성일'])

    # 멀티-라벨 Zero-Shot 분류기
    classifier = pipeline(
        "zero-shot-classification",
        model="joeddav/xlm-roberta-large-xnli",
        device=device,
        multi_label=True    # ★ multi-label 모드 활성화
    )

    # “food 계열” 레이블들 + “non-food”
    candidate_labels = ["food", "dessert", "snack", "beverage", "meal","korean food", "non-food"]
    food_labels = set(candidate_labels) - {"non-food"}

    is_food = []
    for text, tags in zip(df['POST_TEXT'].astype(str), df['HASHTAGS'].fillna('')):
        combined = text + " " + tags
        out = classifier(combined, candidate_labels)
        # out["labels"] 순서대로 out["scores"]
        label2score = dict(zip(out["labels"], out["scores"]))
        # food 계열 중 최고 점수
        best_food_score = max(label2score[l] for l in food_labels)
        is_food.append(best_food_score >= threshold)

    df['is_food'] = is_food
    df_food = df[df['is_food']].copy()

    # 원본 5개 컬럼만 저장
    cols = ['작성일','좋아요 수','본문','해시태그','댓글 목록']
    df_food[cols].to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"✅ {len(df_food)}개 포스트 필터링 완료: '{output_csv}'")

if __name__ == "__main__":
    filter_and_save_food_posts(
        input_csv="instargram_infu/toctocsia.csv",
        output_csv="DB/Filtered/toctocsia_filtered_food_posts.csv",
        threshold=0.5,
        device=0   # GPU 사용: 0, CPU-only: -1
    )
