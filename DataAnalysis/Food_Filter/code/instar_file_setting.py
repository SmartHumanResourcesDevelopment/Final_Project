'''
여기는 원본 데이터에서 음식관련 키워드만 살리고 댓글 분리

'''
import os
import glob
import re
import pandas as pd
from transformers import pipeline

# ────────────────────────────────────────────────────
# 설정
# ────────────────────────────────────────────────────
device = 0  # GPU 없으면 -1
classifier = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    device=device,
    multi_label=True
)
candidate_labels = ["food", "dessert", "snack", "beverage", "meal", "korean food", "non-food"]
food_labels = set(candidate_labels) - {"non-food"}
threshold = 0.6

date_pattern = re.compile(r'\d+\s*(시간|일|주|월|년)(\s*(전|후|동안|째|간))?\b')

# ────────────────────────────────────────────────────
# 경로 설정
# ────────────────────────────────────────────────────
script_dir      = os.path.dirname(os.path.abspath(__file__))           # .../Food_Filter/code
food_filter_dir = os.path.abspath(os.path.join(script_dir, os.pardir)) # .../Food_Filter
project_root    = os.path.abspath(os.path.join(food_filter_dir, os.pardir))

insta_infu_dir      = os.path.join(project_root, "instargram_infu")
post_output_dir     = os.path.join(food_filter_dir, "instar_post_filter")
comment_input_dir   = os.path.join(food_filter_dir, "instar_post_filter", "comment")
comment_output_dir  = comment_input_dir

os.makedirs(post_output_dir, exist_ok=True)
os.makedirs(comment_output_dir, exist_ok=True)

# ────────────────────────────────────────────────────
# 1) INSTAGRAM POST 필터링 & 저장
# ────────────────────────────────────────────────────
for path in glob.glob(os.path.join(insta_infu_dir, "*.csv")):
    # 1-1) 읽기
    try:
        df = pd.read_csv(path, encoding="utf-8-sig")
    except UnicodeDecodeError:
        df = pd.read_csv(path, encoding="cp949")

    # 1-2) 본문 상대 날짜 제거
    df["POST_TEXT"] = df["POST_TEXT"].astype(str).apply(
        lambda x: date_pattern.sub("", x).strip()
    )

    # 1-3) Zero-Shot 분류
    outs = classifier(
        df["POST_TEXT"].tolist(),
        candidate_labels=candidate_labels,
        multi_label=True
    )
    mask = []
    for out in outs:
        scores = dict(zip(out["labels"], out["scores"]))
        mask.append(any(scores[l] >= threshold for l in food_labels))
    df_f = df[mask]
    if df_f.empty:
        continue

    # 1-4) author 추출 (‘anunu.kr.csv’ → ‘anunu.kr’)
    base   = os.path.splitext(os.path.basename(path))[0]
    author = base.split("_")[0]

    # 1-5) 저장
    out_name = f"{author}_food_filter.csv"
    df_f.to_csv(os.path.join(post_output_dir, out_name), index=False, encoding="utf-8-sig")
    print(f"✅ Post 필터 저장: {out_name} ({len(df_f)} rows)")

