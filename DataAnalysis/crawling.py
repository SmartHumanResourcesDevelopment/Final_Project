from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import time
import re

def extract_date_from_kor_format(text):
    match = re.search(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일', text)
    if match:
        y, m, d = match.groups()
        return f"{y}-{int(m):02d}-{int(d):02d}"
    return None

def login_instagram(driver, username, password):
    driver.get("https://www.instagram.com/accounts/login/")
    time.sleep(9)
    driver.find_element(By.NAME, "username").send_keys(username)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.XPATH, '//button[@type="submit"]').click()
    time.sleep(10)

    try:
        driver.find_element(By.XPATH, '//button[contains(text(), "나중에 하기")]').click()
        time.sleep(2)
    except:
        pass

    print("✅ 로그인 완료")

def crawl_account_with_next(driver, username, limit=5):
    url = f"https://www.instagram.com/{username}/"
    driver.get(url)

    try:
        # _aagw 클래스의 썸네일이 보일 때까지 대기
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div._aagw'))
        )

        # 첫 번째 썸네일 요소 클릭
        thumbnail = driver.find_elements(By.CSS_SELECTOR, 'div._aagw')[0]
        post_link = thumbnail.find_element(By.XPATH, "./ancestor::a")
        driver.execute_script("arguments[0].click();", post_link)
        time.sleep(6)

    except Exception as e:
        print(f"❌ 첫 게시글 접근 실패: {e}")
        return

    for i in range(limit):
        try:
            # 날짜
            try:
                time_elem = driver.find_element(By.CSS_SELECTOR, 'time')
                date_text = time_elem.get_attribute("title")
                post_date = extract_date_from_kor_format(date_text)
            except:
                post_date = "날짜 없음"

            # 본문 및 해시태그 분리
            try:
                caption_elem = driver.find_element(By.CSS_SELECTOR, 'ul > div > li > div > div > div._a9zr')
                full_text = caption_elem.text.strip()
                hashtags = [w for w in full_text.split() if w.startswith('#')]
                pure_caption = ' '.join([w for w in full_text.split() if not w.startswith('#')])
            except:
                full_text = ""
                hashtags = []
                pure_caption = "본문 없음"

            # 좋아요 수
            try:
                like_elem = driver.find_element(By.CSS_SELECTOR, 'section span > a > span > span')
                like_count = like_elem.text.strip()
            except:
                like_count = "좋아요 없음"

            # 댓글
            comments = []
            try:
                comment_elems = driver.find_elements(By.CSS_SELECTOR, 'ul ul div > li > div > div > div._a9zr')
                for c in comment_elems[:9]:
                    comments.append(c.text.strip())
            except:
                pass

            # 출력
            print(f"\n📌 게시글 {i+1}")
            print("🗓 작성일:", post_date)
            print("❤️ 좋아요 수:", like_count)
            print("📝 본문:", pure_caption)
            print("🏷 해시태그:", hashtags)
            print("💬 댓글:", comments)

            # 다음 버튼 클릭
            try:
                next_btn = driver.find_element(By.CSS_SELECTOR, 'div._aaqg._aaqh > button')
                driver.execute_script("arguments[0].click();", next_btn)
                time.sleep(8)
            except:
                print("🔚 다음 게시글 없음")
                break

        except Exception as e:
            print(f"❌ 게시글 {i+1} 처리 실패: {e}")
            break

if __name__ == "__main__":
    ig_id = "alfowko3258@gmail.com"
    ig_pw = "thdnf798A!@"
    target_account = "anunu.eat"

    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        login_instagram(driver, ig_id, ig_pw)
        crawl_account_with_next(driver, target_account, limit=5)
    finally:
        driver.quit()
