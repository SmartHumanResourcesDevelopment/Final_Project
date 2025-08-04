# #!/usr/bin/env python3
# # -*- coding: utf-8 -*-

# from pathlib import Path
# import glob
# import pandas as pd
# from konlpy.tag import Okt
# from transformers import pipeline
# from collections import Counter
# from tqdm import tqdm

# # ───────────────────── 0. 설정 ─────────────────────
# BASE_DIR        = Path(__file__).resolve().parent.parent
# INPUT_PATTERN   = str(BASE_DIR / "youtube_video_filter" / "*_youtube_videos_Filter_viedos.csv")
# OUTPUT_DIR      = BASE_DIR / "filter"
# OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# # Zero‐shot 분류를 위한 라벨과 배치 사이즈 설정
# CANDIDATE_LABELS = [
#     "food", "dessert", "snack",
#     "beverage", "meal", "korean food",
#     "non-food",
# ]
# BATCH_SIZE = 32  # GPU 메모리에 맞춰 조정

# # ──────────────────── 1. 형태소 분석기는 이미 완료된 명사 CSV를 읽기만 함 ────────────────────
# okt = Okt()

# # ──────────────────── 2. zero-shot 분류기 초기화 ────────────────────
# classifier = pipeline(
#     "zero-shot-classification",
#     model="joeddav/xlm-roberta-large-xnli",
#     device=0,             # GPU/MPS 사용: 0, CPU만 쓰려면 -1
#     batch_size=BATCH_SIZE,
#     truncation=True
# )

# # ──────────────────── 3. 모든 명사 등장 횟수 누적 ────────────────────
# mention_counter = Counter()
# noun_files = glob.glob(INPUT_PATTERN)
# print(f"🔍 처리할 명사 CSV 파일 수: {len(noun_files)}\n")

# for fp in tqdm(noun_files, desc="명사 CSV 순회"):
#     df = pd.read_csv(fp, encoding="utf-8-sig")
#     # 각 행의 'NOUN' 컬럼 값이 명사
#     mention_counter.update(df["NOUN"].dropna().astype(str).tolist())

# # ──────────────────── 4. detailed zero-shot 분류 & 필터링 ────────────────────
# unique_nouns = list(mention_counter.keys())
# food_nouns = []
# noun_batches = [
#     unique_nouns[i : i + BATCH_SIZE]
#     for i in range(0, len(unique_nouns), BATCH_SIZE)
# ]

# for batch in tqdm(noun_batches, desc="음식 카테고리 분류"):
#     # batch 단위로 분류 호출
#     results = classifier(batch, candidate_labels=CANDIDATE_LABELS)
#     for noun, res in zip(batch, results):
#         top_label = res["labels"][0]  # 가장 높은 점수의 라벨
#         # 'non-food'가 아니면 음식 카테고리로 간주
#         if top_label != "non-food":
#             food_nouns.append(noun)

# # ──────────────────── 5. 결과 DataFrame 생성 & 저장 ────────────────────
# kw_df = pd.DataFrame({
#     "KEYWORD_ID":   range(1, len(food_nouns) + 1),
#     "KEYWORD_NAME": food_nouns,
#     "KEYWORDUP":    [mention_counter[w] for w in food_nouns]
# })

# output_file = OUTPUT_DIR / "keyword_mentions.csv"
# kw_df.to_csv(output_file, index=False, encoding="utf-8-sig")

# print(f"\n✅ '{output_file.name}' 생성 완료 ({len(food_nouns)}개 음식 키워드)\n")

#!/usr/bin/env python3
# filter_youtube_food_videos.py  –  음식 관련 영상만 남기기

from pathlib import Path
import glob, pandas as pd
from transformers import pipeline
from tqdm import tqdm

# ───────────── 0. 경로 & 파라미터 ─────────────
BASE_DIR     = Path(__file__).resolve().parent.parent   # …/DB
IN_PATTERN   = str(BASE_DIR / "youtube_video_filter" / "*_youtube_videos_Filter_viedos.csv")
OUT_DIR      = BASE_DIR / "filter"
OUT_DIR.mkdir(parents=True, exist_ok=True)

CANDIDATE_LABELS = ["food", "dessert", "snack", "beverage", "meal", "korean food", "non-food"]
BATCH_SIZE       = 32             # GPU: 32, CPU 사용 시 8 추천
DEVICE_ID        = 0              # GPU/MPS: 0, CPU: -1

# ───────────── 1. zero-shot 분류기 ─────────────
clf = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    device=DEVICE_ID,
    batch_size=BATCH_SIZE,
    truncation=True,
)

# ───────────── 2. 입력 파일 순회 ─────────────
in_files = glob.glob(IN_PATTERN)
print(f"🔍 입력 CSV {len(in_files)}개 발견")

for fp in in_files:
    creator = Path(fp).name.split("_", 1)[0]           # 첫 '_' 앞부분
    out_path = OUT_DIR / f"{creator}_videos_food.csv"

    df = pd.read_csv(fp, encoding="utf-8-sig")
    # 분류 대상 문장 = TITLE + DESCRIPTION
    texts = (df["TITLE"].fillna("") + " " + df["DESCRIPTION"].fillna("")).tolist()

    keep_mask = []
    for i in tqdm(range(0, len(texts), BATCH_SIZE), desc=creator, leave=False):
        batch = texts[i : i + BATCH_SIZE]
        preds = clf(batch, candidate_labels=CANDIDATE_LABELS)
        # non-food 가 1순위이면 False
        keep_mask.extend([res["labels"][0] != "non-food" for res in preds])

    filtered_df = df[keep_mask]

    # 원하는 9개 컬럼만 유지
    cols = ["VIDEO_ID","TITLE","DESCRIPTION","CHANNEL_TITLE","PUBLISHED_AT",
            "DURATION","VIEW_COUNT","LIKE_COUNT","COMMENT_COUNT","PLATFORM"]
    filtered_df[cols].to_csv(out_path, index=False, encoding="utf-8-sig")
    print(f"✔ {creator}: {len(filtered_df)}/{len(df)}개 보존 → {out_path.name}")

print("\n✅ 모든 파일 처리 완료 (filter 디렉토리 확인)")






