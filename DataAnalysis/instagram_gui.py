import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import pandas as pd
import threading
import time
from datetime import datetime

class InstagramCrawlerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Instagram Multi-Keyword Crawler")
        self.root.geometry("600x600")
        self.results = []
        self.is_running = False

        # 입력 영역
        tk.Label(root, text="Instagram ID:").pack()
        self.entry_id = tk.Entry(root, width=40)
        self.entry_id.pack()

        tk.Label(root, text="Instagram Password:").pack()
        self.entry_pw = tk.Entry(root, show="*", width=40)
        self.entry_pw.pack()

        tk.Label(root, text="검색할 해시태그들 (최대 4개, 쉼표로 구분):").pack()
        self.entry_tags = tk.Entry(root, width=50)
        self.entry_tags.insert(0, "말차, 마라탕")
        self.entry_tags.pack()

        tk.Label(root, text="게시글 수 (해시태그당):").pack()
        self.entry_limit = tk.Entry(root, width=10)
        self.entry_limit.insert(0, "10")
        self.entry_limit.pack()

        # 버튼
        self.btn_start = tk.Button(root, text="크롤링 시작", command=self.start_crawling_thread)
        self.btn_start.pack(pady=10)

        self.btn_save = tk.Button(root, text="CSV 저장", command=self.save_csv)
        self.btn_save.pack(pady=5)

        # 진행률 및 결과
        self.progress = ttk.Progressbar(root, length=400, mode="determinate")
        self.progress.pack(pady=10)

        self.text_output = tk.Text(root, height=15)
        self.text_output.pack()

    def log(self, message):
        self.text_output.insert(tk.END, f"{message}\n")
        self.text_output.see(tk.END)

    def start_crawling_thread(self):
        thread = threading.Thread(target=self.start_crawling)
        thread.start()

    def start_crawling(self):
        self.results.clear()
        self.progress["value"] = 0

        username = self.entry_id.get()
        password = self.entry_pw.get()
        tags = [tag.strip() for tag in self.entry_tags.get().split(",") if tag.strip()]

        if len(tags) > 4:
            self.log("해시태그는 최대 4개까지 입력 가능합니다.")
            return

        try:
            post_limit = int(self.entry_limit.get())
        except ValueError:
            self.log("게시글 수는 숫자로 입력하세요.")
            return

        self.total_tasks = len(tags)
        self.finished_tasks = 0

        options = webdriver.ChromeOptions()
        self.driver = webdriver.Chrome(service=Service("chromedriver.exe"), options=options)

        try:
            self.login_instagram(self.driver, username, password)

            # 첫 탭에 첫 해시태그 페이지 열기
            self.driver.get(f"https://www.instagram.com/explore/tags/{tags[0]}/")
            tab_handles = [self.driver.current_window_handle]
            time.sleep(3)

            # 나머지 해시태그 탭 생성
            for tag in tags[1:]:
                self.driver.execute_script("window.open('');")
                self.driver.switch_to.window(self.driver.window_handles[-1])
                self.driver.get(f"https://www.instagram.com/explore/tags/{tag}/")
                tab_handles.append(self.driver.current_window_handle)
                time.sleep(3)

            # 각 탭에서 크롤링 수행
            for tag, handle in zip(tags, tab_handles):
                self.driver.switch_to.window(handle)
                self.crawl_tag_in_tab(tag, post_limit)

            self.driver.quit()
            self.log("전체 크롤링 완료")

        except Exception as e:
            self.log(f"크롤링 중 오류 발생: {e}")
            try:
                self.driver.quit()
            except:
                pass

    def crawl_tag_in_tab(self, tag, post_limit):
        for i in range(post_limit):
            try:
                row = i // 3 + 1
                col = i % 3 + 1
                xpath = f'/html/body/div[1]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div/div[2]/div/div[{row}]/div[{col}]/div/a'
                self.driver.find_element(By.XPATH, xpath).click()
                time.sleep(2)

                try:
                    caption_elem = self.driver.find_element(By.XPATH, '//article//div[@data-testid="post-comment-root"]')
                    raw_caption = caption_elem.text.strip()
                except:
                    raw_caption = ""

                try:
                    time_elem = self.driver.find_element(By.XPATH, '//article//time')
                    iso_date = time_elem.get_attribute("datetime")
                    post_date = iso_date[:10]
                except:
                    post_date = datetime.now().strftime("%Y-%m-%d")

                hashtags = sorted(set([w for w in raw_caption.split() if w.startswith('#')]))
                caption = ' '.join([w for w in raw_caption.split() if not w.startswith('#')])

                self.results.append({
                    "본문": caption,
                    "해시태그": ", ".join(hashtags),
                    "작성일": post_date,
                    "플랫폼": "Instagram",
                    "키워드": tag
                })
                self.log(f"#{tag} → {i+1}/{post_limit} 완료")

                # 닫기 버튼 시도
                for close_xpath in [
                    '/html/body/div[5]/div[1]/div/div[2]/div',
                    '/html/body/div[6]/div[1]/div/div[2]/div'
                ]:
                    try:
                        self.driver.find_element(By.XPATH, close_xpath).click()
                        break
                    except:
                        continue
                time.sleep(1)

            except Exception as e:
                self.log(f"#{tag} 게시글 {i+1} 실패: {e}")
                continue

        self.finished_tasks += 1
        self.progress["value"] = (self.finished_tasks / self.total_tasks) * 100

    def login_instagram(self, driver, username, password):
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

    def save_csv(self):
        if not self.results:
            messagebox.showwarning("저장 실패", "먼저 크롤링을 실행하세요.")
            return
        file_path = filedialog.asksaveasfilename(defaultextension=".csv", filetypes=[("CSV 파일", "*.csv")])
        if file_path:
            df = pd.DataFrame(self.results)
            df.to_csv(file_path, index=False, encoding='utf-8-sig')
            messagebox.showinfo("저장 완료", f"{file_path}에 저장되었습니다.")

if __name__ == "__main__":
    root = tk.Tk()
    app = InstagramCrawlerApp(root)
    root.mainloop()
