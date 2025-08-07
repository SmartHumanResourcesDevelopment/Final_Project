'''
instar_post_filter/*.csv 파일에서 COMMENTS 컬럼을 제거하고
나머지 데이터를 instar_post_filter/posts/ 폴더에 *_posts.csv로 저장하는 코드
'''

import os
import glob
import pandas as pd

# ────────────────────────────────────────────────────
# 경로 설정
# ────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))           # .../Food_Filter/code
food_filter_dir = os.path.abspath(os.path.join(script_dir, os.pardir))  # .../Food_Filter

# 입력 디렉토리: instar_post_filter/*.csv
input_dir = os.path.join(food_filter_dir, "instar_post_filter")

# 출력 디렉토리: instar_post_filter/posts/
output_dir = os.path.join(input_dir, "posts")

# 출력 디렉토리 생성
os.makedirs(output_dir, exist_ok=True)

print(f"📂 입력 디렉토리: {input_dir}")
print(f"📂 출력 디렉토리: {output_dir}")
print("=" * 60)

# ────────────────────────────────────────────────────
# CSV 파일 처리 (COMMENTS 컬럼 제거)
# ────────────────────────────────────────────────────
# instar_post_filter/*.csv 파일들 찾기
csv_files = glob.glob(os.path.join(input_dir, "*.csv"))

if not csv_files:
    print("❌ CSV 파일을 찾을 수 없습니다.")
    exit()

print(f"🔍 발견된 CSV 파일: {len(csv_files)}개")

for csv_file in csv_files:
    try:
        # 파일 읽기
        df = pd.read_csv(csv_file, encoding='utf-8-sig')
        
        # 파일명 추출 (확장자 제거)
        base_filename = os.path.splitext(os.path.basename(csv_file))[0]
        
        # COMMENTS 컬럼 제거 (있는 경우에만)
        if 'COMMENTS' in df.columns:
            df_posts = df.drop('COMMENTS', axis=1).copy()
            print(f"📝 {base_filename}: COMMENTS 컬럼 제거됨")
        else:
            df_posts = df.copy()
            print(f"📝 {base_filename}: COMMENTS 컬럼이 없음")
        
        # 필요한 컬럼만 선택 (순서 맞춤)
        required_columns = ['POST_ID', 'KEYWORD_ID', 'POST_TEXT', 'HASHTAGS', 
                          'AUTHOR_ID', 'POST_DATE', 'LIKE_COUNT', 'PLATFORM']
        
        # 존재하는 컬럼만 선택
        available_columns = [col for col in required_columns if col in df_posts.columns]
        df_posts = df_posts[available_columns]
        
        # 출력 파일명 생성: 원본파일명_posts.csv
        output_filename = f"{base_filename}_posts.csv"
        output_path = os.path.join(output_dir, output_filename)
        
        # CSV 파일로 저장
        df_posts.to_csv(output_path, index=False, encoding='utf-8-sig')
        
        print(f"✅ {base_filename} → {output_filename} ({len(df_posts)}개 행, {len(available_columns)}개 컬럼)")
        print(f"   컬럼: {', '.join(available_columns)}")
        
    except Exception as e:
        print(f"❌ {os.path.basename(csv_file)} 처리 중 오류: {e}")

print("=" * 60)
print("🎉 포스트 데이터 분리 작업 완료!")
