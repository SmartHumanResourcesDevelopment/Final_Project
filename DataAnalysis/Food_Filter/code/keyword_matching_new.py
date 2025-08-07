'''
인스타그램과 유튜브 파일에 키워드 ID를 매칭하는 코드
- 인스타그램: POST_TEXT, HASHTAGS에서 키워드 매칭
- 유튜브: TITLE, DESCRIPTION에서 키워드 매칭
'''

import os
import glob
import pandas as pd
from rapidfuzz import process, fuzz

def map_keyword_id(text1, text2, kw_names, kw_id_map, threshold=80):
    """
    텍스트에서 가장 매칭되는 키워드의 ID를 반환
    """
    combined_text = f"{text1} {text2}".strip()
    if not combined_text or combined_text == "nan nan":
        return None
    
    # 키워드 매칭 (유사도 기반)
    matches = process.extract(
        combined_text, 
        kw_names, 
        scorer=fuzz.partial_ratio, 
        limit=1
    )
    
    if matches and matches[0][1] >= threshold:
        keyword = matches[0][0]
        return kw_id_map.get(keyword)
    
    return None

def main():
    # 경로 설정
    script_dir = os.path.dirname(os.path.abspath(__file__))
    food_filter_dir = os.path.abspath(os.path.join(script_dir, os.pardir))

    # 키워드 사전 파일 경로
    keyword_dict_path = os.path.join(food_filter_dir, "komoran", "resultDic", "keyword_dictionary.csv")

    # 인스타그램 파일 경로 (posts 폴더)
    insta_dir = os.path.join(food_filter_dir, "instar_post_filter", "posts")
    insta_files = glob.glob(os.path.join(insta_dir, "*_posts.csv"))

    # 유튜브 파일 경로
    youtube_dir = os.path.join(food_filter_dir, "youtube_video_filter")
    youtube_files = glob.glob(os.path.join(youtube_dir, "*.csv"))

    # 출력 디렉토리 설정
    insta_output_dir = os.path.join(food_filter_dir, "instar_post_filter", "keyword", "matching")
    youtube_output_dir = os.path.join(food_filter_dir, "youtube_video_filter", "keyword", "matching")

    # 출력 디렉토리 생성
    os.makedirs(insta_output_dir, exist_ok=True)
    os.makedirs(youtube_output_dir, exist_ok=True)

    # 1) 키워드 사전 로드
    if not os.path.exists(keyword_dict_path):
        raise FileNotFoundError(f'키워드 사전이 없습니다: {keyword_dict_path}')
    
    kw_df = pd.read_csv(keyword_dict_path, usecols=['keywordid','keywordname'], encoding='utf-8-sig')
    kw_id_map = dict(zip(kw_df['keywordname'], kw_df['keywordid']))
    kw_names = list(kw_id_map.keys())
    
    print(f"📚 키워드 사전 로드 완료: {len(kw_names)}개 키워드")
    print(f"📂 인스타그램 파일: {len(insta_files)}개")
    print(f"📂 유튜브 파일: {len(youtube_files)}개")
    print("=" * 60)

    # 2) Instagram posts 처리
    print("📱 인스타그램 파일 처리 중...")
    for insta_file in insta_files:
        try:
            df = pd.read_csv(insta_file, encoding='utf-8-sig')
            
            # 파일명에서 prefix 추출
            base_filename = os.path.splitext(os.path.basename(insta_file))[0]
            prefix = base_filename.replace('_posts', '')
            
            # KEYWORD_ID 컬럼 추가 (POST_TEXT와 HASHTAGS에서 키워드 매칭)
            df['KEYWORD_ID'] = df.apply(
                lambda r: map_keyword_id(
                    str(r.get('POST_TEXT', '')), 
                    str(r.get('HASHTAGS', '')), 
                    kw_names, kw_id_map
                ),
                axis=1
            )
            
            # 출력 파일명: 원본파일명_keywordid.csv
            output_filename = f"{prefix}_keywordid.csv"
            output_path = os.path.join(insta_output_dir, output_filename)
            
            # 저장
            df.to_csv(output_path, index=False, encoding='utf-8-sig')
            
            print(f"✅ Instagram: {base_filename} → {output_filename} ({len(df)}개 행)")
            
        except Exception as e:
            print(f"❌ Instagram 파일 처리 오류 ({os.path.basename(insta_file)}): {e}")

    # 3) YouTube videos 처리
    print("\n📺 유튜브 파일 처리 중...")
    for youtube_file in youtube_files:
        try:
            df = pd.read_csv(youtube_file, encoding='utf-8-sig')
            
            # 파일명에서 prefix 추출
            base_filename = os.path.splitext(os.path.basename(youtube_file))[0]
            
            # KEYWORD_ID 컬럼 추가 (TITLE과 DESCRIPTION에서 키워드 매칭)
            df['KEYWORD_ID'] = df.apply(
                lambda r: map_keyword_id(
                    str(r.get('TITLE', '')), 
                    str(r.get('DESCRIPTION', '')), 
                    kw_names, kw_id_map
                ),
                axis=1
            )
            
            # 출력 파일명: 원본파일명_keywordid.csv
            output_filename = f"{base_filename}_keywordid.csv"
            output_path = os.path.join(youtube_output_dir, output_filename)
            
            # 저장
            df.to_csv(output_path, index=False, encoding='utf-8-sig')
            
            print(f"✅ YouTube: {base_filename} → {output_filename} ({len(df)}개 행)")
            
        except Exception as e:
            print(f"❌ YouTube 파일 처리 오류 ({os.path.basename(youtube_file)}): {e}")

    print("=" * 60)
    print("🎉 키워드 매칭 작업 완료!")

if __name__ == '__main__':
    main()
