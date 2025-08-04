#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pathlib import Path
import pandas as pd
from collections import Counter
from difflib import SequenceMatcher
from tqdm import tqdm

# ───────────────────── 0. 파일 리스트 설정 ─────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
FILES = [
    BASE_DIR / "instar_post_filter" / "keyword_instar" /"keyword_table_merged.csv",
    BASE_DIR / "youtube_video_filter" / "keyword" / "keyword_mentions.csv"
]
THRESHOLD = 0.6 # 유사도 임계치

#-------------키워드 의미가 유사시 묶기 기존의 키워드 id 를 기억하고 유사한 대표 id 수장 -------------------
# 한국어 댓글만 남기기

# ───────────────────── 1. 문자열 유사도 함수 ─────────────────────
def sim(a: str, b: str) -> float:
    return SequenceMatcher(None, a, b).ratio()

# ───────────────────── 2. 각 파일별 클러스터링 및 저장 ─────────────────────
for input_file in FILES:
    print(f"\n🔄 Processing: {input_file.name}")
    df = pd.read_csv(input_file, encoding="utf-8-sig")

    # 2-1) 언급량 누적 (KEYWORDUP 컬럼이 언급량)
    counter = Counter()
    for _, row in df.iterrows():
        counter[row["KEYWORD_NAME"]] += int(row.get("KEYWORDUP", 0))

    # 2-2) 클러스터링
    names = list(counter.keys())
    clusters = []
    for name in tqdm(names, desc=f"Clustering {input_file.name}", leave=False):
        placed = False
        for cluster in clusters:
            if sim(name, cluster[0]) >= THRESHOLD:
                cluster.append(name)
                placed = True
                break
        if not placed:
            clusters.append([name])

    # 2-3) 대표 키워드 및 언급량 집계
    merged = []
    for cluster in clusters:
        total_cnt = sum(counter[n] for n in cluster)
        rep = max(cluster, key=lambda n: counter[n])
        merged.append((rep, total_cnt))

    # 2-4) 최종 DataFrame 생성
    merged.sort(key=lambda x: x[1], reverse=True)
    out_df = pd.DataFrame(merged, columns=["KEYWORD_NAME", "KEYWORDUP"])
    out_df.insert(0, "KEYWORD_ID", range(1, len(out_df) + 1))

    # 2-5) 파일명에 _merged 추가해 저장
    output_file = input_file.with_name(f"{input_file.stem}_merged.csv")
    out_df.to_csv(output_file, index=False, encoding="utf-8-sig")
    print(f"✅ Saved: {output_file.name}")
