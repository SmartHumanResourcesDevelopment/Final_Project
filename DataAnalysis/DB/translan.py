#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
keyword_table_merged.csv → keyword_table_merged_ko.csv
  · KEYWORD_NAME 이 한글이 아니면 자동 번역 (Google)
  · 영어·일본어·숫자+영문 혼합 등 모두 처리
  · 언급량(KEYWORDUP)은 합산 유지
"""

from pathlib import Path
from collections import defaultdict
import re, time
import pandas as pd
from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator
from tqdm.auto import tqdm

# ──────── 경로·환경 ────────
BASE_DIR = Path(__file__).resolve().parent
IN_CSV   = BASE_DIR / "keyword_table_merged.csv"
OUT_CSV  = BASE_DIR / "keyword_table_merged_ko.csv"
BATCH_SIZE = 30

translator  = GoogleTranslator(source="auto", target="ko")

# ──────── 수동 동의어 사전 (소문자 키) ────────
manual_dict = {
    # 먹방 패밀리
    "mukbang": "먹방", "mukbangkorea": "먹방", "muckbang": "먹방",
    "韓国のモッパン": "먹방", "eating show": "먹방",
    # 간식·디저트
    "snack": "간식", "snacks": "간식",
    "dessert": "디저트", "desserts": "디저트",
    # 레시피·베이킹
    "recipe": "레시피", "recipes": "레시피",
    "baking": "베이킹",
    # 음식명
    "cake": "케이크", "cookie": "쿠키", "cookies": "쿠키",
    "pizza": "피자", "coffee": "커피", "bread": "빵",
    "chocolate": "초콜릿", "bbq": "바비큐",
}

# ──────── 유틸 ────────
def is_korean(text: str) -> bool:
    return bool(re.search("[가-힣]", text))

def need_translation(text: str) -> bool:
    """라틴 알파벳 포함 & 한글 없음이면 True"""
    return bool(re.search("[A-Za-z]", text)) and not is_korean(text)

def safe_detect(text: str):
    try:
        return detect(text)
    except LangDetectException:
        return "unknown"

def translate_once(text: str, retries=1):
    """한 문장 번역 (재시도)"""
    for _ in range(retries + 1):
        try:
            return translator.translate(text).strip()
        except Exception:
            time.sleep(1)
    return text  # 모든 재시도 실패 시 원본

# ──────── 0) 입력 로드 ────────
df = pd.read_csv(IN_CSV, encoding="utf-8-sig")
df.columns = [c.upper().strip() for c in df.columns]

counter = defaultdict(int)

# ──────── 1) 메인 루프 ────────
for _, row in df.iterrows():
    kw  = str(row["KEYWORD_NAME"]).strip()
    up  = int(row["KEYWORDUP"])

    # 1) 이미 한글 → 누적
    if is_korean(kw):
        counter[kw] += up
        continue

    # 2) 수동 사전
    mapped = manual_dict.get(kw.lower())
    if mapped:
        counter[mapped] += up
        continue

    # 3) 번역 필요 판정
    if len(kw) <= 3 or need_translation(kw) or safe_detect(kw) != "ko":
        ko = translate_once(kw)
        # 번역 결과가 여전히 영문이면 사전 매핑 시도
        if need_translation(ko):
            ko = manual_dict.get(ko.lower(), ko)
        counter[ko] += up
    else:
        counter[kw] += up  # (예: 숫자·이모지 등)

# ──────── 2) 결과 정렬·ID 재부여 ────────
records = sorted(counter.items(), key=lambda x: x[1], reverse=True)
out_df = pd.DataFrame(
    [(i+1, name, cnt) for i, (name, cnt) in enumerate(records)],
    columns=["KEYWORD_ID", "KEYWORD_NAME", "KEYWORDUP"]
)

# ──────── 3) 저장 ────────
out_df.to_csv(OUT_CSV, index=False, encoding="utf-8-sig")
print(f"✅ 재번역·합산 완료 → {OUT_CSV} (총 {len(out_df):,}행)")
