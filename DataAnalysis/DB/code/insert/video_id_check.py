#!/usr/bin/env python3
# check_youtube_comment_links.py  –  VIDEO_ID 매칭 검증 & 로그 저장

import pandas as pd, glob
from pathlib import Path

BASE   = Path(__file__).resolve().parents[2]
VID_DIR = BASE / "all" / "youtube"
COM_DIR = VID_DIR / "comment"
LOG_DIR = VID_DIR / "logs" / "comments"
LOG_DIR.mkdir(parents=True, exist_ok=True)

# ───── 1. 모든 영상 CSV에서 VIDEO_ID 집합 생성 ─────
video_files = glob.glob(str(VID_DIR / "*_videos_Filter_viedos.csv"))
vid_ids = set()

for vf in video_files:
    vdf = pd.read_csv(vf, usecols=["VIDEO_ID"], encoding="utf-8-sig")
    vid_ids.update(vdf["VIDEO_ID"].dropna().astype(str))

print(f"📊 영상 VIDEO_ID 총 {len(vid_ids):,}개 수집")

# ───── 2. 댓글 CSV 순회 & 불일치 로그 ─────
comment_files = glob.glob(str(COM_DIR / "*_comments.csv"))
total_missing = 0

for cf in comment_files:
    cdf = pd.read_csv(
        cf,
        usecols=["COMMENT_ID", "VIDEO_ID", "AUTHOR_NAME", "COMMENT_TEXT", "PUBLISHED_AT"],
        encoding="utf-8-sig",
        engine="python",
    )

    # VIDEO_ID 미존재 + 빈 문자열 처리
    mask_missing = cdf["VIDEO_ID"].isna() | (cdf["VIDEO_ID"] == "") | (~cdf["VIDEO_ID"].astype(str).isin(vid_ids))
    miss_df = cdf[mask_missing]

    if not miss_df.empty:
        out_path = LOG_DIR / f"{Path(cf).stem}_missing_video.csv"
        miss_df.to_csv(out_path, index=False, encoding="utf-8-sig")
        total_missing += len(miss_df)
        print(f"⚠️  {Path(cf).name}: VIDEO_ID 매칭 실패 {len(miss_df)}행 → {out_path.name}")
    else:
        print(f"✅ {Path(cf).name}: 모두 매칭 OK")

print(f"\n종합 요약: 매칭 실패 댓글 {total_missing:,}행 (로그 폴더: {LOG_DIR})")