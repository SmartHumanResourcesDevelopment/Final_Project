"""
YouTube 영상·댓글 수집 스크립트 〈@handle 전용 + CSV 2종 저장〉
────────────────────────────────────────────────────────────────
• CSV(DB/Filtered/anunu.kr_filtered_food_posts.csv)의 '본문' 열과
  일치(대소문자·공백·'~16주' 등 꼬리표 제거 후)하는 3 분 이하 쇼츠만 수집
• 채널은 @handle 하나만 대상으로 함:
      ① channels.list?forHandle=… (1 quota) 시도
      ② 실패 시 search.list (100 quota) 폴백
• 결과 파일
      1) youtube_videos.csv   (YOUTUBE_VIDEO 테이블용)
      2) youtube_comments.csv (YOUTUBE_COMMENT 테이블용)
pip install requests isodate pandas
Python ≥ 3.8
"""

from __future__ import annotations

import re
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Set

import isodate
import pandas as pd
import requests

# ───────────────────── 0. 환경 설정 ─────────────────────
API_KEY: str = "AIzaSyBXd7zqgRUMpnYtM8DjAm2th-G4p8qRTJo"
CHANNEL_HANDLE: str = "@fromseohee"

BASE_DIR: Path = Path(__file__).resolve().parent
FILTER_CSV: Path = BASE_DIR / "DB" / "Filtered" / "fromseohee_filtered_food_posts.csv"

MAX_COMMENT_RESULTS: int = 50   # commentThreads.list 한 페이지
DETAILS_BATCH_SIZE: int = 50    # videos.list 상한

# ───────────────────── 1. 제목 전처리 ─────────────────────
_tail_pat = re.compile(r'(~|-|–)?\s*\d+\s*(주|일|시간)\s*$')

def clean_title(text: str | None) -> str:
    if not isinstance(text, str):
        return ""
    return _tail_pat.sub("", text.strip().lower()).strip()

def load_filter_titles() -> Set[str]:
    """
    CSV '본문' 열을 읽어 전처리된 제목 집합 반환.
    ① utf-8-sig → ② utf-8 → ③ cp949 → ④ euc-kr 순서로 시도
    ⑤ 모두 실패하면 chardet 로 추정 후 재시도
    """
    tried_enc = []

    for enc in ("utf-8-sig", "utf-8", "cp949", "euc-kr"):
        tried_enc.append(enc)
        try:
            df = pd.read_csv(FILTER_CSV, encoding=enc)
            if "본문" in df.columns:
                print(f"✔ CSV 인코딩 감지: {enc}")
                return {clean_title(t) for t in df["본문"].dropna()}
        except UnicodeDecodeError:
            continue

    # ⑤ chardet fallback
    try:
        import chardet
        with open(FILTER_CSV, "rb") as f:
            raw = f.read(4096)          # 일부만 읽어도 충분
        guess = chardet.detect(raw)["encoding"]
        tried_enc.append(f"chardet→{guess}")
        df = pd.read_csv(FILTER_CSV, encoding=guess, errors="ignore")
        if "본문" in df.columns:
            print(f"✔ CSV 인코딩 감지(chardet): {guess}")
            return {clean_title(t) for t in df["본문"].dropna()}
    except Exception as e:
        print(f"chardet 실패: {e}")

    raise FileNotFoundError(
        f"CSV 파일을 읽을 수 없습니다: {FILTER_CSV}\n"
        f"시도한 인코딩: {', '.join(tried_enc)}"
    )

# ───────────────────── 2. 채널 & 업로드 목록 ─────────────────────
def channel_id_from_handle(handle: str) -> str:
    """@handle → channelId  (forHandle 우선, search.list 폴백)"""
    h = handle.lstrip("@").strip()

    # (1) forHandle (1 quota unit)
    res = requests.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={"part": "id", "forHandle": h, "key": API_KEY},
        timeout=10,
    ).json()
    if res.get("items"):
        return res["items"][0]["id"]

    # (2) fallback: search.list (100 quota units)
    res = requests.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={
            "part": "snippet",
            "q": handle,
            "type": "channel",
            "maxResults": 1,
            "key": API_KEY,
        },
        timeout=10,
    ).json()
    try:
        return res["items"][0]["snippet"]["channelId"]
    except (KeyError, IndexError):
        raise ValueError(f"채널(@{h})을 YouTube API에서 찾을 수 없습니다.")


