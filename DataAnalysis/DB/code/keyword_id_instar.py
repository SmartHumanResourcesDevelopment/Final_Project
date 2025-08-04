# 1) 환경 준비 (터미널에서 한 번만)
# pip install pandas transformers torch konlpy

import os
import re                                   # ← 추가
import torch
import pandas as pd
from transformers import pipeline
from konlpy.tag import Okt

assert torch.cuda.is_available(), "CUDA 활성화된 PyTorch가 필요합니다!"

# Okt 형태소 분석기
okt = Okt()

def remove_relative_dates(text: str) -> str:
    """
    '2주 3일 전', '5주 전', '10일 전', '3시간 전' 등
    상대 시각 표현을 모두 제거합니다.
    """
    # X주 Y일 전
    text = re.sub(r'\d+\s*주\s*\d+\s*일\s*전', '', text)
    # X주 전, X일 전, X시간 전, X분 전, X초 전
    text = re.sub(r'\d+\s*(?:주|일|시간|분|초)\s*전', '', text)
    return text

def filter_and_add_nouns_as_tags(input_csv: str,
                                  output_csv: str,
                                  threshold: float = 0.8,
                                  device: int = 0):
    """
    1) Zero-Shot 분류로 food 포스트만 필터  
    2) 본문에서 Okt.nouns()로 명사 추출 → 해시태그로 추가  
    3) 본문에 포함된 상대 시각(몇주 몇일 전 등) 표현 제거
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
        # 원본 본문 읽고, 상대 시각 표현 제거
        raw_text = str(row['POST_TEXT'])
        text = remove_relative_dates(raw_text)

        tags = str(row.get('HASHTAGS','')) or ""
        out = classifier(text + " " + tags, candidate_labels)
        scores = dict(zip(out['labels'], out['scores']))
        best = max(scores.get(l,0) for l in food_labels)
        if best < threshold:
            continue

        # 3) 형태소 분석으로 본문 명사 추출
        nouns = okt.nouns(text)
        nouns = [n for n in nouns if len(n)>1 and n.isalpha()]

        # 4) 기존 태그 유지 + 명사 해시태그 추가
        existing = [t.strip().lstrip('#') for t in tags.split(',') if t.strip()]
        existing_lower = {t.lower() for t in existing}

        for n in nouns:
            if n.lower() not in existing_lower:
                existing.append(n)

        new_row = row.copy()
        new_row['HASHTAGS'] = ", ".join(f"#{t}" for t in existing)
        filtered.append(new_row)

    # 5) 저장
    df_out = pd.DataFrame(filtered)
    cols = ['POST_DATE','LIKE_COUNT','POST_TEXT','HASHTAGS','COMMENTS']
    os.makedirs(os.path.dirname(output_csv), exist_ok=True)
    df_out[cols].to_csv(output_csv, index=False, encoding='utf-8-sig')
    print(f"✅ {len(df_out)}개 포스트에 본문 명사 기반 해시태그를 추가해 '{output_csv}'에 저장했습니다.")

if __name__=="__main__":
    filter_and_add_nouns_as_tags(
        input_csv  ="instargram_infu/anunu.kr.csv",
        output_csv ="hastagging/anunu.kr_noun_tags.csv",
        threshold  =0.8,
        device     =0   # GPU:0, CPU-only:-1
    )
