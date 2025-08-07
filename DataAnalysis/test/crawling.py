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
def load_all_comments(driver, max_scrolls=10, max_more_clicks=10):
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
            # 사용자가 제공한 XPath 구조와 클래스 이름을 조합하여 CSS Selector 사용
            # XPath: body > div... > ul > div:nth-child(3) > div > div > li > div > button
            # 클래스 이름: "_abl-"
            # 이를 조합하여 'ul > div:nth-child(3) button._abl-' CSS Selector 사용
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
            # 버튼이 없거나 클릭 실패 시 중단
            # print(f"❌ '댓글 더 읽어들이기' 버튼 클릭 실패 또는 없음: {e}") # 디버깅용
            break

# 계정 게시물 크롤링 함수
def crawl_account_with_next(driver, username, start_index=0, limit=5):
    url = f"https://www.instagram.com/{username}/"
    driver.get(url)
    time.sleep(5) # 페이지 로딩 대기

    collected_posts = []

    try:
        # 첫 게시글 썸네일 로드 대기
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div._aagw'))
        )
        # 첫 게시글 클릭
        thumbnail = driver.find_elements(By.CSS_SELECTOR, 'div._aagw')[0]
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
            # 다음 게시글 버튼 클릭
            next_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, 'div._aaqg._aaqh > button'))
            )
            current_url = driver.current_url # 현재 URL 저장
            driver.execute_script("arguments[0].click();", next_btn)
            # URL이 변경될 때까지 대기 (다음 게시물 로딩 확인)
            WebDriverWait(driver, 15).until(
                EC.url_changes(current_url)
            )
            time.sleep(3) # 다음 게시물 콘텐츠 로딩 추가 대기
        except Exception as e:
            print(f"❌ {start_index}번째 게시글로 이동 실패: {e}")
            return

    # 지정된 개수만큼 게시물 크롤링
    for i in range(limit):
        try:
            # 게시글 본문 요소 로드 대기
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'div._a9zr'))
            )

            # 날짜 추출
            post_date = "날짜 없음"
            try:
                time_elem = driver.find_element(By.CSS_SELECTOR, 'time')
                date_text = time_elem.get_attribute("title")
                post_date = extract_date_from_kor_format(date_text)
            except:
                pass

            # 본문/해시태그 추출
            pure_caption = "본문 없음"
            hashtags = []
            try:
                # 게시글 본문은 _a9zr 클래스를 가진 div 내에 있을 가능성이 높음
                caption_elem = driver.find_element(By.CSS_SELECTOR, 'div._a9zr')
                full_text = caption_elem.text.strip()
                words = full_text.split()
                hashtags = [w for w in words if w.startswith('#')]
                # 사용자 이름과 해시태그를 제외한 순수 본문 추출
                pure_caption = ' '.join([w for w in words if not w.startswith('#') and not w.startswith(username)])
            except:
                pass

            # 좋아요 수 추출
            like_count = "좋아요 없음"
            try:
                # 좋아요 수는 section 태그 내 span > a > span > span 에 위치할 가능성이 높음
                like_elem = driver.find_element(By.CSS_SELECTOR, 'section span > a > span > span')
                like_count = like_elem.text.strip()
            except:
                pass

            # 댓글 수집
            comments = []
            try:
                load_all_comments(driver) # 댓글 로드 함수 호출

                # 댓글 블록들을 찾아서 정보 추출
                # 댓글 본문은 _a9zr 클래스를 가진 div 내에 있을 가능성이 높음
                # 댓글 작성자는 h3, 댓글 내용은 _a9zr > div span, 댓글 시간은 div time
                comment_elements = driver.find_elements(By.CSS_SELECTOR, 'ul ul > div') # 댓글 목록의 각 항목
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
                        if len(comments) >= 100: # 댓글개수
                            break
                    except Exception as e:
                        # print(f"❌ 개별 댓글 파싱 실패: {e}") # 디버깅용
                        continue
            except Exception as e:
                print(f"❌ 댓글 수집 중 오류 발생: {e}")

            # 크롤링 결과 출력
            print(f"\n📌 게시글 {start_index + i + 1}")
            print("🗓 작성일:", post_date)
            print("❤️ 좋아요 수:", like_count)
            print("📝 본문:", pure_caption)
            print("🏷 해시태그:", hashtags)
            for c in comments:
                print(f"💬 댓글: {c['id']} | {c['date']} | {c['text']}")

            # 수집된 게시물 데이터 저장
            collected_posts.append({
                "작성일": post_date,
                "좋아요 수": like_count,
                "본문": pure_caption,
                "해시태그": ', '.join(hashtags),
                "댓글 목록": '\n'.join([f"{c['id']} | {c['date']} | {c['text']}" for c in comments])
            })

            # 다음 게시글로 이동
            if i < limit - 1: # 마지막 게시물이 아니면 다음으로 이동 시도
                try:
                    next_btn = WebDriverWait(driver, 10).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, 'div._aaqg._aaqh > button'))
                    )
                    current_url = driver.current_url # 현재 URL 저장
                    driver.execute_script("arguments[0].click();", next_btn)
                    # URL이 변경될 때까지 대기 (다음 게시물 로딩 확인)
                    WebDriverWait(driver, 15).until(
                        EC.url_changes(current_url)
                    )
                    time.sleep(3) # 다음 게시물 콘텐츠 로딩 추가 대기
                except Exception as e:
                    print(f"🔚 다음 게시글 없음 또는 이동 실패: {e}")
                    break
            else:
                print("✅ 지정된 게시글 수만큼 크롤링 완료.")

        except Exception as e:
            print(f"❌ 게시글 {start_index + i + 1} 처리 실패: {e}")
            break

    # 수집된 데이터를 CSV 파일로 저장
    if collected_posts:
        # 현재 스크립트 파일의 디렉토리 경로를 가져옴
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # 'DataAnalysis' 폴더 경로 생성
        data_analysis_dir = os.path.join(script_dir, 'DataAnalysis')
        
        # 'DataAnalysis' 폴더가 없으면 생성
        os.makedirs(data_analysis_dir, exist_ok=True)
        
        # CSV 파일 경로 설정 (DataAnalysis 폴더 내)
        file_path = os.path.join(data_analysis_dir, "fromseohee.csv")
        
        df = pd.DataFrame(collected_posts)

        # 파일이 이미 존재하면 헤더 없이 추가, 없으면 새로 생성
        if os.path.exists(file_path):
            df.to_csv(file_path, mode='a', header=False, index=False, encoding='utf-8-sig')
        else:
            df.to_csv(file_path, index=False, encoding='utf-8-sig')

        print(f"\n📁 CSV 저장 완료: {file_path}")
        print("📂 저장 위치:", os.path.dirname(file_path)) # 실제 저장된 디렉토리 출력
    else:
        print("⚠ 수집된 게시글이 없습니다. CSV 저장 생략.")


# 메인 실행 부분
if __name__ == "__main__":
    ig_id = "da.da.k200"  # 사용자 Instagram ID
    ig_pw = "Dh2000"     # 사용자 Instagram 비밀번호
    target_account = "fromseohee" # 크롤링할 대상 계정

    options = webdriver.ChromeOptions()
    # options.add_argument("--headless") # 백그라운드에서 크롬 실행 (UI 없이)
    # options.add_argument("--disable-gpu") # headless 모드에서 GPU 사용 안 함
    # options.add_argument("--no-sandbox") # 샌드박스 비활성화 (일부 환경에서 필요)
    # options.add_argument("--disable-dev-shm-usage") # /dev/shm 사용 비활성화 (Docker 등 환경에서 필요)

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    driver.set_window_size(1024, 768) # 창 크기 설정 (반응형 UI 대응)

    try:
        login_instagram(driver, ig_id, ig_pw)
        crawl_account_with_next(driver, target_account, start_index=100, limit=100)
    finally:
        driver.quit() # 작업 완료 후 드라이버 종료
