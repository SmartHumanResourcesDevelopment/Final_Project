from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from datetime import datetime
import time


def login_instagram(driver, username, password):
    driver.get("https://www.instagram.com/accounts/login/")
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username")))
    driver.find_element(By.NAME, "username").send_keys(username)
    driver.find_element(By.NAME, "password").send_keys(password)

    try:
        driver.find_element(By.XPATH, '//*[@id="loginForm"]/div[1]/div[3]').click()
    except:
        driver.find_element(By.XPATH, '//button[@type="submit"]').click()

    time.sleep(5)
    try:
        driver.find_element(By.XPATH, '//button[contains(text(), "나중에 하기")]').click()
    except:
        pass

    print("✅ 로그인 완료")


def click_and_extract(driver, xpath):
    try:
        post_elem = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, xpath))
        )
        driver.execute_script("arguments[0].click();", post_elem)
        time.sleep(3)

        try:
            caption_elem = driver.find_element(By.XPATH, '//div[@data-testid="post-comment-root"]')
            raw_text = caption_elem.text.strip()
        except:
            raw_text = ""
            print("❌ 본문 없음")

        hashtags = [word for word in raw_text.split() if word.startswith("#")]
        caption = ' '.join([word for word in raw_text.split() if not word.startswith("#")])

        try:
            time_elem = driver.find_element(By.XPATH, '//time')
            post_date = time_elem.get_attribute("datetime")[:10]
        except:
            post_date = datetime.now().strftime("%Y-%m-%d")

        print("\n📄 게시글 정보")
        print("작성일:", post_date)
        print("본문:", caption)
        print("해시태그:", hashtags)

        try:
            close_btn = driver.find_element(By.XPATH, '//div[@aria-label="닫기"]')
            driver.execute_script("arguments[0].click();", close_btn)
        except:
            print("❌ 닫기 실패")

    except Exception as e:
        print(f"⚠️ 게시글 클릭 실패: {e}")


if __name__ == "__main__":
    username = "alfowko3258@gmail.com"
    password = "thdnf798A!"
    tag = "말차"

    xpath = '//section/main/div/div[2]/div/div[1]/div[1]/div/a/div/div[1]'

    options = webdriver.ChromeOptions()
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        login_instagram(driver, username, password)

        driver.get(f"https://www.instagram.com/explore/tags/{tag}/")
        time.sleep(5)

        click_and_extract(driver, xpath)

        input("\n⏳ 테스트 완료. Enter 키를 누르면 종료됩니다.")
    finally:
        driver.quit()
