import os
import pandas as pd
from tqdm import tqdm
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

# — 모델 및 파이프라인 설정 —
model_name = "searle-j/kote_for_easygoing_people"
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)
pipe = TextClassificationPipeline(
    model=model,
    tokenizer=tokenizer,
    device=-1,
    return_all_scores=True,
    function_to_apply='sigmoid'
)

# — 분석할 텍스트 —
texts = [
    "안좋아하는데,, 초록 맛 넘 이쁘다!",
    "말차 붐은 온다...!",
    "이번달 초에 말차 사러 갔었는데 너무 구하기 힘들었어요...작년도 이맘때 갔었는데 그때랑 상황이 전혀 달라요...",
    "말차진짜맛잇는데",
    "교토가서 말차라떼먹쟈",
    " 이제 말차 먹어야겠지?",
    "진짜 트렌드 맞는뎅,, 미국인 친구가 집에서 차샤쿠까지 써서 말차라떼를 해먹더라고용 .ᐟ.ᐟ",
    "진짜…일본 말차도 서양인들이 다 털어갔더라구요😡",
    "미국말차 너무 밍밍인디"
]

# — 감성 분석 수행 및 결과 수집 —
results = []
for text in tqdm(texts, desc="감성 분석 중"):
    for item in pipe(text)[0]:
        if item["score"] > 0.5:
            results.append({
                "text": text,
                "label": item["label"],
                "score": item["score"]
            })

# DataFrame 및 pivot
df = pd.DataFrame(results)
pivot = df.pivot(index="text", columns="label", values="score").fillna(0)

# 시각화 (크기·간격 조정)
fig, ax = plt.subplots(figsize=(18, 25), dpi=100)
pivot.plot(
    kind="bar",
    width=0.5,
    ax=ax
)
ax.set_title("텍스트별 감정 레이블 확신도 분포", fontsize=18)
ax.set_xlabel("입력 문장", fontsize=14)
ax.set_ylabel("확신도 (score)", fontsize=14)
ax.tick_params(axis="x", rotation=45, labelsize=12)
ax.tick_params(axis="y", labelsize=12)

# 범례를 왼쪽 가운데로 고정
ax.legend(
    title="감정 레이블",
    fontsize=12,
    title_fontsize=13,
    loc="center left",           # 범례 위치: 왼쪽 중앙
    bbox_to_anchor=(-0.15, 0.5)   # (x, y) 좌표 값은 축 영역 기준
)

# 하단 tight_layout 대신 상단 여유 공간 주기
fig.subplots_adjust(top=0.85)  # 0.0~1.0 사이, 1.0에 가까울수록 플롯영역이 커짐

plt.tight_layout()
plt.show()

