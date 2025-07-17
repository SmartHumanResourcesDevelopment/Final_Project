from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import threading
import time
import re

def extract_date_from_text(text):
    match = re.search(r'(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일', text)
    if match:
        year, month, day = match.groups()
        return f"{year}-{int(month):02d}-{int(day):02d}"
    return None

def login_instagram(driver, username, password):
    driver.get("https://www.instagram.com/accounts/login/")
    time.sleep(5)
    driver.find_element(By.NAME, "username").send_keys(username)
    driver.find_element(By.NAME, "password").send_keys(password)
    driver.find_element(By.XPATH, '//button[@type="submit"]').click()
    time.sleep(5)

    try:
        not_now = driver.find_element(By.XPATH, '//button[contains(text(), "나중에 하기")]')
        not_now.click()
        time.sleep(2)
    except:
        pass

    if "challenge" in driver.current_url:
        print("2단계 인증 필요 → 20초 대기")
        time.sleep(20)

    if "login" in driver.current_url:
        raise Exception("로그인 실패")

    print("로그인 성공")

def open_tabs(driver, tags):
    handles = []
    for i, tag in enumerate(tags):
        if i == 0:
            driver.get(f"https://www.instagram.com/explore/tags/{tag}/")
        else:
            driver.execute_script("window.open('');")
            driver.switch_to.window(driver.window_handles[-1])
            driver.get(f"https://www.instagram.com/explore/tags/{tag}/")
        handles.append(driver.window_handles[-1])
        time.sleep(3)
        print(f"탭 열림: #{tag}")
    return handles

def crawl_posts(driver, tag, handle, total=3):
    driver.switch_to.window(handle)
    print(f"시작: #{tag}")
    time.sleep(3)

    posts = driver.find_elements(By.XPATH, '//main//article//a')

    for i in range(total):
        try:
            if i >= len(posts):
                print(f"#{tag} 게시글 {i+1} 없음")
                break

            # JS로 강제 클릭 → 클릭 차단 오류 방지
            driver.execute_script("arguments[0].click();", posts[i])
            time.sleep(2)

            # 본문 추출
            try:
                try:
                    caption_elem = driver.find_element(
                        By.XPATH,
                        '/html/body/div[5]/div[1]/div/div[3]/div/div/div/div/div[2]/div/article/div/div[2]/div/div/div[2]/div[1]/ul/div[1]/li/div/div/div[2]/div[1]/h1'
                    )
                except:
                    caption_elem = driver.find_element(
                        By.XPATH,
                        '/html/body/div[6]/div[1]/div/div[3]/div/div/div/div/div[2]/div/article/div/div[2]/div/div/div[2]/div[1]/ul/div[1]/li/div/div/div[2]/div[1]/h1'
                    )
                raw_caption = caption_elem.text.strip()
            except Exception as e:
                raw_caption = ""
                print(f"본문 추출 실패: {e}")

            # 날짜 추출
            try:
                time_elem = driver.find_element(By.XPATH, '//article//time')
                iso_date = time_elem.get_attribute("datetime")
                post_date = iso_date[:10]
            except:
                try:
                    title_date = driver.find_element(By.XPATH, '//article//time').get_attribute("title")
                    post_date = extract_date_from_text(title_date) or datetime.now().strftime("%Y-%m-%d")
                except:
                    post_date = datetime.now().strftime("%Y-%m-%d")

            hashtags = sorted(set([w for w in raw_caption.split() if w.startswith('#')]))
            caption = ' '.join([w for w in raw_caption.split() if not w.startswith('#')])

            print(f"\n#{tag} - 게시글 {i+1}")
            print("작성일:", post_date)
            print("본문:", caption)
            print("해시태그:", hashtags)

            # 닫기
            closed = False
            for close_xpath in [
                '/html/body/div[5]/div[1]/div/div[2]/div',
                '/html/body/div[6]/div[1]/div/div[2]/div'
            ]:
                try:
                    driver.find_element(By.XPATH, close_xpath).click()
                    closed = True
                    break
                except:
                    continue
            if not closed:
                print("❌ 닫기 버튼을 찾지 못했습니다")

            time.sleep(1)

            # 다음 게시글 대비 썸네일 다시 수집
            posts = driver.find_elements(By.XPATH, '//main//article//a')

        except Exception as e:
            print(f"게시글 {i+1} 실패: {e}")
            continue
    print(f"완료: #{tag}")

if __name__ == "__main__":
    username = "alfowko3258@gmail.com"
    password = "qudfhr123A!"
    tags = ["말차", "마라탕", "핫플", "크로플"]

    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        login_instagram(driver, username, password)
        handles = open_tabs(driver, tags)

        threads = []
        for tag, handle in zip(tags, handles):
            t = threading.Thread(target=crawl_posts, args=(driver, tag, handle, 5))
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        input("\n크롤링 완료. 창 닫지 않으려면 Enter")

    finally:
        driver.quit()
