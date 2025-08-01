# 1) 환경 준비 (터미널에서 한 번만)
# pip install pandas transformers torch konlpy

import os
import torch
import pandas as pd
from transformers import pipeline
from konlpy.tag import Okt

assert torch.cuda.is_available(), "CUDA 활성화된 PyTorch가 필요합니다!"

# Okt 형태소 분석기
okt = Okt()

def filter_and_add_nouns_as_tags(input_csv: str,
                                  output_csv: str,
                                  threshold: float = 0.8,
                                  device: int = 0):
    """
    1) Zero-Shot 분류로 food 포스트만 필터  
    2) 본문에서 Okt.nouns()로 명사 추출 → 해시태그로 추가  
    """
    # 1) 데이터 로드
    df = pd.read_csv(input_csv, encoding='utf-8-sig', parse_dates=['작성일'])

    # 2) Zero-Shot 분류기 (멀티레이블)
    classifier = pipeline(
        "zero-shot-classification",
        model="joeddav/xlm-roberta-large-xnli",
        device=device,
        multi_label=True
    )
    candidate_labels = ["food","dessert","snack","beverage","meal","korean food","non-food"]
    food_labels = [l for l in candidate_labels if l!="non-food"]

    filtered = []
    for _, row in df.iterrows():
        text = str(row['본문'])
        tags = str(row.get('해시태그','')) or ""
        out = classifier(text + " " + tags, candidate_labels)
        scores = dict(zip(out['labels'], out['scores']))
        # food 계열의 최고 확신도
        best = max(scores.get(l,0) for l in food_labels)
        if best < threshold:
            continue

        # 3) 형태소 분석으로 본문 명사 추출
        nouns = okt.nouns(text)
        # 2글자 이상, 숫자·특수문자 제외
        nouns = [n for n in nouns if len(n)>1 and n.isalpha()]

        # 4) 기존 태그 유지 + 명사 해시태그 추가
        existing = [t.strip().lstrip('#') 
                    for t in tags.split(',') if t.strip()]
        existing_lower = {t.lower() for t in existing}

        for n in nouns:
            if n.lower() not in existing_lower:
                existing.append(n)

        row = row.copy()
        row['해시태그'] = ", ".join(f"#{t}" for t in existing)
        filtered.append(row)

    # 5) 저장
    df_out = pd.DataFrame(filtered)
    cols = ['작성일','좋아요 수','본문','해시태그','댓글 목록']
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df_out[cols].to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"✅ {len(df_out)}개 포스트에 본문 명사 기반 해시태그를 추가해 '{output_csv}'에 저장했습니다.")

if __name__=="__main__":
    filter_and_add_nouns_as_tags(
        input_csv  ="DataAnalysis/anunu.kr.csv",
        output_csv ="hastagging/anunu.kr_noun_tags.csv",
        threshold  =0.8,
        device     =0   # GPU:0, CPU-only:-1
    )
