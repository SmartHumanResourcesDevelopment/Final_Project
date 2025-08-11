#!/usr/bin/env python3
# fast_keyword_similarity.py

import json, math, re, time
import numpy as np
import oracledb
from openai import OpenAI
from tqdm import tqdm

# ── 설정 ─────────────────────────────
API_KEY      = ""
TOP_K        = 5
MAX_BYTES    = 1000
MAX_RETRIES  = 3  # 재연결 최대 시도 횟수
BATCH_SIZE   = 50 # DB 저장 배치 크기

client = OpenAI(api_key=API_KEY)

# ── DB 연결 관리 함수 ─────────────────
def create_connection():
    """Oracle DB 연결 생성"""
    try:
        oracledb.init_oracle_client(lib_dir="/opt/oracle/instantclient")
        conn = oracledb.connect(
            user="PARK",
            password="smhrd2",
            dsn="project-db-campus.smhrd.com:1523/XE"
        )
        print("✅ Oracle DB 연결 성공")
        return conn
    except Exception as e:
        print(f"❌ Oracle DB 연결 실패: {e}")
        return None

def reconnect_if_needed(conn, cur):
    """연결 상태 확인 및 재연결"""
    for attempt in range(MAX_RETRIES):
        try:
            # 간단한 쿼리로 연결 상태 확인
            cur.execute("SELECT 1 FROM DUAL")
            cur.fetchone()
            return conn, cur
        except Exception as e:
            print(f"⚠️ 연결 끊김 감지 (시도 {attempt + 1}/{MAX_RETRIES}): {e}")

            # 기존 연결 정리
            try:
                if conn:
                    conn.close()
            except:
                pass

            # 재연결 시도
            print("🔄 재연결 시도 중...")
            time.sleep(2)  # 2초 대기
            conn = create_connection()
            if conn:
                cur = conn.cursor()
                print("✅ 재연결 성공")
                return conn, cur
            else:
                print(f"❌ 재연결 실패 (시도 {attempt + 1}/{MAX_RETRIES})")

    raise Exception(f"재연결 {MAX_RETRIES}회 시도 후 실패")

