#!/usr/bin/env python3
"""
Filter CSVs by PUBLISHED_AT date (경로 수정판)
──────────────────────────────────────────────────
• 이 스크립트가 있는 위치를 기준으로 바로 상위 폴더(`filter`)를 찾아
• 그 폴더 내 모든 `*_youtube_videos_Filter_viedos.csv` 파일을 순회
• 'PUBLISHED_AT' 열의 날짜가 2024-08-01 이전인 행을 제거
• 원본 파일을 덮어씁니다
"""

from pathlib import Path
import pandas as pd

# 1) 기준 경로: 이 파일(__file__)의 상위 폴더가 바로 'filter'
CHANGE_DIR = Path(__file__).resolve().parent        # .../filter/change
FILTER_DIR = CHANGE_DIR.parent                       # .../filter

CUT_OFF_DATE = pd.to_datetime("2024-08-01")

if not FILTER_DIR.is_dir():
    raise FileNotFoundError(f"'filter' 폴더를 찾을 수 없습니다: {FILTER_DIR}")

# 2) 처리 대상 CSV 패턴
pattern = "*_youtube_videos_Filter_viedos.csv"
for csv_path in FILTER_DIR.glob(pattern):
    print(f"Processing {csv_path.relative_to(FILTER_DIR)} ...")

    # 3) CSV 로드 (PUBLISHED_AT을 날짜로 변환)
    df = pd.read_csv(csv_path, encoding="utf-8-sig", parse_dates=["PUBLISHED_AT"])

    # 4) 날짜 필터링
    before = len(df)
    df = df[df["PUBLISHED_AT"] >= CUT_OFF_DATE]
    after  = len(df)
    print(f"  Rows before: {before}, after: {after} (removed {before - after})")

    # 5) 저장 (덮어쓰기)
    df.to_csv(csv_path, index=False, encoding="utf-8-sig")

print("Done.")
