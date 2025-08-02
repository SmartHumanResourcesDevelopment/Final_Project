from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import time
import re
import pandas as pd
import os

# 날짜 포맷 변환 함수
def extract_date_from_kor_format(text):
    # '년', '월', '일' 문자를 포함하는 한국어 날짜 형식에서 연, 월, 일을 추출
    match = re.search(r'(\d{4})[\uAC00-\uD7A3]*\s*(\d{1,2})[\uAC00-\uD7A3]*\s*(\d{1,2})[\uAC00-\uD7A3]*', text)
    if match:
        y, m, d = match.groups()
        return f"{y}-{int(m):02d}-{int(d):02d}"
    return "날짜 없음"

# Instagram 로그인 함수
def login_instagram(driver, username, password):
    driver.get("https://www.instagram.com/accounts/login/")
    # 로그인 페이지 로딩 대기
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.NAME, "username"))
    )
    driver.find_element(By.NAME, "username").send_keys(username)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.XPATH, '//button[@type="submit"]').click()
    # 로그인 완료 후 페이지 로딩 대기
    WebDriverWait(driver, 20).until(
        EC.url_changes("https://www.instagram.com/accounts/login/")
    )
    try:
        # '나중에 하기' 버튼이 있다면 클릭 (알림 설정 팝업)
        WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "나중에 하기")]'))
        ).click()
        time.sleep(2)
    except:
        pass # 버튼이 없으면 무시
    print("✅ 로그인 완료")

# 댓글 영역 끝까지 스크롤 및 '댓글 더 보기' 버튼 클릭 함수
def load_all_comments(driver, max_scrolls=15, max_more_clicks=15):
    # 댓글 영역이 로드될 때까지 대기
    try:
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'ul ul'))
        )
        comment_area = driver.find_element(By.CSS_SELECTOR, 'ul ul')
    except Exception as e:
        print(f"❌ 댓글 영역을 찾을 수 없습니다: {e}")
        return

    # 1. 댓글 영역 끝까지 스크롤 (댓글 더보기 버튼이 나타날 수 있도록)
    for _ in range(max_scrolls):
        last_height = driver.execute_script("return arguments[0].scrollHeight", comment_area)
        driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", comment_area)
        time.sleep(2) # 스크롤 후 로딩 대기
        new_height = driver.execute_script("return arguments[0].scrollHeight", comment_area)
        if new_height == last_height: # 더 이상 스크롤할 내용이 없으면 중단
            break

    # 2. '댓글 더 보기' 버튼 클릭 (최대 max_more_clicks회)
    for _ in range(max_more_clicks):
        try:
            more_button = WebDriverWait(driver, 5).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'ul > div:nth-child(3) button._abl-'))
            )
            
            # 버튼이 보이면 클릭
            if more_button.is_displayed():
                driver.execute_script("arguments[0].click();", more_button)
                time.sleep(3) # 댓글 로딩 대기 시간을 충분히 줌
                # 댓글 로드 후 다시 스크롤하여 새로 로드된 댓글이 보이도록 함
                driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight", comment_area)
                time.sleep(1)
            else:
                break # 버튼이 더 이상 보이지 않으면 중단
        except Exception as e:
            break