def get_all_uploaded_video_ids_by_handle(handle: str) -> List[str]:
    """@handle 기준 uploads 재생목록 → 모든 videoId"""
    ch_id = channel_id_from_handle(handle)

    # 채널 contentDetails → uploads playlist ID
    uploads = requests.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={"part": "contentDetails", "id": ch_id, "key": API_KEY},
        timeout=10,
    ).json()["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    ids, token = [], None
    while True:
        res = requests.get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            params={
                "part": "snippet",
                "playlistId": uploads,
                "maxResults": 50,
                "pageToken": token,
                "key": API_KEY,
            },
            timeout=10,
        ).json()
        ids += [i["snippet"]["resourceId"]["videoId"] for i in res.get("items", [])]
        token = res.get("nextPageToken")
        if not token:
            break
    return ids


# ───────────────────── 3. 상세 메타 & 댓글 ─────────────────────
def get_video_details(video_ids: List[str]) -> List[Dict]:
    items: List[Dict] = []
    for i in range(0, len(video_ids), DETAILS_BATCH_SIZE):
        res = requests.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={
                "part": "contentDetails,statistics,snippet",
                "id": ",".join(video_ids[i : i + DETAILS_BATCH_SIZE]),
                "key": API_KEY,
            },
            timeout=10,
        ).json()
        items += res.get("items", [])
    return items


def get_comments(video_id: str) -> List[Dict]:
    res = requests.get(
        "https://www.googleapis.com/youtube/v3/commentThreads",
        params={
            "part": "snippet",
            "videoId": video_id,
            "maxResults": MAX_COMMENT_RESULTS,
            "textFormat": "plainText",
            "key": API_KEY,
        },
        timeout=10,
    ).json()
    return res.get("items", [])


# ───────────────────── 4. 보조 함수 ─────────────────────
def iso_to_date(iso: str) -> str:
    return datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d")


def make_video_id(author: str, iso: str) -> str:
    return f"{author.lower().replace(' ', '_')}_{iso_to_date(iso).replace('-', '')}"


def safe_to_csv(df: pd.DataFrame, base: str) -> None:
    name = f"{base}.csv"
    try:
        df.to_csv(name, index=False, encoding="utf-8-sig")
        print(f"✅ {name} 저장 완료")
    except PermissionError:
        alt = f"{base}_{time.strftime('%Y%m%d_%H%M%S')}.csv"
        df.to_csv(alt, index=False, encoding="utf-8-sig")
        print(f"⚠️ '{name}' 열려 있음 → '{alt}' 로 저장")


# ───────────────────── 5. 메인 로직 ─────────────────────
def run() -> None:
    filters = load_filter_titles()
    print(f"🔎 필터 제목 수: {len(filters):,}")

    all_ids = get_all_uploaded_video_ids_by_handle(CHANNEL_HANDLE)
    print(f"📦 업로드 영상 수(전체): {len(all_ids):,}")

    details = get_video_details(all_ids)
    matched = [v for v in details if is_title_match(v['snippet']['title'], filters)]
    print(f"✅ 제목 매칭 영상: {len(matched):,}")

    shorts = []
    for v in matched:
        try:
            if isodate.parse_duration(v['contentDetails']['duration']).total_seconds() <= 180:
                shorts.append(v)
        except Exception:
            continue
    print(f"🎬 쇼츠(≤180초): {len(shorts):,}")

    video_rows, comment_rows = [], []
    for v in shorts:
        s, stat = v['snippet'], v.get('statistics', {})
        pk = make_video_id(s['channelTitle'], s['publishedAt'])

        video_rows.append({
            "VIDEO_ID": pk,
            "KEYWORD_ID": 0,
            "TITLE": s.get("title", ""),
            "DESCRIPTION": s.get("description", "").replace("\n", " "),
            "CHANNEL_TITLE": s["channelTitle"],
            "PUBLISHED_AT": iso_to_date(s["publishedAt"]),
            "VIEW_COUNT": stat.get("viewCount", 0),
            "LIKE_COUNT": stat.get("likeCount", 0),
            "COMMENT_COUNT": stat.get("commentCount", 0),
            "PLATFORM": "youtube",
        })

        for idx, c in enumerate(get_comments(v["id"]), 1):
            cs = c["snippet"]["topLevelComment"]["snippet"]
            comment_rows.append({
                "COMMENT_ID": f"{pk}_c{idx}",
                "VIDEO_ID": pk,
                "AUTHOR_NAME": cs.get("authorDisplayName", ""),
                "COMMENT_TEXT": cs.get("textDisplay", ""),
                "PUBLISHED_AT": iso_to_date(cs.get("publishedAt", "")),
            })

    if video_rows:
        safe_to_csv(pd.DataFrame(video_rows), "fromseohee_youtube_videos")
    else:
        print("⚠️ 저장할 영상이 없습니다.")

    if comment_rows:
        safe_to_csv(pd.DataFrame(comment_rows), "fromseohee_youtube_comments")
    else:
        print("⚠️ 저장할 댓글이 없습니다.")


# ───────────────────── 6. 실행 ─────────────────────
if __name__ == "__main__":
    run()
