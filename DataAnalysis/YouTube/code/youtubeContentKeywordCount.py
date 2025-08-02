# 음식 키워드만 분류 시키기 KEYWORD_ID,KEYWORD_NAME,KEYWORDUP 셀로 저장시키고
# 중복된 단어는 언급량 증가 시키는 로직
# 진행바 나오도록 코드 로직 작성
#  keyword/filter아래 csv파일 형식으로 정제하기
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
INPUT_PATTERN   = str(BASE_DIR / "filter" / "keyword" / "*_youtube_nouns.csv")   # 입력 CSV 패턴
OUTPUT_DIR      = BASE_DIR / "filter" / "keyword" / "filter"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ──────────────────── 1. 형태소 분석기 & 분류기 초기화 ────────────────────
okt = Okt()
zs = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    candidate_labels=["음식", "비음식"],
    device=-1    # macOS MPS 지원 시 CPU(MPS) 사용
)

def is_food(word: str, threshold: float = 0.5) -> bool:
    out = zs(word)
    # 최상위 라벨이 '음식'인지 혹은 리스트에서 '음식' 점수가 threshold 이상인지 판별
    if out["labels"][0] == "음식":
        return out["scores"][0] >= threshold
    idx = out["labels"].index("음식")
    return out["scores"][idx] >= threshold

# ──────────────────── 2. 전처리: 모든 명사 등장 횟수 누적 ────────────────────
mention_counter = Counter()
file_paths = glob.glob(INPUT_PATTERN)

print(f"🔍 처리할 명사 CSV 파일 수: {len(file_paths)}\n")
for fp in tqdm(file_paths, desc="파일 순회"):
    df = pd.read_csv(fp, encoding="utf-8-sig")
    # 'NOUN' 컬럼에 추출된 명사가 한 행마다 들어있다고 가정
    mention_counter.update(df["NOUN"].dropna().astype(str).tolist())

# ──────────────────── 3. 음식 키워드 분류 및 필터링 ────────────────────
unique_nouns = list(mention_counter.keys())
food_nouns = []

for noun in tqdm(unique_nouns, desc="음식 키워드 분류"):
    if is_food(noun):
        food_nouns.append(noun)

# ──────────────────── 4. 결과 DataFrame 생성 및 저장 ────────────────────
kw_df = pd.DataFrame({
    "KEYWORD_ID":   range(1, len(food_nouns) + 1),
    "KEYWORD_NAME": food_nouns,
    "MENTION_CNT":  [mention_counter[w] for w in food_nouns]
})

output_file = OUTPUT_DIR / "keyword_mentions.csv"
kw_df.to_csv(output_file, index=False, encoding="utf-8-sig")

print(f"\n✅ '{output_file.name}' 생성 완료 ({len(food_nouns)}개 음식 키워드)\n")
