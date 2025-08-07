from transformers import AutoTokenizer, AutoModelForSequenceClassification, TextClassificationPipeline
import pandas as pd
from tqdm import tqdm

# 모델 이름 지정
model_name = "searle-j/kote_for_easygoing_people"

# 모델과 토크나이저 로드
model = AutoModelForSequenceClassification.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# 파이프라인 설정 (GPU 사용 시 device=0, CPU 사용 시 device=-1)
pipe = TextClassificationPipeline(
    model=model,
    tokenizer=tokenizer,
    device=-1,  # CPU 사용. GPU 사용 시 0
    return_all_scores=True,
    function_to_apply='sigmoid'
)

# 분석할 텍스트 리스트 예시 (여기서 본문이나 댓글 리스트로 대체)
texts = [
    "재미있어요! 재미는 확실히 있는데 뭐랄까... 너무 정신 없달까...ㅋㅋ",
    "정말 감동적이었어요. 눈물이 났어요.",
    "별로였어요. 실망스러움.",
    "음식이 너무 맛있었어요! 행복해요",
    "서비스가 불쾌했어요. 다시는 안 가요."
]

# 결과 저장 리스트
results = []

# 감정 분석 수행
for text in tqdm(texts, desc="감성 분석 중"):
    result = {"text": text}
    emotions = pipe(text)[0]
    for item in emotions:
        if item["score"] > 0.4:
            result[item["label"]] = round(item["score"], 4)
    results.append(result)

# DataFrame 생성
df = pd.DataFrame(results)

# 결과 저장 (경로는 필요에 따라 수정 가능)
df.to_csv("kote_emotion_result.csv", index=False, encoding='utf-8-sig')
print("감성 분석 완료! 'kote_emotion_result.csv' 저장됨.")
