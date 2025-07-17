from instagrapi import Client
import pandas as pd
import re
import os
import time
import random

# ⛳️ 한글 여부 확인 함수
def is_korean(text):
    return bool(re.search(r"[가-힣]", text))

# 🎯 해시태그 제거 함수
def remove_hashtags(text):
    return re.sub(r"#\w+", "", text).strip()

# 📌 크롤링 키워드 100개
# "마라탕", "말차", "떡볶이", "불닭",

from instagrapi import Client
from instagrapi.exceptions import LoginRequired
import pandas as pd
import re
import os
import time
import random

# 설정 ========================
USERNAME = "your_instagram_username"
PASSWORD = "your_instagram_password"
PROXY = "http://<user>:<pass>@<host>:<port>"  # 예: http://id:pass@proxy.soax.com:9137
SESSION_FILE = "session.json"
CSV_FILE = "insta_잘파세대_키워드_게시글.csv"
POST_LIMIT = 100
# ============================

# 키워드 목록 (생략 가능)
KEYWORDS = []

# 한글 포함 여부 판별
def is_korean(text):
    return bool(re.search(r"[가-힣]", text))

# 해시태그 제거 함수
def remove_hashtags(text):
    return re.sub(r"#\w+", "", text).strip()

# 인스타그램 로그인 함수
def login_user():
    cl = Client()
    cl.set_proxy(PROXY)  # 프록시 적용
    cl.delay_range = [2.0, 5.0]  # 요청 간 랜덤 딜레이

    try:
        cl.load_settings(SESSION_FILE)
        cl.login(USERNAME, PASSWORD)
        try:
            cl.get_timeline_feed()  # 세션 유효성 확인
        except LoginRequired:
            print("❗ 세션 만료. 재로그인 중...")
            old = cl.get_settings()
            cl.set_settings({})
            cl.set_uuids(old.get("uuids"))
            cl.login(USERNAME, PASSWORD)
        cl.dump_settings(SESSION_FILE)  # 세션 갱신 저장
        print("✅ 로그인 완료")
        return cl
    except Exception as e:
        print(f"❌ 로그인 실패: {e}")
        raise

# CSV 파일 초기화
if not os.path.exists(CSV_FILE):
    pd.DataFrame(columns=["작성일", "본문", "해시태그", "플랫폼"]).to_csv(CSV_FILE, index=False, encoding='utf-8-sig')

# 로그인 후 크롤링 시작
cl = login_user()

for keyword in KEYWORDS:
    print(f"\n🔍 [{keyword}] 게시글 수집 중...")
    try:
        medias = cl.hashtag_medias_recent(name=keyword, amount=POST_LIMIT)
        keyword_results = []

        for media in medias:
            caption = media.caption_text or ""
            clean_text = remove_hashtags(caption)  # 해시태그 제거

            if not is_korean(clean_text):  # 본문에 한글이 없으면 스킵
                continue

            hashtags = re.findall(r"#\w+", caption)
            post_data = {
                "작성일": media.taken_at.strftime("%Y-%m-%d %H:%M:%S") if media.taken_at else "N/A",
                "본문": clean_text,
                "해시태그": ", ".join(hashtags),
                "플랫폼": "Instagram"
            }
            keyword_results.append(post_data)

        if keyword_results:
            df = pd.DataFrame(keyword_results, columns=["작성일", "본문", "해시태그", "플랫폼"])
            df.to_csv(CSV_FILE, mode='a', header=False, index=False, encoding='utf-8-sig')
            print(f"✅ [{keyword}] 저장 완료: {len(df)}개")
        else:
            print(f"⚠️ [{keyword}] 한국어 포함 게시글 없음")

        # 키워드 간 대기
        sleep_time = random.uniform(15, 25)
        print(f"⏳ 다음 키워드까지 {sleep_time:.1f}초 대기...")
        time.sleep(sleep_time)

    except Exception as e:
        print(f"❌ [{keyword}] 오류 발생: {e}")
        continue

print("\n✅ 전체 크롤링 완료")
