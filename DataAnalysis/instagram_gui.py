import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import threading
import time
import random
from datetime import datetime

class InstagramCrawlerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Instagram 내 피드/게시글 크롤러 (댓글 포함)")
        self.root.geometry("650x650")
        self.results = []
        self.is_running = False

        # 입력 영역
        tk.Label(root, text="Instagram ID:").pack()
        self.entry_id = tk.Entry(root, width=40)
        self.entry_id.pack()

        tk.Label(root, text="Instagram Password:").pack()
        self.entry_pw = tk.Entry(root, show="*", width=40)
        self.entry_pw.pack()

        tk.Label(root, text="게시글 수 (최신순):").pack()
        self.entry_limit = tk.Entry(root, width=10)
        self.entry_limit.insert(0, "10")
        self.entry_limit.pack()

        tk.Label(root, text="댓글 수 (게시글당, 최대 몇 개):").pack()
        self.entry_comment_limit = tk.Entry(root, width=10)
        self.entry_comment_limit.insert(0, "5")
        self.entry_comment_limit.pack()

        # 버튼
        self.btn_start = tk.Button(root, text="크롤링 시작", command=self.start_crawling_thread)
        self.btn_start.pack(pady=10)

        self.btn_save = tk.Button(root, text="CSV 저장", command=self.save_csv)
        self.btn_save.pack(pady=5)

        # 진행률 및 결과
        self.progress = ttk.Progressbar(root, length=500, mode="determinate")
        self.progress.pack(pady=10)

        self.text_output = tk.Text(root, height=18)
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
        try:
            post_limit = int(self.entry_limit.get())
            comment_limit = int(self.entry_comment_limit.get())
        except ValueError:
            self.log("게시글 수/댓글 수는 숫자로 입력하세요.")
            return

        self.total_tasks = post_limit
        self.finished_tasks = 0

        options = webdriver.ChromeOptions()
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--start-maximized")
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

        try:
            self.login_instagram(self.driver, username, password)
            time.sleep(2)

            # 내 프로필 페이지 열기
            self.driver.get(f"https://www.instagram.com/{username}/")
            time.sleep(3)

            # 최신 게시글 크롤링
            self.crawl_my_posts(post_limit, comment_limit)

            self.driver.quit()
            self.log("전체 크롤링 완료")

        except Exception as e:
            self.log(f"크롤링 중 오류 발생: {e}")
            try:
                self.driver.quit()
            except:
                pass

    def crawl_my_posts(self, post_limit, comment_limit):
        for i in range(post_limit):
            try:
                row = i // 3 + 1
                col = i % 3 + 1
                xpath = f'/html/body/div[1]/div/div/div[2]/div/div/div[1]/div[1]/div[1]/section/main/div/div[2]/div/div[{row}]/div[{col}]/div/a'
                self.driver.find_element(By.XPATH, xpath).click()
                time.sleep(random.uniform(3.5, 6.0))

                # 본문, 날짜, 해시태그
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

                # 댓글 크롤링
                comments_data = []
                try:
                    comment_blocks = self.driver.find_elements(By.CSS_SELECTOR, "ul ul > div")[:comment_limit]
                    for cb in comment_blocks:
                        try:
                            user_id = cb.find_element(By.CSS_SELECTOR, 'h3').text.strip()
                            comment_text = cb.find_element(By.CSS_SELECTOR, 'div._a9zr > div span').text.strip()
                            comment_time_elem = cb.find_element(By.CSS_SELECTOR, 'div time')
                            comment_time = comment_time_elem.get_attribute("datetime")[:10]
                            comments_data.append(f"{user_id} | {comment_time} | {comment_text}")
                        except:
                            continue
                except:
                    pass

                self.results.append({
                    "작성일": post_date,
                    "본문": caption,
                    "해시태그": ", ".join(hashtags),
                    "플랫폼": "Instagram",
                    "댓글": "\n".join(comments_data) if comments_data else ""
                })
                self.log(f"{i+1}/{post_limit}번째 게시글 완료")

                # 닫기 버튼
                for close_xpath in [
                    '/html/body/div[5]/div[1]/div/div[2]/div',
                    '/html/body/div[6]/div[1]/div/div[2]/div'
                ]:
                    try:
                        self.driver.find_element(By.XPATH, close_xpath).click()
                        break
                    except:
                        continue
                time.sleep(random.uniform(1.5, 2.5))

            except Exception as e:
                self.log(f"{i+1}번째 게시글 실패: {e}")
                continue

            self.finished_tasks += 1
            self.progress["value"] = (self.finished_tasks / self.total_tasks) * 100

    def login_instagram(self, driver, username, password):
        driver.get("https://www.instagram.com/accounts/login/")
        time.sleep(5)
        driver.find_element(By.NAME, "username").send_keys(username)
        driver.find_element(By.NAME, "password").send_keys(password)
        driver.find_element(By.XPATH, '//button[@type="submit"]').click()
        time.sleep(6)
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
