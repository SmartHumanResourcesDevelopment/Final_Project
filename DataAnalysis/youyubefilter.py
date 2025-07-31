import os
import re
import pandas as pd
import emoji
import matplotlib.pyplot as plt
from matplotlib import rc   
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline

# — Matplotlib 한글 폰트 설정 (Windows: Malgun Gothic) —
if os.name == 'nt':
    rc('font', family='Malgun Gothic')
else:
    font_path = "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"
    rc('font', fname=font_path)
rc('axes', unicode_minus=False)

# -----------------------------
# 1. 사전 설정
# -----------------------------
MODEL_NAME = "searle-j/kote_for_easygoing_people"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
pipeline = TextClassificationPipeline(model=model, tokenizer=tokenizer, return_all_scores=True)

# 불용어 사전
stopwords = set([
    "그냥", "뭐", "진짜", "아", "음", "응", "좀", "너무", "이건", "저건", "걍", "ㅋ", "ㅎ", "ㅋㅋ", "ㅎㅎ", "헐", "와", "요", "네", "죠"
])

# -----------------------------
# 2. 전처리 함수
# -----------------------------
def remove_emoji(text):
    return emoji.replace_emoji(text, replace='')

def remove_hangul_jamo(text):
    return re.sub(r'[ㄱ-ㅎㅏ-ㅣ]', '', text)

def remove_repeated_words(text):
    return re.sub(r'(\b\w+\b)(\s+\1)+', r'\1', text)

def remove_stopwords(text):
    words = text.split()
    return ' '.join([w for w in words if w not in stopwords])

def preprocess(text):
    text = str(text)
    text = remove_emoji(text)
    text = remove_hangul_jamo(text)
    text = remove_repeated_words(text)
    text = remove_stopwords(text)
    return text.strip()

# -----------------------------
# 3. 감성 분석
# -----------------------------
def analyze_sentiment(df, text_col="COMMENT_TEXT"):
    df["CLEAN_TEXT"] = df[text_col].apply(preprocess)
    results = []
    label_scores = []

    for idx, text in enumerate(df["CLEAN_TEXT"]):
        if text.strip() == "":
            label_scores.append({})
            continue

        score_list = pipeline(text)[0]
        results.extend([
            {"text": text, "label": r["label"], "score": r["score"]}
            for r in score_list
        ])

        # 터미널에 주요 감정 레이블 출력
        top = max(score_list, key=lambda x: x["score"])
        print(f"[{idx+1}] \"{text}\" → {top['label']} ({top['score']:.3f})")

        label_scores.append({r["label"]: r["score"] for r in score_list})

    df["LABEL_SCORE_DICT"] = label_scores
    return df, results

# -----------------------------
# 4. 시각화 함수 (상위 30개만)
# -----------------------------
def visualize_kote_sentiment(results, top_n=30):
    df = pd.DataFrame(results)
    if df.empty:
        print("⚠️ 감정 분석 결과가 비어 있습니다. 시각화 생략.")
        return

    # 텍스트 빈도 순 정렬 후 상위 N개
    top_texts = df["text"].value_counts().head(top_n).index.tolist()
    df = df[df["text"].isin(top_texts)]

    pivot = df.pivot(index="text", columns="label", values="score").fillna(0)

    fig, ax = plt.subplots(figsize=(16, 12), dpi=100)
    pivot.plot(kind="bar", width=0.5, ax=ax)

    ax.set_title("텍스트별 감정 레이블 확신도 분포 (상위 30개)", fontsize=18)
    ax.set_xlabel("입력 문장", fontsize=14)
    ax.set_ylabel("확신도 (score)", fontsize=14)
    ax.tick_params(axis="x", rotation=45, labelsize=9)
    ax.tick_params(axis="y", labelsize=11)

    ax.legend(
        title="감정 레이블",
        fontsize=10,
        title_fontsize=11,
        loc="center left",
        bbox_to_anchor=(-0.15, 0.5)
    )

    fig.subplots_adjust(top=0.88)
    plt.tight_layout()
    plt.show()

# -----------------------------
# 5. 실행
# -----------------------------
def run():
    try:
        df = pd.read_csv("youtube_comments.csv")
    except FileNotFoundError:
        print("❌ 'youtube_comments.csv' 파일을 찾을 수 없습니다.")
        return

    print(f"📦 원본 댓글 수: {len(df)}")

    df_analyzed, sentiment_results = analyze_sentiment(df)

    df_analyzed.to_csv("youtube_comments_analyzed.csv", index=False)
    print("✅ 분석 완료 및 저장: youtube_comments_analyzed.csv")

    print("📊 감정 레이블 시각화:")
    visualize_kote_sentiment(sentiment_results, top_n=30)

# -----------------------------
if __name__ == "__main__":
    run()
