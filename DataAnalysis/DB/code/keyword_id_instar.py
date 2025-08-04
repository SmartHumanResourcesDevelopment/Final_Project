#!/usr/bin/env python3
# keyword_id_instar.py  –  Instagram/YouTube KEYWORD_ID 부여 + 노이즈 제거

import re, pandas as pd
from pathlib import Path
from rapidfuzz import process, fuzz

# ───────────────────── 0) 헬퍼 ────────────────────────────────
TIME_PAT  = re.compile(r"\b\d+\s*[초분시간일주월년]+\b")  # 15시간, 3일, 2주 …
EMOJI_PAT = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map
    "\U0001F1E0-\U0001F1FF"  # flags
    "]+",
    flags=re.UNICODE,
)

def clean_text(txt: str) -> str:
    """이모지·상대날짜 토큰 제거 + 소문자"""
    if not isinstance(txt, str):
        return ""
    txt = EMOJI_PAT.sub(" ", txt)
    txt = TIME_PAT.sub(" ", txt)
    txt = re.sub(r"[^\w가-힣 ]+", " ", txt)      # 특수문자 정리
    return re.sub(r"\s+", " ", txt).strip().lower()

def map_keyword_id(text, tags, kw_names, kw_id_map, thr=55):
    txt = clean_text(text)
    hts = clean_text(tags)

    # 1) 정확 포함
    for name in kw_names:
        if name in txt or name in hts:
            return kw_id_map[name]

    # 2) 토큰 일치
    tokens = set(txt.split()) | set(hts.split())
    for name in kw_names:
        if name in tokens:
            return kw_id_map[name]

    # 3) fuzzy
    best, score, _ = process.extractOne(txt + " " + hts, kw_names, scorer=fuzz.WRatio)
    return kw_id_map[best] if score >= thr else pd.NA

# ───────────────────── 1) 경로 & 키워드 사전 ───────────────────
base_dir = Path(__file__).resolve().parent.parent   # …/DB
all_dir  = base_dir / "all"
kw_df    = pd.read_csv(all_dir / "combined_keyword_mentions.csv",
                       usecols=["KEYWORD_ID","KEYWORD_NAME"],
                       encoding="utf-8-sig")
kw_map   = dict(zip(kw_df["KEYWORD_NAME"], kw_df["KEYWORD_ID"]))
kw_names = [k.lower() for k in kw_map]              # 소문자화

# 출력 폴더
(all_dir / "instar").mkdir(parents=True, exist_ok=True)
(all_dir / "youtube").mkdir(parents=True, exist_ok=True)
(all_dir / "logs").mkdir(exist_ok=True)
# ───────────────────── 2) Instagram posts ─────────────────────
for fp in (base_dir / "instar_post_filter" / "filter").glob("*_posts.csv"):
    prefix = fp.stem.replace("_posts", "")
    df = pd.read_csv(fp, encoding="utf-8-sig")

    df["POST_ID"]   = prefix + "_" + df["POST_DATE"]
    df["AUTHOR_ID"] = df["POST_ID"]
    df["POST_TEXT_CLEAN"] = df["POST_TEXT"].apply(clean_text)
    df["HASHTAGS_CLEAN"]  = df["HASHTAGS"].fillna("").apply(clean_text)

    df["KEYWORD_ID"] = df.apply(
        lambda r: map_keyword_id(r["POST_TEXT_CLEAN"], r["HASHTAGS_CLEAN"],
                                 kw_names, kw_map),
        axis=1
    )

    miss_cnt = df["KEYWORD_ID"].isna().sum()
    if miss_cnt:
        print(f"⚠️  {prefix}: KEYWORD_ID 미매핑 {miss_cnt}행 (파일 미생성)")

    # 매핑된 행만 남김
    df = df.dropna(subset=["KEYWORD_ID"])

    out_cols = ["POST_ID","KEYWORD_ID","POST_TEXT","HASHTAGS",
                "AUTHOR_ID","POST_DATE","LIKE_COUNT","PLATFORM"]
    df[out_cols].to_csv(all_dir/"instar"/f"{prefix}_posts.csv",
                        index=False, encoding="utf-8-sig")
    print(f"✔ Instagram 처리 완료 → {prefix}_posts.csv")

# ───────────────────── 3) YouTube videos ─────────────────────
for fp in (base_dir / "youtube_video_filter").glob("*_Filter_viedos.csv"):
    df = pd.read_csv(fp, encoding="utf-8-sig")

    df["DESC_CLEAN"]  = df["DESCRIPTION"].fillna("").apply(clean_text)
    df["TITLE_CLEAN"] = df["TITLE"].apply(clean_text)
    df["KEYWORD_ID"]  = df.apply(
        lambda r: map_keyword_id(f"{r.TITLE_CLEAN} {r.DESC_CLEAN}", "",
                                 kw_names, kw_map),
        axis=1
    )

    miss_cnt = df["KEYWORD_ID"].isna().sum()
    if miss_cnt:
        print(f"⚠️  {fp.name}: KEYWORD_ID 미매핑 {miss_cnt}행 (파일 미생성)")

    df = df.dropna(subset=["KEYWORD_ID"])

    # KEYWORD_ID를 2번째 컬럼으로
    cols = list(df.columns)
    cols.insert(1, cols.pop(cols.index("KEYWORD_ID")))
    df[cols].to_csv(all_dir/"youtube"/fp.name,
                    index=False, encoding="utf-8-sig")
    print(f"✔ YouTube 처리 완료 → {fp.name}")

print("✅ 모든 파일 처리 완료 (미매핑 행은 로그만 출력, 파일 저장 안 함)")