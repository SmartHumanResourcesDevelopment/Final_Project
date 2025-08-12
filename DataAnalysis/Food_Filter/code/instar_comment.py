import os
import glob
import re
import pandas as pd

# 1) 상대 날짜 패턴 (예: 3시간 전, 2일 전 등) 제거용
date_pattern = re.compile(r'\d+\s*(시간|일|주|월|년)(\s*(전|후|동안|째|간))?\b')

# 2) 폴더 경로 정의
base_dir       = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'instar_post_filter'))
input_pattern  = os.path.join(base_dir, "*_food_filter.csv")
output_dir     = os.path.join(base_dir, "comment")
os.makedirs(output_dir, exist_ok=True)

for path in glob.glob(input_pattern):
    # 3) 필터된 포스트 파일 읽기
    df = pd.read_csv(path, encoding="utf-8-sig")
    
    author = os.path.basename(path).split("_")[0]  # ex: 'anunu.kr'
    
    records = []
    for _, row in df.iterrows():
        post_id  = row["POST_ID"]
        raw_coms = row.get("COMMENTS", "")
        if pd.isna(raw_coms) or not raw_coms.strip():
            continue
        
        # 한 포스트의 여러 댓글을 줄 단위로 분리
        for entry in raw_coms.splitlines():
            parts = [p.strip() for p in entry.split("|", 2)]
            if len(parts) != 3:
                continue
            commenter, date, text = parts
            
            # 상대 날짜가 남아있다면 제거
            text = date_pattern.sub("", text).strip()
            
            # 한국어 댓글만
            if not re.search(r"[가-힣]", text):
                continue
            
            records.append({
                "POST_ID":       post_id,
                "COMMENTER_ID":  commenter,
                "COMMENT_TEXT":  text,
                "COMMENT_DATE":  date
            })
    
    if not records:
        continue
    
    # 4) DataFrame 만들고 COMMENT_ID, AUTHOR_ID 삽입
    df_c = pd.DataFrame(records)
    df_c.insert(0, "COMMENT_ID", range(1, len(df_c) + 1))
    
    # 5) 컬럼 순서 재정렬
    df_c = df_c[
        ["COMMENT_ID", "POST_ID", "COMMENTER_ID", "COMMENT_TEXT", "COMMENT_DATE"]
    ]
    
    # 6) 파일 저장
    out_name = f"{author}_comment_filter.csv"
    out_path = os.path.join(output_dir, out_name)
    df_c.to_csv(out_path, index=False, encoding="utf-8-sig")
    print(f"✅ 댓글 파싱 저장: {out_name} ({len(df_c)} rows)")
