#!/usr/bin/env python3
# youtube_hf_filter_all_csv.py

import time
from pathlib import Path
from typing import List

import pandas as pd
import torch
from transformers import pipeline
from tqdm import tqdm

# ───────────────────── 0. 설정 ─────────────────────
DEVICE = 0 if torch.backends.mps.is_available() else -1
MODEL_NAME       = "joeddav/xlm-roberta-large-xnli"
CANDIDATE_LABELS = ["food", "non-food"]

# ▶ CSV 파일들이 들어있는 상위 폴더(YouTube) 경로로 변경
BASE_DIR = Path(__file__).resolve().parent.parent

# ───────────────────── 1. 파이프라인 초기화 ─────────────────────
classifier = pipeline(
    "zero-shot-classification",
    model=MODEL_NAME,
    device=DEVICE
)

# ───────────────────── 2. CSV 필터링 함수 ─────────────────────
def filter_csv_with_hf(path: Path):
    df = pd.read_csv(path, encoding="utf-8-sig")
    if "TITLE" not in df.columns:
        print(f"⚠️ TITLE 컬럼 없음: {path.name}")
        return

    titles = df["TITLE"].fillna("").tolist()
    results = []
    for batch in tqdm(
        [titles[i:i+50] for i in range(0, len(titles), 50)],
        desc=f"Classifying {path.name}", leave=False
    ):
        results.extend(classifier(batch, CANDIDATE_LABELS))

    mask = [r["labels"][0] == "food" for r in results]
    filtered = df[mask]

    out_name = f"{path.stem}_Filter_viedos.csv"
    out_path = path.with_name(out_name)
    filtered.to_csv(out_path, index=False, encoding="utf-8-sig")
    print(f"✅ {path.name} → {out_name} ({len(filtered)}/{len(df)})")

# ───────────────────── 3. 모든 CSV 순회 & 실행 ─────────────────────
def main():
    csv_files = list(BASE_DIR.rglob("*.csv"))
    if not csv_files:
        print(f"❌ 지정된 폴더({BASE_DIR})에 CSV 파일이 없습니다.")
        return

    for csv_file in tqdm(csv_files, desc="Processing CSV files"):
        filter_csv_with_hf(csv_file)

if __name__ == "__main__":
    main()
