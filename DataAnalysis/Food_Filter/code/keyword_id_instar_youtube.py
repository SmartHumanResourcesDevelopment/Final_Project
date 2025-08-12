#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob
import pandas as pd
from rapidfuzz import process, fuzz

def map_keyword_id(text, tags,
                   kw_names: list, kw_id_map: dict,
                   threshold: int = 70) -> str:
    # NaN 또는 숫자 입력도 안전하게 처리
    txt = "" if pd.isna(text) else str(text).lower()
    hts = "" if pd.isna(tags) else str(tags).lower()
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
    # 1) 스크립트 위치 기준 최상위 Food_Filter 디렉토리
    script_dir      = os.path.dirname(os.path.abspath(__file__))
    food_filter_dir = os.path.abspath(os.path.join(script_dir, os.pardir))

    # 2) 키워드 사전 파일
    keyword_dict_path = os.path.join(
        food_filter_dir, "komoran", "resultDic", "keyword_dictionary.csv"
    )

    # 3) 인스타그램 입력 파일
    insta_dir   = os.path.join(food_filter_dir, "instar_post_filter", "posts")
    insta_files = glob.glob(os.path.join(insta_dir, "*_posts.csv"))

    # 4) 유튜브 입력 파일
    youtube_dir   = os.path.join(food_filter_dir, "youtube_video_filter")
    youtube_files = glob.glob(os.path.join(youtube_dir, "*.csv"))

    # 5) 출력 디렉토리
    insta_out_dir   = os.path.join(food_filter_dir, "instar_post_filter", "keyword", "matching")
    youtube_out_dir = os.path.join(food_filter_dir, "youtube_video_filter", "keyword", "matching")
    os.makedirs(insta_out_dir, exist_ok=True)
    os.makedirs(youtube_out_dir, exist_ok=True)

    # 6) 키워드 사전 로드
    if not os.path.exists(keyword_dict_path):
        raise FileNotFoundError(f"키워드 사전이 없습니다: {keyword_dict_path}")
    kw_df     = pd.read_csv(keyword_dict_path, usecols=['keywordid','keywordname'], encoding='utf-8-sig')
    kw_id_map = dict(zip(kw_df['keywordname'], kw_df['keywordid']))
    kw_names  = list(kw_id_map.keys())

    print(f"📚 키워드 사전 로드: {len(kw_names)}개")
    print(f"📂 인스타 파일: {len(insta_files)}개, 유튜브 파일: {len(youtube_files)}개")
    print("=" * 60)

    # ── Instagram 처리
    for i, insta_file in enumerate(insta_files, 1):
        try:
            print(f"\n🔄 [{i}/{len(insta_files)}] {os.path.basename(insta_file)}")
            df = pd.read_csv(insta_file, encoding='utf-8-sig')
            before = len(df)

            # 키워드 매칭
            df['KEYWORD_ID'] = df.apply(
                lambda r: map_keyword_id(r.get('POST_TEXT'), r.get('HASHTAGS'),
                                         kw_names, kw_id_map),
                axis=1
            )
            # 매핑 실패(빈) 행 제거
            df = df[df['KEYWORD_ID'] != '']
            removed = before - len(df)
            if removed:
                print(f"   🚫 제거: {removed} / {before}행")
            print(f"   📈 유효 매칭: {len(df)} / {before}행")

            # 저장
            base = os.path.splitext(os.path.basename(insta_file))[0].replace('_posts','')
            out_path = os.path.join(insta_out_dir, f"{base}_keywordid.csv")
            df.to_csv(out_path, index=False, encoding='utf-8-sig')
            print(f"   💾 저장: {os.path.basename(out_path)}")

        except Exception as e:
            print(f"❌ 오류({os.path.basename(insta_file)}): {e}")

    # ── YouTube 처리
    for i, youtube_file in enumerate(youtube_files, 1):
        try:
            print(f"\n🔄 [{i}/{len(youtube_files)}] {os.path.basename(youtube_file)}")
            df = pd.read_csv(youtube_file, encoding='utf-8-sig')
            before = len(df)

            # 키워드 매칭
            df['KEYWORD_ID'] = df.apply(
                lambda r: map_keyword_id(r.get('TITLE'), r.get('DESCRIPTION'),
                                         kw_names, kw_id_map),
                axis=1
            )
            # 매핑 실패(빈) 행 제거
            df = df[df['KEYWORD_ID'] != '']
            removed = before - len(df)
            if removed:
                print(f"   🚫 제거: {removed} / {before}행")
            print(f"   📈 유효 매칭: {len(df)} / {before}행")

            # 저장
            base = os.path.splitext(os.path.basename(youtube_file))[0]
            out_path = os.path.join(youtube_out_dir, f"{base}_keywordid.csv")
            df.to_csv(out_path, index=False, encoding='utf-8-sig')
            print(f"   💾 저장: {os.path.basename(out_path)}")

        except Exception as e:
            print(f"❌ 오류({os.path.basename(youtube_file)}): {e}")

    print("\n🎉 매칭 완료!")
    print(f"   - 인스타: {len(insta_files)}개, 유튜브: {len(youtube_files)}개")

if __name__ == '__main__':
    main()