# 계정 게시물 크롤링 함수
def crawl_account_with_next(driver, username, start_index=0, limit=5):
    url = f"https://www.instagram.com/{username}/"
    driver.get(url)
    time.sleep(5) # 페이지 로딩 대기

    collected_posts = []

    try:
        reels_tab = WebDriverWait(driver, 5).until(
            EC.element_to_be_clickable((By.XPATH, '//a[contains(@href, "/reels/")]'))
        )
        driver.execute_script("arguments[0].click();", reels_tab)
        print("▶ 릴스 탭으로 이동 완료")
        time.sleep(5)  # 릴스 탭 로딩 대기
    except Exception as e:
        print(f"⚠ 릴스 탭 없음 또는 클릭 실패: {e} → 기본 피드 기준으로 진행")

    try:
        # 첫 게시글 썸네일 로드 대기
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'a > div._aajz'))
        )
        # 첫 게시글 클릭
        thumbnail = driver.find_elements(By.CSS_SELECTOR, 'a > div._aajz')[0]
        post_link = thumbnail.find_element(By.XPATH, "./ancestor::a")
        driver.execute_script("arguments[0].click();", post_link)
        # 게시글 모달 로딩 대기
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div[role="dialog"]'))
        )
        time.sleep(3) # 모달 내부 콘텐츠 로딩 추가 대기
    except Exception as e:
        print(f"❌ 첫 게시글 접근 실패: {e}")
        return

    # 시작 인덱스까지 이동
    for _ in range(start_index):
        try:
            next_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'div._aaqg._aaqh > button'))
            )
            current_url = driver.current_url
            driver.execute_script("arguments[0].click();", next_btn)
            WebDriverWait(driver, 15).until(
                EC.url_changes(current_url)
            )
            time.sleep(3)
        except Exception as e:
            print(f"❌ {start_index}번째 게시글로 이동 실패: {e}")
            return

    # 게시물 크롤링 반복
    for i in range(limit):
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'div._a9zr'))
            )

            post_date = "날짜 없음"
            try:
                time_elem = driver.find_element(By.CSS_SELECTOR, 'time')
                date_text = time_elem.get_attribute("title")
                post_date = extract_date_from_kor_format(date_text)
            except:
                pass

            pure_caption = "본문 없음"
            hashtags = []
            try:
                caption_elem = driver.find_element(By.CSS_SELECTOR, 'div._a9zr')
                full_text = caption_elem.text.strip()
                words = full_text.split()
                hashtags = [w for w in words if w.startswith('#')]
                pure_caption = ' '.join([w for w in words if not w.startswith('#') and not w.startswith(username)])
            except:
                pass

            like_count = "좋아요 없음"
            try:
                like_elem = driver.find_element(By.CSS_SELECTOR, 'section span > a > span > span')
                like_count = like_elem.text.strip()
            except:
                pass
            comments = []
            try:
                load_all_comments(driver)

                comment_elements = driver.find_elements(By.CSS_SELECTOR, 'ul ul > div')
                for block in comment_elements:
                    try:
                        user_id_elem = WebDriverWait(block, 2).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, 'h3'))
                        )
                        user_id = user_id_elem.text.strip()

                        comment_text_elem = WebDriverWait(block, 2).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, 'div._a9zr > div span'))
                        )
                        comment_text = comment_text_elem.text.strip()

                        comment_time_elem = WebDriverWait(block, 2).until(
                            EC.presence_of_element_located((By.CSS_SELECTOR, 'div time'))
                        )
                        comment_time = extract_date_from_kor_format(comment_time_elem.get_attribute("title"))

                        comments.append({
                            "id": user_id,
                            "text": comment_text,
                            "date": comment_time
                        })
                        if len(comments) >= 100:
                            break
                    except Exception:
                        continue
            except Exception as e:
                print(f"❌ 댓글 수집 중 오류 발생: {e}")

            print(f"\n📌 게시글 {start_index + i + 1}")
            print("🗓 작성일:", post_date)
            print("❤️ 좋아요 수:", like_count)
            print("📝 본문:", pure_caption)
            print("🏷 해시태그:", hashtags)
            for c in comments:
                print(f"💬 댓글: {c['id']} | {c['date']} | {c['text']}")

            collected_posts.append({
                "작성일": post_date,
                "좋아요 수": like_count,
                "본문": pure_caption,
                "해시태그": ', '.join(hashtags),
                "댓글 목록": '\n'.join([f"{c['id']} | {c['date']} | {c['text']}" for c in comments])
            })

            if i < limit - 1:
                try:
                    next_btn = WebDriverWait(driver, 10).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, 'div._aaqg._aaqh > button'))
                    )
                    current_url = driver.current_url
                    driver.execute_script("arguments[0].click();", next_btn)
                    WebDriverWait(driver, 15).until(
                        EC.url_changes(current_url)
                    )
                    time.sleep(3)
                except Exception as e:
                    print(f"🔚 다음 게시글 없음 또는 이동 실패: {e}")
                    break
            else:
                print("✅ 지정된 게시글 수만큼 크롤링 완료.")

        except Exception as e:
            print(f"❌ 게시글 {start_index + i + 1} 처리 실패: {e}")
            break

    # CSV 저장
    if collected_posts:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        data_analysis_dir = os.path.join(script_dir, 'DataAnalysis')
        os.makedirs(data_analysis_dir, exist_ok=True)
        file_path = os.path.join(data_analysis_dir, "fromseohee.csv")

        df = pd.DataFrame(collected_posts)

        if os.path.exists(file_path):
            df.to_csv(file_path, mode='a', header=False, index=False, encoding='utf-8-sig')
        else:
            df.to_csv(file_path, index=False, encoding='utf-8-sig')

        print(f"\n📁 CSV 저장 완료: {file_path}")
        print("📂 저장 위치:", os.path.dirname(file_path))
    else:
        print("⚠ 수집된 게시글이 없습니다. CSV 저장 생략.")

# 메인 실행 부분
if __name__ == "__main__":
    ig_id = "alfowko3258@gmail.com"  # 사용자 Instagram ID
    ig_pw = "qudfhr77A!"     # 사용자 Instagram 비밀번호
    target_account = "fromseohee"  # 크롤링할 대상 계정

    options = webdriver.ChromeOptions()
    # options.add_argument("--headless")  # 백그라운드 실행 시 활성화
    # options.add_argument("--disable-gpu")
    # options.add_argument("--no-sandbox")
    # options.add_argument("--disable-dev-shm-usage")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.set_window_size(1024, 768)  # 창 크기 설정

    try:
        login_instagram(driver, ig_id, ig_pw)
        crawl_account_with_next(driver, target_account, start_index=200, limit=100)
    finally:
        driver.quit()
