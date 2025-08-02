#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pathlib import Path
import glob
import pandas as pd
from konlpy.tag import Okt
from tqdm import tqdm  # 진행바 추가

# ───────────────────── 0. 설정 ─────────────────────
BASE_DIR          = Path(__file__).resolve().parent.parent
INPUT_PATTERN     = str(BASE_DIR / "*_youtube_videos.csv")  # 입력 CSV 패턴
OUTPUT_DIR        = BASE_DIR / "filter" / "keyword"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ──────────────────── 1. 형태소 분석기 초기화 ────────────────────
okt = Okt()

# ──────────────────── 2. 메인 처리 루프 ────────────────────
if __name__ == "__main__":
    file_paths = glob.glob(INPUT_PATTERN)
    # 전체 파일 진행바
    for input_path in tqdm(file_paths, desc="파일 처리 중"):
        df = pd.read_csv(input_path, encoding="utf-8-sig")
        # TITLE 컬럼에서 명사 추출
        nouns = []
        for title in df.get("TITLE", pd.Series(dtype=str)).astype(str):
            nouns.extend(okt.nouns(title))
        # 중복 제거 및 정렬
        unique_nouns = sorted(set(nouns))
        # DataFrame 변환 및 저장
        noun_df = pd.DataFrame({"NOUN": unique_nouns})
        stem = Path(input_path).stem.replace("_videos", "")
        output_file = OUTPUT_DIR / f"{stem}_nouns.csv"
        noun_df.to_csv(output_file, index=False, encoding="utf-8-sig")
        print(f"[완료] {output_file.name} 생성 ({len(unique_nouns)}개 명사)")
