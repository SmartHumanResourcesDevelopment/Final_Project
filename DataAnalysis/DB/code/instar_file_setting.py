#!/usr/bin/env python3
# transform_instagram_csv.py
# -----------------------------------------------
# instar_post_filter/*.csv → DB import용 CSV 생성
#   - Posts → instar_post_filter/filter/{prefix}_posts.csv
#   - Comments → instar_post_filter/comment/{prefix}_comments.csv
#   POST_ID는 "{prefix}_{작성일}" 형식으로 설정
# -----------------------------------------------

import re
import pandas as pd
from pathlib import Path

def parse_comments(raw_text: str):
    """
    댓글 목록 셀에서
      author | YYYY-MM-DD | comment_text (멀티라인)
    패턴으로 파싱하여 리스트 리턴
    """
    pattern = re.compile(
        r'(?ms)^(?P<author>.*?) \| (?P<date>\d{4}-\d{2}-\d{2}) \| (?P<text>.*?)(?=\n.*? \| \d{4}-\d{2}-\d{2} \| |\Z)'
    )
    results = []
    for m in pattern.finditer(raw_text):
        results.append({
            'COMMENTER_ID': m.group('author').strip(),
            'COMMENT_DATE': m.group('date').strip(),
            'COMMENT_TEXT': m.group('text').strip(),
        })
    return results

def main():
    base_dir     = Path(__file__).resolve().parent.parent
    instar_dir   = base_dir / 'instar_post_filter'
    posts_dir    = instar_dir / 'filter'
    comments_dir = instar_dir / 'comment'

    # 출력 디렉터리 생성
    posts_dir.mkdir(parents=True, exist_ok=True)
    comments_dir.mkdir(parents=True, exist_ok=True)

    for file_path in instar_dir.glob('*_filtered_food_posts.csv'):
        prefix = file_path.stem.replace('_filtered_food_posts', '')
        df     = pd.read_csv(file_path)

        posts    = []
        comments = []
        cid      = 1  # COMMENT_ID 카운터

        for _, row in df.iterrows():
            post_date = row['작성일']
            post_id   = f"{prefix}_{post_date}"
            author_id = f"{prefix}_{post_date}"

            # Posts 레코드 준비
            posts.append({
                'POST_ID':     post_id,
                'KEYWORD_ID':  '',  # 나중에 매핑
                'POST_TEXT':   row['본문'],
                'HASHTAGS':    row['해시태그'],
                'AUTHOR_ID':   author_id,
                'POST_DATE':   post_date,
                'LIKE_COUNT':  row['좋아요 수'],
                'PLATFORM':    'instagram',
            })

            # Comments 레코드 파싱
            raw_comments = row.get('댓글 목록', '')
            if pd.notna(raw_comments) and raw_comments.strip():
                for c in parse_comments(raw_comments):
                    comments.append({
                        'COMMENT_ID':    cid,
                        'POST_ID':       post_id,
                        'COMMENTER_ID':  c['COMMENTER_ID'],
                        'COMMENT_TEXT':  c['COMMENT_TEXT'],
                        'COMMENT_DATE':  c['COMMENT_DATE'],
                    })
                    cid += 1

        # CSV로 저장
        pd.DataFrame(posts).to_csv(
            posts_dir / f'{prefix}_posts.csv',
            index=False, encoding='utf-8-sig'
        )
        pd.DataFrame(comments).to_csv(
            comments_dir / f'{prefix}_comments.csv',
            index=False, encoding='utf-8-sig'
        )

        print(f'✔ 생성 완료: filter/{prefix}_posts.csv, comment/{prefix}_comments.csv')

if __name__ == '__main__':
    main()
