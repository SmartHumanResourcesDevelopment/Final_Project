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
KEYWORDS = [
    "마라탕", "말차", "떡볶이", "불닭", "김밥", "편의점", "초밥", "회오리감자", "닭강정", "국밥",
    "버블티", "젤라또", "프라푸치노", "쿠앤크", "젤리", "카페투어", "브런치", "크로플", "팬케이크", "샌드위치",
    "라멘", "우동", "쌀국수", "햄버거", "치킨", "피자", "떡라면", "샐러드", "분식", "바나나우유",
    "메가커피", "이디야", "공차", "빽다방", "스타벅스", "할리스", "투썸", "던킨", "탐앤탐스", "배스킨라빈스",
    "삼립", "오뚜기", "팔도", "농심", "빙그레", "롯데푸드", "해태", "노브랜드", "CJ제일제당", "쿠팡",
    "브이로그", "먹방", "카공", "플로깅", "피크닉", "무인카페", "야외카페", "셀카", "룩북", "OOTD",
    "마켓컬리", "배달의민족", "요기요", "당근마켓", "비건", "제로음료", "저탄고지", "홈카페", "홈쿡", "도시락",
    "냉동식품", "편의점도시락", "밀키트", "하이볼", "스프라이트", "제로콜라", "몽쉘", "빼빼로", "초코파이", "칸쵸",
    "빙수", "팥빙수", "망고빙수", "코스트코", "GS25", "CU", "세븐일레븐", "이마트24", "디저트카페", "노티드",
    "도넛", "마카롱", "에그타르트", "인생맛집", "숨은맛집", "핫플", "카페거리", "감성카페", "무드등", "스누피카페"
]

# 🔐 Instagram 로그인 정보
INSTAGRAM_ID = 'your_username'
INSTAGRAM_PW = 'your_password'
POST_LIMIT = 100
CSV_FILE = "insta_잘파세대_키워드_게시글.csv"

# 🗂️ 파일 없을 경우 헤더 생성
if not os.path.exists(CSV_FILE):
    pd.DataFrame(columns=["작성일", "본문", "해시태그", "플랫폼"]).to_csv(CSV_FILE, index=False, encoding='utf-8-sig')

# 🔌 인스타그램 클라이언트 설정
cl = Client()
cl.delay_range = [1.5, 4.0]  # 요청 간 딜레이 (초)
cl.login(INSTAGRAM_ID, INSTAGRAM_PW)

# 🔁 키워드별 크롤링
for keyword in KEYWORDS:
    print(f"\n🔍 [{keyword}] 게시글 수집 중...")
    try:
        medias = cl.hashtag_medias_recent(name=keyword, amount=POST_LIMIT)
        keyword_results = []

        for media in medias:
            caption = media.caption_text or ""
            if not is_korean(caption):
                continue

            hashtags = re.findall(r"#\w+", caption)
            clean_text = remove_hashtags(caption)

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
            print(f"⚠️ [{keyword}] 저장할 한국어 게시글 없음")

        # 🌙 속도 제한: 키워드 간 대기 시간
        sleep_sec = random.uniform(10, 20)
        print(f"⏳ 다음 키워드까지 {sleep_sec:.1f}초 대기...")
        time.sleep(sleep_sec)

    except Exception as e:
        print(f"❌ [{keyword}] 오류 발생: {e}")
        continue

print("\n✅ 전체 키워드 크롤링 종료.")
