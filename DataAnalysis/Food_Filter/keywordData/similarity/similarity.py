#!/usr/bin/env python3
# fast_keyword_similarity.py

import json, math, re
import numpy as np
import oracledb
from openai import OpenAI
from tqdm import tqdm

# ── 설정 ─────────────────────────────
API_KEY      = ""           # 실제 키
EMBED_MODEL  = "text-embedding-ada-002"
CHAT_MODEL   = "gpt-4o"
TOP_K        = 5
MAX_BYTES    = 1000

client = OpenAI(api_key=API_KEY)

# ── DB ───────────────────────────────
oracledb.init_oracle_client()
conn = oracledb.connect(user="PARK", password="smhrd2",
                        dsn="project-db-campus.smhrd.com:1523/XE")
cur = conn.cursor()
cur.execute("SELECT KEYWORD_ID, KEYWORD_NAME FROM KEYWORD_DAILY_STATS")
rows = cur.fetchall()
ids, names = zip(*rows)
N = len(ids)
print(f"키워드 {N}개")

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

# ── 3) GPT 이유 + executemany 준비 ──
bind_rows = []
pk = 1
for i, sim_idx in tqdm(enumerate(idx_top), total=N, desc="GPT & batch"):
    sim_ids   = [ids[j] for j in sim_idx]
    sim_names = [names[j] for j in sim_idx]

    prompt = (
        f"입력 키워드: {names[i]}\n"
        f"유사 키워드: {', '.join(sim_names)}\n"
        "당신은 최고의 음식 트렌드 분석가입니다 잘파세대 관점에서 왜 함께 언급되거나 비슷한 트렌드인지 2~3문장 전문가처럼 설명해주세요." )
    try:
        
        rsp = client.chat.completions.create(
            model=CHAT_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7, max_tokens=120
        )
        reason = rsp.choices[0].message.content.strip()
    except Exception as e:
        reason = f"OpenAI 오류: {e}"

    if len(reason.encode()) > MAX_BYTES:
        reason = reason.encode()[:MAX_BYTES].decode("utf-8", "ignore")

    bind_rows.append({
        "id": pk, "in": ids[i],
        "s1": sim_ids[0], "s2": sim_ids[1], "s3": sim_ids[2],
        "s4": sim_ids[3], "s5": sim_ids[4], "rs": reason
    })
    pk += 1

# ── 4) executemany 한 번에 ───────────
merge_sql = """
MERGE INTO KEYWORD_SIMILARITY tgt
USING (SELECT :id ID, :in INPUT_ID, :s1 SIM1, :s2 SIM2, :s3 SIM3, :s4 SIM4, :s5 SIM5, :rs REASON FROM dual) src
ON (tgt.ID = src.ID)
WHEN MATCHED THEN
  UPDATE SET SIMILAR_1_ID=src.SIM1,SIMILAR_2_ID=src.SIM2,SIMILAR_3_ID=src.SIM3,
             SIMILAR_4_ID=src.SIM4,SIMILAR_5_ID=src.SIM5,REASON=src.REASON
WHEN NOT MATCHED THEN
  INSERT (ID,INPUT_ID,SIMILAR_1_ID,SIMILAR_2_ID,SIMILAR_3_ID,SIMILAR_4_ID,SIMILAR_5_ID,REASON)
  VALUES (src.ID,src.INPUT_ID,src.SIM1,src.SIM2,src.SIM3,src.SIM4,src.SIM5,src.REASON)
"""
print("DB 저장…")
cur.executemany(merge_sql, bind_rows, batcherrors=True)
conn.commit()

print("완료!")
cur.close(); conn.close()
