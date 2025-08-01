#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
keyword_table.csv → keyword_table_merged.csv
  ① 수동 동의어 매핑
  ② 비(非)한국어 키워드만 번역 후 합산
"""

from pathlib import Path
from collections import defaultdict
import pandas as pd
from langdetect import detect, LangDetectException
from deep_translator import GoogleTranslator
from tqdm.auto import tqdm

# ───────────── 설정 ─────────────
BASE_DIR  = Path(__file__).resolve().parent
IN_CSV    = BASE_DIR / "keyword_table.csv"
OUT_CSV   = BASE_DIR / "keyword_table_merged.csv"
BATCH_SIZE = 30

# 1) 수동 동의어 맵 (소문자 키)
manual_map = {
    "mukbang": "먹방",
    "mukbangkorea": "먹방",
    "韓国のモッパン": "먹방",
    "yogurtboy": "요거트",
    "dessert": "디저트",
    "snack": "간식",
    # …필요 시 추가
}

# 2) 번역기 객체 (Google → ko)
translator = GoogleTranslator(source="auto", target="ko")

# ───────────── 유틸 ─────────────
def is_korean(text: str) -> bool:
    """언어가 ko 이면 True, 아니라면 False"""
    try:
        return detect(text) == "ko"
    except LangDetectException:
        return False

def translate_list(texts: list[str]) -> list[str]:
    """리스트 단위 번역 (deep-translator는 1문장씩)"""
    results = []
    for t in texts:
        try:
            results.append(translator.translate(t).strip())
        except Exception:
            results.append(t)   # 실패 시 원본 유지
    return results

# ───────────── 0) 입력 로드 ─────────────
df = pd.read_csv(IN_CSV, encoding="utf-8-sig")
df.columns = [c.upper().strip() for c in df.columns]

# ───────────── 1) 수동·언어별 처리 ─────────────
counter = defaultdict(int)
need_translate = []

for _, row in df.iterrows():
    kw  = str(row["KEYWORD_NAME"]).strip()
    cnt = int(row["KEYWORDUP"])

    # ① 수동 동의어
    key = manual_map.get(kw.lower())
    if key:
        counter[key] += cnt
        continue

    # ② 한국어면 바로 카운트
    if is_korean(kw):
        counter[kw] += cnt
    else:
        need_translate.append((kw, cnt))

# ───────────── 2) 번역 후 합산 ─────────────
print(f"🔸 번역 대상 {len(need_translate):,}개 → 한국어 변환 중…")
for i in tqdm(range(0, len(need_translate), BATCH_SIZE)):
    batch = need_translate[i:i+BATCH_SIZE]
    src_texts  = [b[0] for b in batch]
    src_counts = [b[1] for b in batch]

    tgt_texts = translate_list(src_texts)

    for src, tgt, cnt in zip(src_texts, tgt_texts, src_counts):
        # 번역 결과가 수동 맵에 있으면 다시 치환
        tgt_norm = manual_map.get(tgt.lower(), tgt)
        counter[tgt_norm] += cnt

# ───────────── 3) 결과 저장 ─────────────
records = sorted(counter.items(), key=lambda x: x[1], reverse=True)
merged_df = pd.DataFrame(
    [(i+1, name, cnt) for i, (name, cnt) in enumerate(records)],
    columns=["KEYWORD_ID", "KEYWORD_NAME", "KEYWORDUP"]
)
merged_df.to_csv(OUT_CSV, index=False, encoding="utf-8-sig")
print(f"✅ 저장 완료 → {OUT_CSV} (총 {len(merged_df):,}행)")
