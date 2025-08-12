"""
YouTube 댓글 수집 스크립트 〈CSV 지정 + 채널 핸들〉
────────────────────────────────────────────────────────
• INPUT_CSV에 지정한 CSV에서 TITLE 목록 로드
• CHANNEL_HANDLE로 지정한 채널 전체 업로드 영상 중
  TITLE과 정확히 일치하는 영상만 선별
• 해당 영상의 댓글 전부 수집 → DB YOUTUBE_COMMENT 형식 CSV로 저장
────────────────────────────────────────────────────────
Usage: 설정만 바꾸고 실행하세요.

pip install requests pandas isodate
Python ≥ 3.8
"""

from pathlib import Path
from datetime import datetime
from typing import List, Dict
import requests
import pandas as pd

# ───────────────────── 0. 설정 ─────────────────────
API_KEY         = "AIzaSyD2Wy0KguRBTDUTlDwA5R3pdb4ltY3lmyI"
CHANNEL_HANDLE  = "@toctocsia"  # @을 포함한 채널 핸들
# 메타 CSV는 filter 폴더에 있습니다
INPUT_CSV  = Path(__file__).resolve().parent.parent / "filter" / "toctocsia_youtube_videos_Filter_viedos.csv"

# 댓글은 filter/comment 폴더 안에 저장
OUTPUT_DIR = Path(__file__).resolve().parent.parent / "filter" / "comment"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PER_PAGE_RESULTS    = 50   # playlistItems.list 한 페이지
MAX_COMMENT_RESULTS = 100  # commentThreads.list 한 페이지

# ───────────────────── 1. 유틸 ─────────────────────
def parse_date(iso: str) -> str:
    return datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d")

def generate_video_id(author: str, iso: str) -> str:
    date = parse_date(iso).replace("-", "")
    return f"{author.lower().replace(' ', '_')}_{date}"

# ───────────────────── 2. 채널/영상 ID 조회 ─────────────────────
def get_channel_id(handle: str) -> str:
    h = handle.lstrip("@").strip()
    # (1) forHandle 시도
    res = requests.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={"part":"id","forHandle":h,"key":API_KEY}, timeout=10
    ).json()
    items = res.get("items", [])
    if items:
        return items[0]["id"]
    # (2) search.list 폴백
    res = requests.get(
        "https://www.googleapis.com/youtube/v3/search",
        params={"part":"snippet","q":h,"type":"channel","maxResults":1,"key":API_KEY}, timeout=10
    ).json()
    items = res.get("items", [])
    if items and "snippet" in items[0]:
        return items[0]["snippet"]["channelId"]
    raise ValueError(f"채널 핸들(@{h})을 찾을 수 없습니다.")

def get_all_uploaded_video_ids(channel_id: str) -> List[str]:
    # uploads 재생목록 ID 조회
    res = requests.get(
        "https://www.googleapis.com/youtube/v3/channels",
        params={"part":"contentDetails","id":channel_id,"key":API_KEY}, timeout=10
    ).json()
    items = res.get("items", [])
    if not items:
        return []
    playlist = items[0]["contentDetails"]["relatedPlaylists"]["uploads"]

    # playlistItems 순회
    ids, token = [], None
    while True:
        r = requests.get(
            "https://www.googleapis.com/youtube/v3/playlistItems",
            params={
                "part":"snippet",
                "playlistId":playlist,
                "maxResults":PER_PAGE_RESULTS,
                "pageToken":token,
                "key":API_KEY
            }, timeout=10
        ).json()
        for it in r.get("items", []):
            vid = it["snippet"]["resourceId"].get("videoId")
            if vid:
                ids.append(vid)
        token = r.get("nextPageToken")
        if not token:
            break
    return ids

# ───────────────────── 3. 댓글 수집 ─────────────────────
def get_comments(video_id: str) -> List[Dict]:
    comments, token = [], None
    while True:
        r = requests.get(
            "https://www.googleapis.com/youtube/v3/commentThreads",
            params={
                "part":"snippet",
                "videoId":video_id,
                "maxResults":MAX_COMMENT_RESULTS,
                "pageToken":token,
                "textFormat":"plainText",
                "key":API_KEY
            }, timeout=10
        ).json()
        comments.extend(r.get("items", []))
        token = r.get("nextPageToken")
        if not token:
            break
    return comments

# ───────────────────── 4. 메인 ─────────────────────
def run():
    # 4-1) 제목 목록 로드
    if not INPUT_CSV.exists():
        raise FileNotFoundError(f"입력 CSV를 찾을 수 없습니다: {INPUT_CSV}")
    df = pd.read_csv(INPUT_CSV, encoding="utf-8-sig")
    if "TITLE" not in df.columns:
        raise KeyError("CSV에 'TITLE' 열이 없습니다.")
    titles = set(df["TITLE"].astype(str))

    # 4-2) 채널 업로드 영상 ID 수집
    ch_id = get_channel_id(CHANNEL_HANDLE)
    vids = get_all_uploaded_video_ids(ch_id)
    print(f"채널 {CHANNEL_HANDLE} 업로드 영상 수: {len(vids)}")

    # 4-3) 메타(batch 조회)에서 TITLE 매칭
    matched = []
    for i in range(0, len(vids), PER_PAGE_RESULTS):
        chunk = vids[i:i+PER_PAGE_RESULTS]
        r = requests.get(
            "https://www.googleapis.com/youtube/v3/videos",
            params={"part":"snippet","id":",".join(chunk),"key":API_KEY}, timeout=10
        ).json()
        for v in r.get("items", []):
            if v["snippet"]["title"] in titles:
                matched.append(v)
    print(f"매칭된 영상 수: {len(matched)}")

    # 4-4) 댓글 수집 & DB 포맷
    rows = []
    for v in matched:
        author = v["snippet"]["channelTitle"]
        pub_iso = v["snippet"]["publishedAt"]
        vid_pk = generate_video_id(author, pub_iso)
        for idx, c in enumerate(get_comments(v["id"]), 1):
            cs = c["snippet"]["topLevelComment"]["snippet"]
            rows.append({
                "COMMENT_ID":   f"{vid_pk}_c{idx}",
                "VIDEO_ID":     vid_pk,
                "AUTHOR_NAME":  cs.get("authorDisplayName",""),
                "COMMENT_TEXT": cs.get("textDisplay",""),
                "PUBLISHED_AT": parse_date(cs.get("publishedAt",""))
            })

    # 4-5) 결과 저장 (파일 경로로)
    handle_name = CHANNEL_HANDLE.lstrip("@")
    out_file = OUTPUT_DIR / f"{handle_name}_youtube_comments.csv"
    df_out = pd.DataFrame(rows)
    df_out.to_csv(out_file, index=False, encoding="utf-8-sig")
    print(f"✅ 댓글 CSV 저장: {out_file} ({len(df_out)} rows)")

if __name__ == "__main__":
    run()
