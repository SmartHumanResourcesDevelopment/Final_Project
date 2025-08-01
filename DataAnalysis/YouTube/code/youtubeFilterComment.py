#!/usr/bin/env python3
"""
YouTube 댓글 수집 스크립트 〈전체 댓글 저장〉
────────────────────────────────────────────────────────
• INPUT_CSV에 지정된 TITLE 목록에 대해 YouTube 전체를 검색
• TITLE과 정확히 일치하는 영상의 댓글을 전부 수집하여 저장합니다.
• 결과는 filter/comment/<handle>_youtube_comments.csv 로 저장됩니다.
────────────────────────────────────────────────────────
Usage: 설정만 바꾸고 실행하세요.

pip install requests pandas isodate
Python ≥ 3.8
"""

from pathlib import Path
from datetime import datetime
from typing import List, Dict, Set
import requests
import pandas as pd

# ───────────────────── 0. 설정 ─────────────────────
API_KEY             = "AIzaSyAWJcK5GsPP9Mpp_yHEQg3zYvZuG8UyOeQ"
CHANNEL_HANDLE      = "@anunu"
INPUT_CSV           = Path(__file__).resolve().parent.parent / "filter" / "anunu_youtube_videos_Filter_viedos.csv"
OUTPUT_DIR          = Path(__file__).resolve().parent.parent / "filter" / "comment"
PER_PAGE_RESULTS    = 50    # search.list & playlistItems.list 한 페이지 최대
MAX_COMMENT_RESULTS = 100   # commentThreads.list 한 페이지 최대

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ───────────────────── 1. 유틸 함수 ─────────────────────
def parse_date(iso: str) -> str:
    return datetime.strptime(iso.split("T")[0], "%Y-%m-%d").strftime("%Y-%m-%d")

def generate_video_id(author: str, published_at: str) -> str:
    date = parse_date(published_at).replace("-", "")
    return f"{author.lower().replace(' ', '_')}_{date}"

# ───────────────────── 2. 검색 및 매칭 ─────────────────────
def search_videos_by_title(title: str) -> Set[str]:
    target = title.strip().lower()
    video_ids: Set[str] = set()
    token: str | None = None

    while True:
        resp = requests.get(
            "https://www.googleapis.com/youtube/v3/search",
            params={
                "part":       "snippet",
                "q":          title,
                "type":       "video",
                "maxResults": PER_PAGE_RESULTS,
                "pageToken":  token,
                "key":        API_KEY,
            },
            timeout=10
        ).json()

        for item in resp.get("items", []):
            vid = item["id"].get("videoId")
            api_title = item["snippet"]["title"].strip().lower()
            if vid and api_title == target:
                video_ids.add(vid)

        token = resp.get("nextPageToken")
        if not token:
            break

    return video_ids

# ───────────────────── 3. 댓글 수집 ─────────────────────
def get_all_comments(video_id: str) -> List[Dict]:
    comments: List[Dict] = []
    token: str | None = None

    while True:
        resp = requests.get(
            "https://www.googleapis.com/youtube/v3/commentThreads",
            params={
                "part":       "snippet",
                "videoId":    video_id,
                "maxResults": MAX_COMMENT_RESULTS,
                "pageToken":  token,
                "textFormat": "plainText",
                "key":        API_KEY,
            },
            timeout=10
        ).json()

        comments.extend(resp.get("items", []))
        token = resp.get("nextPageToken")
        if not token:
            break

    return comments

# ───────────────────── 4. 메인 로직 ─────────────────────
def run():
    # 4-1) TITLE 목록 로드
    if not INPUT_CSV.exists():
        raise FileNotFoundError(f"입력 CSV가 없습니다: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV, encoding="utf-8-sig")
    if "TITLE" not in df.columns:
        raise KeyError("CSV에 'TITLE' 열이 없습니다.")
    titles = df["TITLE"].dropna().astype(str).unique()

    all_comments: List[Dict] = []

    # 4-2) TITLE별 검색 + 댓글 수집
    for title in titles:
        vids = search_videos_by_title(title)
        for vid in vids:
            # snippet 메타 조회 (ID 생성용)
            items = requests.get(
                "https://www.googleapis.com/youtube/v3/videos",
                params={"part":"snippet","id":vid,"key":API_KEY},
                timeout=10
            ).json().get("items", [])
            if not items:
                continue
            snip = items[0]["snippet"]
            vid_pk = generate_video_id(snip["channelTitle"], snip["publishedAt"])

            # 댓글 무제한 수집 (한글 필터 제거)
            threads = get_all_comments(vid)
            for idx, th in enumerate(threads, start=1):
                cs = th["snippet"]["topLevelComment"]["snippet"]
                text = cs.get("textDisplay", "")
                all_comments.append({
                    "COMMENT_ID":   f"{vid_pk}_c{idx}",
                    "VIDEO_ID":     vid_pk,
                    "AUTHOR_NAME":  cs.get("authorDisplayName", ""),
                    "COMMENT_TEXT": text,
                    "PUBLISHED_AT": parse_date(cs.get("publishedAt", "")),
                })

    # 4-3) 결과 저장
    handle = INPUT_CSV.stem.split("_")[0]
    out_file = OUTPUT_DIR / f"{handle}_youtube_comments.csv"
    pd.DataFrame(all_comments).to_csv(out_file, index=False, encoding="utf-8-sig")
    print(f"✅ 총 {len(all_comments)}개의 댓글 저장: {out_file}")

if __name__ == "__main__":
    run()
