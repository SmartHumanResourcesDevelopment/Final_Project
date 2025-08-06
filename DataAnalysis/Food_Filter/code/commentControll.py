#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob
import pandas as pd

def filter_comments(matched_dir, comment_dir, output_dir, id_column):
    """
    matched_dir: 매칭된 포스트/영상 파일 (*.csv)이 있는 디렉토리
    comment_dir: 원본 댓글 CSV 파일들이 있는 디렉토리
    output_dir:  필터링된 댓글을 저장할 디렉토리
    id_column:  댓글 CSV와 매칭 파일 모두에 존재하는 ID 컬럼명 ("POST_ID" 또는 "VIDEO_ID")
    """
    os.makedirs(output_dir, exist_ok=True)

    # 1) 매칭된 게시글/영상 ID 수집
    matched_ids = set()
    for mf in glob.glob(os.path.join(matched_dir, "*_keywordid.csv")):
        dfm = pd.read_csv(mf, dtype={id_column: str}, encoding='utf-8-sig')
        matched_ids.update(dfm[id_column].astype(str).tolist())
    print(f"→ '{matched_dir}' 에서 {len(matched_ids)}개의 '{id_column}' 수집")

    # 2) 댓글 파일별로 필터링
    for cf in glob.glob(os.path.join(comment_dir, "*.csv")):
        dfc = pd.read_csv(cf, dtype={id_column: str}, encoding='utf-8-sig')
        before = len(dfc)
        dfc_filtered = dfc[dfc[id_column].isin(matched_ids)]
        removed = before - len(dfc_filtered)
        print(f"[{os.path.basename(cf)}] 제거: {removed}/{before} 행")

        # 3) 저장
        out_path = os.path.join(output_dir, os.path.basename(cf))
        dfc_filtered.to_csv(out_path, index=False, encoding='utf-8-sig')
        print(f"    저장: {out_path}")

if __name__ == "__main__":
    # 0) 스크립트 기준 루트 디렉토리 설정
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, os.pardir))

    # Instagram 댓글 필터링
    filter_comments(
        matched_dir    = os.path.join(root_dir, "instar_post_filter",   "keyword", "matching"),
        comment_dir    = os.path.join(root_dir, "instar_post_filter",   "comment"),
        output_dir     = os.path.join(root_dir, "instar_post_filter",   "comment", "filtered"),
        id_column      = "POST_ID"
    )

    # YouTube 댓글 필터링
    filter_comments(
        matched_dir    = os.path.join(root_dir, "youtube_video_filter", "keyword", "matching"),
        comment_dir    = os.path.join(root_dir, "youtube_video_filter", "comment"),
        output_dir     = os.path.join(root_dir, "youtube_video_filter", "comment", "filtered"),
        id_column      = "VIDEO_ID"
    )

    print("\n🎉 댓글 필터링 완료!")
