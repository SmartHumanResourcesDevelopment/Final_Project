#!/usr/bin/env python3
"""
YouTube 댓글 수집 스크립트 〈채널 업로드 기반 + 전체 댓글〉
────────────────────────────────────────────────────────
• INPUT_CSV에 지정된 TITLE 목록에 대해 해당 채널 업로드 전체에서
  TITLE과 정확히 일치하는 영상을 선별합니다.
• 선별된 영상의 댓글을 모두 수집하여 CSV로 저장합니다.
────────────────────────────────────────────────────────
Usage: 설정만 바꾸고 실행하세요.

pip install requests pandas isodate
Python ≥ 3.8
"""

from pathlib import Path
from datetime import datetime
from typing import List, Dict, Set, Any
import requests
import pandas as pd

# ───────────────────── 0. 설정 ─────────────────────
API_KEY        = "AIzaSyBhGLBy2TmykFW7nREP4eEauBSKwUmR8fo"
CHANNEL_HANDLE = "@toctocsia"
BASE_DIR       = Path(__file__).resolve().parent.parent
INPUT_CSV      = BASE_DIR / "filter" / "toctocsia_youtube_videos_Filter_viedos.csv"
OUTPUT_DIR     = BASE_DIR / "filter" / "comment"
PER_PAGE       = 50    # API 한 번에 조회할 최대 개수
MAX_COMMENT    = 100   # 댓글 스레드 한 페이지 최대

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ───────────────────── 유틸 함수 ─────────────────────
def parse_date(iso: str) -> str:
    return datetime.strptime(iso.split("T")[0], "%Y-%m-%d").strftime("%Y-%m-%d")

def generate_video_id(author: str, published_at: str) -> str:
    return f"{author.lower().replace(' ', '_')}_{parse_date(published_at).replace('-', '')}"

# ───────────────────── 채널 ID 조회 ─────────────────────
def get_channel_id(handle: str) -> str:
    h = handle.lstrip("@").strip()
    # (1) forHandle 시도
    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {"part": "id", "forHandle": h, "key": API_KEY}
    res = requests.get(url, params=params, timeout=10).json()
    items = res.get("items")
    if items and isinstance(items, list) and items[0].get("id"):
        return items[0]["id"]

    # (2) fallback: search.list
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {"part": "snippet", "q": h, "type": "channel", "maxResults": 1, "key": API_KEY}
    res = requests.get(url, params=params, timeout=10).json()
    items = res.get("items")
    if items and isinstance(items, list):
        snippet = items[0].get("snippet", {})
        channel_id = snippet.get("channelId")
        if channel_id:
            return channel_id

    # 둘 다 실패
    raise RuntimeError(
        f"채널 핸들(@{h}) 조회에 실패했습니다.\n"
        f"channels.list(forHandle) 응답: {res if 'items' in res else '<no items>'}"
    )

# ───────────────────── 업로드 목록 조회 ─────────────────────
def get_all_uploaded_video_ids(channel_id: str) -> List[str]:
    # contentDetails에서 uploads playlist ID 가져오기
    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {"part": "contentDetails", "id": channel_id, "key": API_KEY}
    res = requests.get(url, params=params, timeout=10).json()
    items = res.get("items") or []
    if not items:
        return []
    uploads = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # playlistItems 순회
    ids, token = [], None
    while True:
        url = "https://www.googleapis.com/youtube/v3/playlistItems"
        params = {
            "part": "snippet",
            "playlistId": uploads,
            "maxResults": PER_PAGE,
            "pageToken": token,
            "key": API_KEY,
        }
        res = requests.get(url, params=params, timeout=10).json()
        for it in res.get("items", []):
            vid = it.get("snippet", {}).get("resourceId", {}).get("videoId")
            if vid:
                ids.append(vid)
        token = res.get("nextPageToken")
        if not token:
            break
    return ids

def get_video_details(video_ids: List[str]) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    for i in range(0, len(video_ids), PER_PAGE):
        chunk = video_ids[i : i + PER_PAGE]
        url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            "part": "snippet,contentDetails,statistics",
            "id": ",".join(chunk),
            "key": API_KEY,
        }
        res = requests.get(url, params=params, timeout=10).json()
        items.extend(res.get("items", []))
    return items

# ───────────────────── 댓글 수집 ─────────────────────
def get_all_comments(video_id: str) -> List[Dict[str, Any]]:
    comments, token = [], None
    while True:
        url = "https://www.googleapis.com/youtube/v3/commentThreads"
        params = {
            "part": "snippet",
            "videoId": video_id,
            "maxResults": MAX_COMMENT,
            "pageToken": token,
            "textFormat": "plainText",
            "key": API_KEY,
        }
        res = requests.get(url, params=params, timeout=10).json()
        comments.extend(res.get("items", []))
        token = res.get("nextPageToken")
        if not token:
            break
    return comments

# ───────────────────── 메인 로직 ─────────────────────
def run():
    # 1) CSV 로드
    df = pd.read_csv(INPUT_CSV, encoding="utf-8-sig")
    titles = set(df["TITLE"].dropna().str.strip().str.lower())
    print(f"▶ CSV에 등록된 TITLE 수: {len(titles)}")

    # 2) 업로드 전체에서 videoId 조회
    ch_id = get_channel_id(CHANNEL_HANDLE)
    all_ids = get_all_uploaded_video_ids(ch_id)
    print(f"▶ 채널 업로드 영상 수: {len(all_ids)}")

    # 3) 상세 메타 조회 및 TITLE 매칭
    details = get_video_details(all_ids)
    matched = [
        v for v in details
        if v.get("snippet", {}).get("title", "").strip().lower() in titles
    ]
    print(f"▶ TITLE과 정확 일치 영상 수: {len(matched)}")

    # 4) 댓글 수집
    rows: List[Dict[str, Any]] = []
    for v in matched:
        snip = v["snippet"]
        vid_pk = generate_video_id(snip["channelTitle"], snip["publishedAt"])
        for idx, c in enumerate(get_all_comments(v["id"]), start=1):
            t = c["snippet"]["topLevelComment"]["snippet"]
            rows.append({
                "COMMENT_ID":   f"{vid_pk}_c{idx}",
                "VIDEO_ID":     vid_pk,
                "AUTHOR_NAME":  t.get("authorDisplayName", ""),
                "COMMENT_TEXT": t.get("textDisplay", ""),
                "PUBLISHED_AT": parse_date(t.get("publishedAt","")),
            })

    # 5) 결과 저장
    out = OUTPUT_DIR / f"{CHANNEL_HANDLE.lstrip('@')}_youtube_comments.csv"
    pd.DataFrame(rows).to_csv(out, index=False, encoding="utf-8-sig")
    print(f"✅ 총 {len(rows)}개의 댓글 저장 → {out}")

if __name__ == "__main__":
    run()