def safe_execute(conn, cur, sql, params=None, fetch=False):
    """안전한 SQL 실행 (재연결 포함)"""
    for attempt in range(MAX_RETRIES):
        try:
            if params:
                cur.execute(sql, params)
            else:
                cur.execute(sql)

            if fetch:
                return cur.fetchall()
            return True

        except Exception as e:
            print(f"⚠️ SQL 실행 실패 (시도 {attempt + 1}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES - 1:
                conn, cur = reconnect_if_needed(conn, cur)
            else:
                raise e

# ── DB 초기 연결 및 데이터 조회 ─────────
conn = create_connection()
if not conn:
    print("❌ DB 연결 실패로 프로그램 종료")
    exit(1)

cur = conn.cursor()

# 키워드 데이터 조회 (안전한 실행)
print("📊 키워드 데이터 조회 중...")
rows = safe_execute(conn, cur, "SELECT KEYWORD_ID, KEYWORD_NAME FROM KEYWORD_DAILY_STATS", fetch=True)
ids, names = zip(*rows)
N = len(ids)
print(f"✅ 키워드 {N}개 조회 완료")

# ── 1) 임베딩 (배치) ─────────────────
print("임베딩 생성…")
emb = np.zeros((N, 1536), dtype=np.float32)
for i, name in tqdm(enumerate(names), total=N):
    e = client.embeddings.create(model=EMBED_MODEL, input=name)
    emb[i] = e.data[0].embedding
emb /= np.linalg.norm(emb, axis=1, keepdims=True)

print("유사도 행렬 계산…")
sim = emb @ emb.T
idx_top = np.argpartition(-sim, TOP_K+1, axis=1)[:, 1:TOP_K+1]

# ── 3) 기존 데이터 확인 및 GPT 처리 ──
print("📋 기존 데이터 확인 중...")
existing_data = {}
try:
    existing_rows = safe_execute(conn, cur, "SELECT INPUT_ID FROM KEYWORD_SIMILARITY", fetch=True)
    existing_data = {row[0] for row in existing_rows}
    print(f"✅ 기존 데이터 {len(existing_data)}개 확인")
except Exception as e:
    print(f"⚠️ 기존 데이터 확인 실패: {e}")

bind_rows = []
gpt_calls = 0
skipped = 0

for i, sim_idx in tqdm(enumerate(idx_top), total=N, desc="데이터 준비"):
    keyword_id = ids[i]

    # 이미 처리된 키워드는 건너뛰기
    if keyword_id in existing_data:
        skipped += 1
        continue

    sim_ids   = [ids[j] for j in sim_idx]
    sim_names = [names[j] for j in sim_idx]

    # 실제 유사 키워드가 있는지 확인 (자기 자신 제외)
    valid_sim_ids = [sid for sid in sim_ids if sid != keyword_id]
    valid_sim_names = [sim_names[i] for i, sid in enumerate(sim_ids) if sid != keyword_id]

    # 유효한 유사 키워드가 없으면 "없음"으로 처리
    if not valid_sim_ids:
        print(f"⚠️ '{names[i]}' 키워드는 유사 키워드가 없습니다.")

        # 유사 키워드가 5개 미만이면 0으로 채우기
        while len(sim_ids) < 5:
            sim_ids.append(0)
            sim_names.append("없음")

        # reason을 "없음"으로 설정하고 저장
        bind_rows.append({
            "keyword_id": keyword_id,
            "sim_ids": sim_ids,
            "reason": "없음"
        })
        continue

    # 유사 키워드가 5개 미만이면 0으로 채우기
    while len(sim_ids) < 5:
        sim_ids.append(0)
        sim_names.append("없음")

    # GPT 호출 (필요한 경우만)
    if gpt_calls < 100:  # 최대 100개만 GPT 호출
        # 프롬프트에는 유효한 유사 키워드만 포함
        prompt = (
            f"입력 키워드: {names[i]}\n"
            f"유사 키워드: {', '.join(valid_sim_names)}\n"
            "당신은 최고의 음식 트렌드 분석가입니다 잘파세대 관점에서 왜 함께 언급되거나 비슷한 트렌드인지 2~3문장 전문가처럼 설명해주세요." )
        try:
            rsp = client.chat.completions.create(
                model=CHAT_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7, max_tokens=120
            )
            reason = rsp.choices[0].message.content.strip()
            gpt_calls += 1
        except Exception as e:
            reason = f"OpenAI 오류: {e}"
    else:
        # GPT 호출 제한 초과 시 기본 설명 (유효한 키워드만 사용)
        valid_names_for_desc = valid_sim_names[:2] if len(valid_sim_names) >= 2 else valid_sim_names
        reason = f"{names[i]}와 {', '.join(valid_names_for_desc)} 등은 음식 트렌드에서 유사한 패턴을 보이며 함께 언급되는 경우가 많습니다."

    if len(reason.encode()) > MAX_BYTES:
        reason = reason.encode()[:MAX_BYTES].decode("utf-8", "ignore")

    bind_rows.append({
        "keyword_id": keyword_id,
        "sim_ids": sim_ids,
        "reason": reason
    })

print(f"📊 처리 결과: 신규 {len(bind_rows)}개, 기존 {skipped}개 건너뛰기, GPT 호출 {gpt_calls}회")

# ── 4) 간단한 INSERT 문으로 DB 저장 ───────────
insert_sql = """
INSERT INTO KEYWORD_SIMILARITY
(ID, INPUT_ID, SIMILAR_1_ID, SIMILAR_2_ID, SIMILAR_3_ID, SIMILAR_4_ID, SIMILAR_5_ID, REASON)
VALUES
(KEYWORD_SIMILARITY_SEQ.NEXTVAL, :1, :2, :3, :4, :5, :6, :7)
"""

print("💾 DB 저장 시작...")

if not bind_rows:
    print("📋 저장할 새로운 데이터가 없습니다.")
else:
    # 개별 INSERT로 안전하게 저장
    success_count = 0
    fail_count = 0

    for i, row_data in enumerate(tqdm(bind_rows, desc="DB 저장")):
        try:
            # 연결 상태 확인
            conn, cur = reconnect_if_needed(conn, cur)

            # 개별 INSERT 실행 (7개 파라미터 확인)
            params = [
                row_data["keyword_id"],      # :1 INPUT_ID
                row_data["sim_ids"][0],      # :2 SIMILAR_1_ID
                row_data["sim_ids"][1],      # :3 SIMILAR_2_ID
                row_data["sim_ids"][2],      # :4 SIMILAR_3_ID
                row_data["sim_ids"][3],      # :5 SIMILAR_4_ID
                row_data["sim_ids"][4],      # :6 SIMILAR_5_ID
                row_data["reason"]           # :7 REASON
            ]

            # 디버그: 첫 번째 레코드의 파라미터 확인
            if i == 0:
                print(f"🔍 첫 번째 레코드 파라미터: {params}")
                print(f"🔍 파라미터 개수: {len(params)}")

            cur.execute(insert_sql, params)
            conn.commit()
            success_count += 1

            # 10개마다 진행 상황 출력
            if (i + 1) % 10 == 0:
                print(f"📊 진행: {i + 1}/{len(bind_rows)} (성공: {success_count}, 실패: {fail_count})")

        except Exception as e:
            fail_count += 1
            print(f"❌ 레코드 {i + 1} 저장 실패: {e}")
            print(f"💥 DB 저장 실패로 프로그램을 종료합니다.")
            try:
                conn.rollback()
                cur.close()
                conn.close()
            except:
                pass
            exit(1)  # 즉시 종료

    print(f"� 저장 완료: 성공 {success_count}개, 실패 {fail_count}개")

print("🎉 모든 작업 완료!")

# 안전한 연결 종료
try:
    cur.close()
    conn.close()
    print("✅ DB 연결 정상 종료")
except Exception as e:
    print(f"⚠️ DB 연결 종료 중 오류: {e}")


# � 저장 완료: 성공 1222개, 실패 0개