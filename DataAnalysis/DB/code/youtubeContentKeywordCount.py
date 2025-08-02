#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pathlib import Path
import glob
import pandas as pd
from konlpy.tag import Okt
from transformers import pipeline
from collections import Counter
from tqdm import tqdm

# ───────────────────── 0. 설정 ─────────────────────
BASE_DIR        = Path(__file__).resolve().parent.parent
INPUT_PATTERN   = str(BASE_DIR / "filter" / "keyword" / "*_youtube_nouns.csv")
OUTPUT_DIR      = BASE_DIR / "filter" / "keyword" / "filter"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Zero‐shot 분류를 위한 라벨과 배치 사이즈 설정
CANDIDATE_LABELS = [
    "food", "dessert", "snack",
    "beverage", "meal", "korean food",
    "non-food",
]
BATCH_SIZE = 32  # GPU 메모리에 맞춰 조정

# ──────────────────── 1. 형태소 분석기는 이미 완료된 명사 CSV를 읽기만 함 ────────────────────
okt = Okt()

# ──────────────────── 2. zero-shot 분류기 초기화 ────────────────────
classifier = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    device=0,             # GPU/MPS 사용: 0, CPU만 쓰려면 -1
    batch_size=BATCH_SIZE,
    truncation=True
)

# ──────────────────── 3. 모든 명사 등장 횟수 누적 ────────────────────
mention_counter = Counter()
noun_files = glob.glob(INPUT_PATTERN)
print(f"🔍 처리할 명사 CSV 파일 수: {len(noun_files)}\n")

for fp in tqdm(noun_files, desc="명사 CSV 순회"):
    df = pd.read_csv(fp, encoding="utf-8-sig")
    # 각 행의 'NOUN' 컬럼 값이 명사
    mention_counter.update(df["NOUN"].dropna().astype(str).tolist())

# ──────────────────── 4. detailed zero-shot 분류 & 필터링 ────────────────────
unique_nouns = list(mention_counter.keys())
food_nouns = []
noun_batches = [
    unique_nouns[i : i + BATCH_SIZE]
    for i in range(0, len(unique_nouns), BATCH_SIZE)
]

for batch in tqdm(noun_batches, desc="음식 카테고리 분류"):
    # batch 단위로 분류 호출
    results = classifier(batch, candidate_labels=CANDIDATE_LABELS)
    for noun, res in zip(batch, results):
        top_label = res["labels"][0]  # 가장 높은 점수의 라벨
        # 'non-food'가 아니면 음식 카테고리로 간주
        if top_label != "non-food":
            food_nouns.append(noun)

# ──────────────────── 5. 결과 DataFrame 생성 & 저장 ────────────────────
kw_df = pd.DataFrame({
    "KEYWORD_ID":   range(1, len(food_nouns) + 1),
    "KEYWORD_NAME": food_nouns,
    "KEYWORDUP":    [mention_counter[w] for w in food_nouns]
})

output_file = OUTPUT_DIR / "keyword_mentions.csv"
kw_df.to_csv(output_file, index=False, encoding="utf-8-sig")

print(f"\n✅ '{output_file.name}' 생성 완료 ({len(food_nouns)}개 음식 키워드)\n")
