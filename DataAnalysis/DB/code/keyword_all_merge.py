#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pathlib import Path
import pandas as pd
from collections import Counter
from difflib import SequenceMatcher
from tqdm import tqdm

# ───────────────────── 0. 파일 경로 설정 ─────────────────────
BASE_DIR     = Path(__file__).resolve().parent.parent
FILE1        = BASE_DIR / "instar_post_filter" / "keyword_instar" /"keyword_table_merged_merged.csv"
FILE2        = BASE_DIR / "youtube_video_filter" / "keyword" / "keyword_mentions_merged.csv"
OUTPUT_DIR   = BASE_DIR / "all"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE  = OUTPUT_DIR / "combined_keyword_mentions.csv"

# ───────────────────── 1. 파일 로드 및 언급량 누적 ─────────────────────
df1 = pd.read_csv(FILE1, encoding="utf-8-sig")
df2 = pd.read_csv(FILE2, encoding="utf-8-sig")

# Counter로 초기 누적 (KEYWORDUP 컬럼 사용)
counter = Counter()
for _, row in df1.iterrows():
    counter[row["KEYWORD_NAME"]] += row["KEYWORDUP"]
for _, row in df2.iterrows():
    counter[row["KEYWORD_NAME"]] += row["KEYWORDUP"]

# ───────────────────── 2. 유사도 기반 클러스터링 (threshold=0.7) ─────────────────────
def similarity(a: str, b: str) -> float:            
    return SequenceMatcher(None, a, b).ratio()

threshold = 0.7
clusters = []

for name in tqdm(list(counter.keys()), desc="Clustering keywords"):
    placed = False
    for cluster in clusters:
        # 클러스터의 대표 키워드(첫 요소)와 유사도 비교
        if similarity(name, cluster[0]) >= threshold:
            cluster.append(name)
            placed = True
            break
    if not placed:
        clusters.append([name])

# ───────────────────── 3. 클러스터별 대표 및 언급량 합산 ─────────────────────
merged = []
for cluster in clusters:
    total_count = sum(counter[n] for n in cluster)
    # 대표: 언급량이 가장 많은 키워드
    rep = max(cluster, key=lambda n: counter[n])
    merged.append((rep, total_count))

# ───────────────────── 4. 결과 정리 및 저장 ─────────────────────
# 언급량 내림차순 정렬
merged.sort(key=lambda x: x[1], reverse=True)
result_df = pd.DataFrame(merged, columns=["KEYWORD_NAME", "KEYWORDUP"])
# KEYWORD_ID 재부여
result_df.insert(0, "KEYWORD_ID", range(1, len(result_df) + 1))

# 저장
result_df.to_csv(OUTPUT_FILE, index=False, encoding="utf-8-sig")
print(f"✅ Combined and clustered file saved to: {OUTPUT_FILE}")
