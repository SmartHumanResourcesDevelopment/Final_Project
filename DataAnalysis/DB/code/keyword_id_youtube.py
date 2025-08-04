

#!/usr/bin/env python3
# keyword_id.py
# ──────────────────────────────────────────────────────────────────────────────
# 1) Instagram posts → DB/all/instar
#    • Read:   DB/instar_post_filter/filter/*_filtered_food_posts.csv
#    • Write:  DB/all/instar/{prefix}_posts.csv  (adds KEYWORD_ID)
#
# 2) YouTube videos → DB/all/youtube
#    • Read:   DB/youtube_video_filter/*_Filter_viedos.csv
#    • Write:  DB/all/youtube/{same_filename}.csv (adds KEYWORD_ID)
#
# • Instagram comments are untouched.
# • KEYWORD_ID 매핑 우선순위:
#     1) 본문(Instagram: “본문”, YouTube: TITLE+DESCRIPTION) 내 키워드명 포함
#     2) 해시태그(Instagram) 내 키워드명 포함
#     3) rapidfuzz 유사도 매칭 (threshold=70)
# • 키워드 사전: DB/all/combined_keyword_mentions.csv
# ──────────────────────────────────────────────────────────────────────────────

import pandas as pd
from pathlib import Path
from rapidfuzz import process, fuzz

def map_keyword_id(text: str, tags: str,
                   kw_names: list, kw_id_map: dict,
                   threshold: int = 70) -> str:
    txt = (text or "").lower()
    hts = (tags or "").lower()
    # 1) 본문 매칭
    for name in kw_names:
        if name.lower() in txt:
            return kw_id_map[name]
    # 2) 해시태그 매칭
    for name in kw_names:
        if name.lower() in hts:
            return kw_id_map[name]
    # 3) 유사도 매칭
    best, score, _ = process.extractOne(txt, kw_names, scorer=fuzz.WRatio)
    if score >= threshold:
        return kw_id_map[best]
    return ''

def main():
    # ── 기준 디렉터리: 이 파일이 있는 DB/code → .parent.parent = DB
    base_dir = Path(__file__).resolve().parent.parent
    all_dir  = base_dir / 'all'

    # 1) 키워드 사전 로드
    kw_file = all_dir / 'combined_keyword_mentions.csv'
    if not kw_file.exists():
        raise FileNotFoundError(f'키워드 사전이 없습니다: {kw_file}')
    kw_df     = pd.read_csv(kw_file, usecols=['KEYWORD_ID','KEYWORD_NAME'], encoding='utf-8-sig')
    kw_id_map = dict(zip(kw_df['KEYWORD_NAME'], kw_df['KEYWORD_ID']))
    kw_names  = list(kw_id_map.keys())

    # ── Instagram posts 처리
    insta_in   = base_dir / 'instar_post_filter' / 'filter'
    insta_out  = all_dir / 'instar'
    insta_out.mkdir(parents=True, exist_ok=True)

    for fp in insta_in.glob('*_filtered_food_posts.csv'):
        prefix = fp.stem.replace('_filtered_food_posts', '')
        df     = pd.read_csv(fp, encoding='utf-8-sig')

        # 새 컬럼 생성
        df['POST_ID']    = prefix + '_' + df['작성일'].astype(str)
        df['AUTHOR_ID']  = df['POST_ID']
        df['POST_TEXT']  = df['본문']
        df['HASHTAGS']   = df['해시태그']
        df['POST_DATE']  = df['작성일']
        df['LIKE_COUNT'] = df['좋아요 수']
        df['PLATFORM']   = 'instagram'
        df['KEYWORD_ID'] = df.apply(
            lambda r: map_keyword_id(r['POST_TEXT'], r['HASHTAGS'], kw_names, kw_id_map),
            axis=1
        )

        # 원하는 컬럼 순서로 추출
        out_cols = ['POST_ID','KEYWORD_ID','POST_TEXT','HASHTAGS',
                    'AUTHOR_ID','POST_DATE','LIKE_COUNT','PLATFORM']
        df[out_cols].to_csv(
            insta_out / f'{prefix}_posts.csv',
            index=False, encoding='utf-8-sig'
        )
        print(f'✔ Instagram → {prefix}_posts.csv')

    # ── YouTube videos 처리
    yt_in   = base_dir / 'youtube_video_filter' / 'filter'
    yt_out  = all_dir  / 'youtube'
    yt_out.mkdir(parents=True, exist_ok=True)

    for fp in yt_in.glob('*_videos_food.csv'):
        df = pd.read_csv(fp, encoding='utf-8-sig')

        # KEYWORD_ID 컬럼 추가
        df['KEYWORD_ID'] = df.apply(
            lambda r: map_keyword_id(f"{r.get('TITLE','')} {r.get('DESCRIPTION','')}",
                                     '',
                                     kw_names, kw_id_map),
            axis=1
        )

        # 저장할 컬럼 순서는 원본 + KEYWORD_ID
        cols = list(df.columns)
        # KEYWORD_ID를 두 번째 열로 끼워넣고 싶다면:
        cols.insert(1, cols.pop(cols.index('KEYWORD_ID')))

        df[cols].to_csv(
            yt_out / fp.name,
            index=False, encoding='utf-8-sig'
        )
        print(f'✔ YouTube → {fp.name}')

if __name__ == '__main__':
    main()
