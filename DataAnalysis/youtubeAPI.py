"""
YouTube 특정 채널 200초 이하 쇼츠 수집 스크립트 〈handle 전용〉
────────────────────────────────────────────────────────
• 지정한 @handle 채널의 전체 업로드 영상 중
  duration ≤ 200초인 영상만 CSV로 저장
• channels.list?part=contentDetails&forHandle=… 호출로
  uploads 재생목록 ID를 바로 가져옴 (채널 ID 별도 변수 불필요)
────────────────────────────────────────────────────────
pip install requests isodate pandas
Python ≥ 3.8
"""

from __future__ import annotations

import time
from datetime import datetime
from pathlib import Path
from typing import List, Dict

import isodate
import pandas as pd
import requests

# ───────────────────── 0. 환경 설정 ─────────────────────
API_KEY: str = "AIzaSyBrB_bf2ZgNYIUv0V0KlwSwe5y2sM6jzwY"
CHANNEL_HANDLE: str = "@Hongji홍지"    # @를 포함한 handle 문자열

PER_PAGE_RESULTS: int  = 50  # playlistItems.list 한 페이지 최대 50
DETAILS_BATCH_SIZE: int = 50  # videos.list 한 번에 최대 50

BASE_DIR: Path = Path(__file__).resolve().parent

# ───────────────────── 1. 업로드 영상 ID 수집 ─────────────────────
def get_all_uploaded_video_ids_by_handle(handle: str) -> List[str]:
    """
    channels.list?part=contentDetails&forHandle=… 호출로
    uploads 재생목록 ID 바로 얻고, playlistItems 순회해
    모든 videoId 반환
    """
    h = handle.lstrip("@").strip()
    # 채널의 contentDetails (uploads playlist) 직접 조회
    res = requests.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={
            "part": "contentDetails",
            "forHandle": h,
            "key": API_KEY,
        },
        timeout=10,
    ).json()

    items = res.get("items", [])
    if not items:
        raise ValueError(f"채널 핸들(@{h})에 해당하는 정보가 없습니다.")
    uploads_playlist_id = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # uploads playlistItems 순회
    video_ids: List[str] = []
    next_token: str | None = None
    while True:
        r = requests.get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            params={
                "part": "snippet",
                "playlistId": uploads_playlist_id,
                "maxResults": PER_PAGE_RESULTS,
                "pageToken": next_token,
                "key": API_KEY,
            },
            timeout=10,
        ).json()
        for it in r.get("items", []):
            vid = it["snippet"]["resourceId"].get("videoId")
            if vid:
                video_ids.append(vid)
        next_token = r.get("nextPageToken")
        if not next_token:
            break

    return video_ids

# ───────────────────── 2. 영상 메타 조회 ─────────────────────
def get_video_details(video_ids: List[str]) -> List[Dict]:
    """videos.list → contentDetails,statistics,snippet 배치 호출"""
    details: List[Dict] = []
    for i in range(0, len(video_ids), DETAILS_BATCH_SIZE):
        chunk = video_ids[i : i + DETAILS_BATCH_SIZE]
        r = requests.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={
                "part": "contentDetails,statistics,snippet",
                "id": ",".join(chunk),
                "key": API_KEY,
            },
            timeout=10,
        ).json()
        details.extend(r.get("items", []))
    return details

# ───────────────────── 3. 유틸 & CSV 저장 ─────────────────────
def iso_to_date(iso: str) -> str:
    return datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d")

def make_video_id(author: str, iso: str) -> str:
    date = iso_to_date(iso).replace("-", "")
    return f"{author.lower().replace(' ', '_')}_{date}"

def safe_to_csv(df: pd.DataFrame, base: str) -> None:
    name = f"{base}.csv"
    try:
        df.to_csv(name, index=False, encoding="utf-8-sig")
        print(f"✅ {name} 저장 완료")
    except PermissionError:
        alt = f"{base}_{time.strftime('%Y%m%d_%H%M%S')}.csv"
        df.to_csv(alt, index=False, encoding="utf-8-sig")
        print(f"⚠️ '{name}' 열려 있음 → '{alt}' 로 저장")

# ───────────────────── 4. 메인 실행 ─────────────────────
def run() -> None:
    # 업로드된 모든 영상 ID 수집
    all_ids = get_all_uploaded_video_ids_by_handle(CHANNEL_HANDLE)
    print(f"📦 업로드된 영상 수: {len(all_ids):,}")

    # 메타 정보 조회
    details = get_video_details(all_ids)
    print(f"📝 메타 조회 영상 수: {len(details):,}")

    # 200초 이하 필터링
    filtered: List[Dict] = []
    for v in details:
        dur_iso = v["contentDetails"].get("duration", "PT0S")
        try:
            secs = isodate.parse_duration(dur_iso).total_seconds()
        except Exception:
            continue
        if secs <= 200:
            filtered.append(v)
    print(f"🎯 200초 이하 영상 수: {len(filtered):,}")

    # CSV 준비 및 저장
    rows: List[Dict] = []
    for v in filtered:
        s = v["snippet"]
        stat = v.get("statistics", {})
        vid = make_video_id(s["channelTitle"], s["publishedAt"])
        rows.append({
            "VIDEO_ID":      vid,
            "KEYWORD_ID": "",# 추후에 파싱예정
            "TITLE":         s.get("title", ""),
            "DESCRIPTION":   s.get("description", "").replace("\n", " "),
            "CHANNEL_TITLE": s["channelTitle"],
            "PUBLISHED_AT":  iso_to_date(s["publishedAt"]),
            "DURATION":      v["contentDetails"].get("duration", ""),
            "VIEW_COUNT":    stat.get("viewCount", 0),
            "LIKE_COUNT":    stat.get("likeCount", 0),
            "COMMENT_COUNT": stat.get("commentCount", 0),
            "PLATFORM":      "youtube",
        })

    safe_to_csv(pd.DataFrame(rows), "Hongji홍지_youtube_videos")

if __name__ == "__main__":
    run()
