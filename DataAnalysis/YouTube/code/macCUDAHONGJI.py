# 이 파일은 누락된 유튜브 계정에 대한 음식관련 키워드만 영상을 전처리 하는 파일

import time
from pathlib import Path
import pandas as pd
import torch
from transformers import pipeline
from tqdm import tqdm

# ───────────────────── 0. 설정 ─────────────────────
DEVICE = 0 if torch.backends.mps.is_available() else -1
MODEL_NAME       = "joeddav/xlm-roberta-large-xnli"
CANDIDATE_LABELS = ["food", "non-food"]

# ▶ BASE_DIR: YouTube 폴더 기준
BASE_DIR = Path(__file__).resolve().parent.parent

# ▶ 입력 CSV 지정
INPUT_CSV = BASE_DIR / "Hongji홍지_youtube_videos.csv"

# ▶ 출력 폴더 지정
OUTPUT_DIR = BASE_DIR / "filter"
OUTPUT_DIR.mkdir(exist_ok=True)  # 없으면 자동 생성

# ───────────────────── 1. 파이프라인 초기화 ─────────────────────
classifier = pipeline(
    "zero-shot-classification",
    model=MODEL_NAME,
    device=DEVICE
)

# ───────────────────── 2. CSV 필터링 함수 ─────────────────────
def filter_csv_with_hf(path: Path):
    if not path.exists():
        print(f"❌ 입력 CSV 없음: {path}")
        return

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
    out_path = OUTPUT_DIR / out_name
    filtered.to_csv(out_path, index=False, encoding="utf-8-sig")

    print(f"✅ {path.name} → filter/{out_name} ({len(filtered)}/{len(df)})")

# ───────────────────── 3. 실행 ─────────────────────
def main():
    filter_csv_with_hf(INPUT_CSV)

if __name__ == "__main__":
    main()
