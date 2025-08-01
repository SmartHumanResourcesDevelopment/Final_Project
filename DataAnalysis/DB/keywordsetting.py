#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
5개 인스타 CSV → keyword_table.csv
(KEYWORD_ID, KEYWORD_NAME, KEYWORDUP)
"""

from pathlib import Path
from collections import Counter
import pandas as pd
from transformers import pipeline
from tqdm.auto import tqdm

# ──────────────────────────────
# 0) 설정
# ──────────────────────────────
BATCH_SIZE = 32
threshold  = 0.4
candidate_labels = [
    "food", "dessert", "snack",
    "beverage", "meal", "korean food",
    "non-food",
]

classifier = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    device=0,
    batch_size=BATCH_SIZE,
    truncation=True,
)

BASE_DIR = Path(__file__).resolve().parent
CSV_DIR  = BASE_DIR / "Filtered"
CSV_FILES = sorted(CSV_DIR.glob("*_filtered_food_posts.csv"))

# ──────────────────────────────
# 1) 헬퍼
# ──────────────────────────────
def read_csv(path: Path) -> pd.DataFrame:
    for enc in ("utf-8-sig", "cp949", "euc-kr"):
        try:
            return pd.read_csv(path, encoding=enc)
        except UnicodeDecodeError:
            continue
    return pd.read_csv(path, encoding="latin1")


def chunk(lst, size):
    """non-empty batch generator"""
    for i in range(0, len(lst), size):
        batch = lst[i : i + size]
        if batch:                      # ← 빈 리스트면 skip
            yield batch


# ──────────────────────────────
# 2) 메인 루프
# ──────────────────────────────
classification_cache = {}     # tag → is_food
keyword_counter      = Counter()

for csv_path in CSV_FILES:
    df = read_csv(csv_path)
    df.columns = df.columns.str.replace("\ufeff", "").str.strip()

    if "해시태그" not in df.columns:
        continue

    # ① 파일 내 해시태그 set
    tags = {
        t.strip().lstrip("#")
        for raw in df["해시태그"].dropna()
        for t in raw.split(",")
        if t.strip()               # ← 공백 제거
    }

    # ② 새 태그만 배치 분류
    new_tags = [t for t in tags if t and t not in classification_cache]
    if new_tags:
        print(f"• {csv_path.name}: 새 태그 {len(new_tags):,}개 분류…")
        for batch in tqdm(chunk(new_tags, BATCH_SIZE), leave=False):
            outs = classifier(batch, candidate_labels, multi_label=False)
            for tag, out in zip(batch, outs):
                ok = out["labels"][0] != "non-food" and out["scores"][0] >= threshold
                classification_cache[tag] = ok

    # ③ 카운트
    for raw in df["해시태그"].dropna():
        for t in raw.split(","):
            tag = t.strip().lstrip("#")
            if tag and classification_cache.get(tag):
                keyword_counter[tag] += 1

# ──────────────────────────────
# 3) 저장
# ──────────────────────────────
if not keyword_counter:
    raise RuntimeError("음식 관련 해시태그가 없습니다.")

records = [
    (i, kw, cnt)
    for i, (kw, cnt) in enumerate(keyword_counter.most_common(), 1)
]
pd.DataFrame(records, columns=["KEYWORD_ID", "KEYWORD_NAME", "KEYWORDUP"]).to_csv(
    BASE_DIR / "keyword_table.csv", index=False, encoding="utf-8-sig"
)

print("✅ keyword_table.csv 생성 완료")
