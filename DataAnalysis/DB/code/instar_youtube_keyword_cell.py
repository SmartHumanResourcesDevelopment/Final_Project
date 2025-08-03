#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pandas as pd
import re
from pathlib import Path
import glob

def load_instagram_posts(insta_dir: Path) -> pd.DataFrame:
    files = glob.glob(str(insta_dir / '*_posts.csv'))
    dfs = []
    for file in files:
        df = pd.read_csv(file, encoding='utf-8-sig')
        # 필요한 컬럼만 뽑아서 통일된 이름으로 변경
        df = df[['작성일', '본문', '해시태그']].rename(
            columns={'작성일':'date', '본문':'text', '해시태그':'hashtags'})
        # 날짜 파싱
        df['date'] = pd.to_datetime(df['date']).dt.date
        dfs.append(df)
    if dfs:
        return pd.concat(dfs, ignore_index=True)
    else:
        return pd.DataFrame(columns=['date','text','hashtags'])

def load_youtube_videos(youtube_dir: Path) -> pd.DataFrame:
    files = glob.glob(str(youtube_dir / '*_videos.csv'))
    dfs = []
    for file in files:
        df = pd.read_csv(file, encoding='utf-8-sig')
        df = df[['PUBLISHED_AT', 'TITLE', 'DESCRIPTION']].rename(
            columns={'PUBLISHED_AT':'date', 'TITLE':'title', 'DESCRIPTION':'text'})
        df['date'] = pd.to_datetime(df['date']).dt.date
        # 제목+설명을 하나의 텍스트로 합침
        df['text'] = df['title'].fillna('') + ' ' + df['text'].fillna('')
        dfs.append(df[['date','text']])
    if dfs:
        return pd.concat(dfs, ignore_index=True)
    else:
        return pd.DataFrame(columns=['date','text'])

def main():
    BASE_DIR       = Path(__file__).resolve().parent.parent
    ALL_DIR        = BASE_DIR / 'all'
    INSTAGRAM_DIR  = BASE_DIR / 'instar_post_filter'
    YOUTUBE_DIR    = BASE_DIR / 'youtube_video_filter'
    OUTPUT_FILE    = ALL_DIR / 'keyword_daily_stats.csv'

    # 1) 키워드 불러오기
    kw_df = pd.read_csv(ALL_DIR / 'combined_keyword_mentions.csv', encoding='utf-8-sig')
    kw_df = kw_df[['KEYWORD_ID', 'KEYWORD_NAME']].drop_duplicates()

    # 2) 데이터 로드
    insta_df   = load_instagram_posts(INSTAGRAM_DIR)
    youtube_df = load_youtube_videos(YOUTUBE_DIR)

    # 3) Instagram은 본문+해시태그, YouTube는 title+description 으로 텍스트 통일
    insta_df['text'] = insta_df['text'].fillna('') + ' ' + insta_df['hashtags'].fillna('')
    insta_df = insta_df[['date','text']]
    all_df = pd.concat([insta_df, youtube_df], ignore_index=True)

    # 4) 날짜별·키워드별 언급 횟수 집계
    records = []
    for date, grp in all_df.groupby('date'):
        texts = grp['text']
        for _, kw in kw_df.iterrows():
            kw_id   = kw['KEYWORD_ID']
            kw_name = kw['KEYWORD_NAME']
            # 단어 단위 매칭 (대소문자 무시)
            pat = re.compile(r'\b{}\b'.format(re.escape(kw_name)), flags=re.IGNORECASE)
            cnt = texts.apply(lambda x: len(pat.findall(str(x)))).sum()
            if cnt > 0:
                records.append({
                    'KEYWORD_ID'  : kw_id,
                    'KEYWORD_NAME': kw_name,
                    'DAILY_COUNT' : int(cnt),
                    'STATS_DATE'  : date,
                })

    # 5) DataFrame 생성 → STATS_ID 추가 → CSV 저장
    if records:
        stats_df = pd.DataFrame(records)
        stats_df = stats_df.sort_values(['STATS_DATE','KEYWORD_ID']).reset_index(drop=True)
        stats_df.insert(0, 'STATS_ID', stats_df.index + 1)
        stats_df.to_csv(OUTPUT_FILE, index=False, date_format='%Y-%m-%d', encoding='utf-8-sig')
        print(f'✅ Daily stats saved to: {OUTPUT_FILE}')
    else:
        print('ℹ️ 언급된 키워드가 없습니다.')

if __name__ == '__main__':
    main()
