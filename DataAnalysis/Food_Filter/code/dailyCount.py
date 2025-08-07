#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob
import pandas as pd

def main():
    # 1) 스크립트 위치 기준으로 최상위 Food_Filter 디렉토리 찾아오기
    script_dir       = os.path.dirname(os.path.abspath(__file__))
    food_filter_dir  = os.path.abspath(os.path.join(script_dir, os.pardir))

    # 2) 키워드 사전 파일 경로
    keyword_dict_path = os.path.join(
        food_filter_dir, "komoran", "resultDic", "keyword_dictionary.csv"
    )

    # 3) 인스타그램 매칭 전처리 파일 경로
    insta_pattern = os.path.join(
        food_filter_dir, "instar_post_filter", "keyword", "matching", "*.csv"
    )

    # 4) 유튜브 매칭 전처리 파일 경로
    youtube_pattern = os.path.join(
        food_filter_dir, "youtube_video_filter", "keyword", "matching", "*.csv"
    )

    # 5) 결과 저장 디렉토리
    output_dir = os.path.join(food_filter_dir, "keywordDailyCount")
    os.makedirs(output_dir, exist_ok=True)

    # 6) 키워드 사전 로드
    kw_df = pd.read_csv(keyword_dict_path, dtype={"keywordid": int, "keywordname": str})
    # 컬럼명을 데이터베이스 스키마에 맞게 변경
    kw_df = kw_df.rename(columns={
        "keywordid": "KEYWORD_ID",
        "keywordname": "KEYWORD_NAME",
        "type": "TYPE",
        "priority": "PRIORITY"
    })

    # 7) 데이터 집계
    insta_counts = aggregate_counts(insta_pattern,  "POST_DATE")
    yt_counts    = aggregate_counts(youtube_pattern, "PUBLISHED_AT")

    # 8) 합치고 저장
    all_counts = pd.concat([insta_counts, yt_counts], ignore_index=True)
    all_counts = (
        all_counts
        .groupby(["KEYWORD_ID", "STATS_DATE"], as_index=False)
        .agg({"DAILY_COUNT": "sum"})  # DAILY_COUNT 컬럼 합계
        .reset_index()
    )

    # 키워드 사전과 병합
    result = (
        all_counts
        .merge(kw_df, on="KEYWORD_ID", how="left")
        .sort_values(["STATS_DATE", "KEYWORD_ID"])
        .reset_index(drop=True)
    )

    # STATS_ID 추가
    result.insert(0, "STATS_ID", result.index + 1)

    # 데이터베이스 스키마에 맞는 컬럼 순서로 정렬 (KEYWORDUP 제거)
    final_columns = ["STATS_ID", "KEYWORD_ID", "STATS_DATE", "KEYWORD_NAME", "DAILY_COUNT", "TYPE", "PRIORITY"]
    result = result[final_columns]

    # 9) 최종 CSV 저장
    output_path = os.path.join(output_dir, "keyword_daily_count.csv")
    result.to_csv(output_path, index=False, date_format="%Y-%m-%d")
    print(f"[완료] {len(result)}건 저장 → {output_path}")


def aggregate_counts(pattern: str, date_col: str) -> pd.DataFrame:
    dfs = []
    for fp in glob.glob(pattern):
        df = pd.read_csv(fp, parse_dates=[date_col])

        # --- 결측치 체크 추가 ---
        na_count = df["KEYWORD_ID"].isna().sum()
        if na_count > 0:
            print(f"[경고] 파일 `{os.path.basename(fp)}` 에 KEYWORD_ID 결측치 {na_count}건 발견")

        # 결측치는 제거하고 정수로 변환
        df = df.dropna(subset=["KEYWORD_ID"])
        df["KEYWORD_ID"] = df["KEYWORD_ID"].astype(int)

        # 날짜만 추출
        df[date_col] = df[date_col].dt.date
        dfs.append(df[["KEYWORD_ID", date_col]])

    if not dfs:
        return pd.DataFrame(columns=["KEYWORD_ID", "STATS_DATE", "DAILY_COUNT"])

    all_df = pd.concat(dfs, ignore_index=True)
    return (
        all_df
        .groupby(["KEYWORD_ID", date_col], as_index=False)
        .size()
        .rename(columns={date_col: "STATS_DATE", "size": "DAILY_COUNT"})
    )


if __name__ == "__main__":
    main()
