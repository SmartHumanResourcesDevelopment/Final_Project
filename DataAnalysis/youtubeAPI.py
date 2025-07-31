import requests
import isodate
import pandas as pd
from datetime import datetime

API_KEY = "AIzaSyD1Yiy3zmbACWBeG7n5NHV3mrA4y_-HUBY"
CHANNEL_HANDLE = "@anunu"

# 채널 ID 조회
def get_channel_id(handle):
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": handle,
        "type": "channel",
        "maxResults": 1,
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    try:
        return res["items"][0]["snippet"]["channelId"]
    except:
        return None

# 업로드 영상 조회
def get_uploaded_videos(channel_id):
    url = "https://www.googleapis.com/youtube/v3/channels"
    params = {
        "part": "contentDetails",
        "id": channel_id,
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    playlist_id = res["items"][0]["contentDetails"]["relatedPlaylists"]["uploads"]

    url = "https://www.googleapis.com/youtube/v3/playlistItems"
    params = {
        "part": "snippet",
        "playlistId": playlist_id,
        "maxResults": 10,
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    return res.get("items", [])

# 영상 상세 정보 (duration, 통계 포함)
def get_video_details(video_ids):
    if not video_ids:
        return []
    url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "contentDetails,statistics,snippet",
        "id": ",".join(video_ids),
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    if "items" not in res:
        print("❌ API 응답 오류:", res)
    return res.get("items", [])

# 댓글 가져오기
def get_comments(video_id, max_results=3):
    url = "https://www.googleapis.com/youtube/v3/commentThreads"
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": max_results,
        "textFormat": "plainText",
        "key": API_KEY
    }
    res = requests.get(url, params=params).json()
    return res.get("items", [])

# 날짜 변환
def parse_date(iso):
    return datetime.strptime(iso, "%Y-%m-%dT%H:%M:%SZ").strftime("%Y-%m-%d")

# VIDEO_ID 생성 로직: 작성자_날짜
def generate_video_id(author_name, published_at_str):
    date_str = parse_date(published_at_str).replace("-", "")
    clean_name = author_name.lower().replace(" ", "_")
    return f"{clean_name}_{date_str}"

# 실행
def run():
    channel_id = get_channel_id(CHANNEL_HANDLE)
    if not channel_id:
        print("❌ 채널 ID 조회 실패")
        return

    videos = get_uploaded_videos(channel_id)
    print(f"📦 업로드 영상 수: {len(videos)}")

    video_ids = [item["snippet"]["resourceId"]["videoId"] for item in videos]
    details = get_video_details(video_ids)
    print(f"📦 상세 정보 가져온 영상 수: {len(details)}")

    shorts = []
    all_comments = []  # ← 댓글 저장용 리스트

    for video in details:
        d = video.get("contentDetails", {})
        s = video.get("snippet", {})
        stat = video.get("statistics", {})

        duration_str = d.get("duration", "PT0S")
        try:
            duration_sec = isodate.parse_duration(duration_str).total_seconds()
        except:
            duration_sec = 9999

        if duration_sec <= 180:
            shorts.append(video)

    print(f"\n🎬 쇼츠 영상 수 (180초 이하): {len(shorts)}")
    print("\n📦 [YOUTUBE_VIDEO] 테이블 입력 데이터:")

    for video in shorts:
        s = video["snippet"]
        d = video["contentDetails"]
        stat = video["statistics"]

        author = s["channelTitle"]
        pub_date = s["publishedAt"]
        video_id = generate_video_id(author, pub_date)

        video_row = {
            "VIDEO_ID": video_id,
            "KEYWORD_ID": 0,
            "TITLE": s.get("title", ""),
            "DESCRIPTION": s.get("description", "").replace("\n", " "),
            "CHANNEL_TITLE": author,
            "PUBLISHED_AT": parse_date(pub_date),
            "VIEW_COUNT": stat.get("viewCount", 0),
            "LIKE_COUNT": stat.get("likeCount", 0),
            "COMMENT_COUNT": stat.get("commentCount", 0),
            "PLATFORM": "youtube"
        }
        print(video_row)

        print(f"\n💬 [YOUTUBE_COMMENT] (VIDEO_ID: {video_id})")
        comments = get_comments(video["id"])
        for idx, c in enumerate(comments, start=1):
            cdata = c["snippet"]["topLevelComment"]["snippet"]
            comment_row = {
                "COMMENT_ID": f"{video_id}_c{idx}",
                "VIDEO_ID": video_id,
                "AUTHOR_NAME": cdata.get("authorDisplayName"),
                "COMMENT_TEXT": cdata.get("textDisplay"),
                "PUBLISHED_AT": parse_date(cdata.get("publishedAt"))
            }
            all_comments.append(comment_row)
            print(comment_row)

    # ✅ 댓글 CSV 저장
    if all_comments:
        df_comments = pd.DataFrame(all_comments)
        df_comments.to_csv("youtube_comments.csv", index=False, encoding="utf-8-sig")
        print("\n✅ 댓글 CSV 저장 완료: youtube_comments.csv")
    else:
        print("\n⚠️ 저장할 댓글이 없습니다.")

# 실행
if __name__ == "__main__":
    run()
