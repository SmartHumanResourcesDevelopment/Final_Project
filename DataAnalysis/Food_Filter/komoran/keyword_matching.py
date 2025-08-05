import os
import pandas as pd
import re
from pathlib import Path

def load_komoran_keywords(userdic_path):
    """
    komoran_userdic.txt 파일에서 키워드를 로드합니다.
    
    Args:
        userdic_path (str): komoran_userdic.txt 파일 경로
    
    Returns:
        set: 키워드 집합
    """
    keywords = set()
    
    if not os.path.exists(userdic_path):
        print(f"❌ 사용자 사전 파일을 찾을 수 없습니다: {userdic_path}")
        return keywords
    
    try:
        with open(userdic_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and '\t' in line:
                    # komoran_userdic.txt 형식: 키워드\t품사\t빈도
                    keyword = line.split('\t')[0]
                    if keyword and len(keyword) >= 2:
                        keywords.add(keyword)
        
        print(f"✅ 키워드 로드 완료: {len(keywords)}개")
        return keywords
        
    except Exception as e:
        print(f"❌ 키워드 로드 중 오류 발생: {e}")
        return keywords

def find_keywords_in_text(text, keywords):
    """
    텍스트에서 키워드를 찾습니다.
    
    Args:
        text (str): 검색할 텍스트
        keywords (set): 키워드 집합
    
    Returns:
        list: 발견된 키워드 리스트
    """
    if not text or pd.isna(text):
        return []
    
    text = str(text).strip()
    found_keywords = []
    
    # 각 키워드가 텍스트에 포함되어 있는지 확인
    for keyword in keywords:
        if keyword in text:
            found_keywords.append(keyword)
    
    return found_keywords

def process_instagram_csv(csv_path, keywords, output_dir):
    """
    인스타그램 CSV 파일을 처리하여 키워드를 추출합니다.
    
    Args:
        csv_path (str): 입력 CSV 파일 경로
        keywords (set): 키워드 집합
        output_dir (str): 출력 디렉토리 경로
    
    Returns:
        str: 생성된 출력 파일 경로
    """
    try:
        # CSV 파일 읽기
        df = pd.read_csv(csv_path, encoding='utf-8')
        print(f"📖 인스타그램 파일 로드: {csv_path} ({len(df)}행)")
        
        # 결과를 저장할 리스트
        results = []
        
        # 각 행을 처리
        for idx, row in df.iterrows():
            post_id = f"post_{idx + 1}"  # post_id 생성
            
            # 본문(POST_TEXT)에서 키워드 찾기
            post_text = row.get('본문', '') if '본문' in df.columns else ''
            hashtags = row.get('해시태그', '') if '해시태그' in df.columns else ''
            
            # 본문과 해시태그를 합쳐서 키워드 검색
            combined_text = f"{post_text} {hashtags}"
            found_keywords = find_keywords_in_text(combined_text, keywords)
            
            # 발견된 각 키워드에 대해 결과 추가
            for keyword in found_keywords:
                results.append({
                    'post_id': post_id,
                    'keywordname': keyword
                })
        
        # 결과 DataFrame 생성
        result_df = pd.DataFrame(results)
        
        # 출력 파일명 생성
        input_filename = Path(csv_path).stem
        output_filename = f"{input_filename}_komoran_keyword.csv"
        output_path = os.path.join(output_dir, output_filename)
        
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        # CSV 파일로 저장
        result_df.to_csv(output_path, index=False, encoding='utf-8')
        
        print(f"✅ 인스타그램 키워드 추출 완료: {output_path} ({len(result_df)}개 키워드 언급)")
        return output_path
        
    except Exception as e:
        print(f"❌ 인스타그램 파일 처리 중 오류: {e}")
        return None

def process_youtube_csv(csv_path, keywords, output_dir):
    """
    유튜브 CSV 파일을 처리하여 키워드를 추출합니다.
    
    Args:
        csv_path (str): 입력 CSV 파일 경로
        keywords (set): 키워드 집합
        output_dir (str): 출력 디렉토리 경로
    
    Returns:
        str: 생성된 출력 파일 경로
    """
    try:
        # CSV 파일 읽기
        df = pd.read_csv(csv_path, encoding='utf-8')
        print(f"📖 유튜브 파일 로드: {csv_path} ({len(df)}행)")
        
        # 결과를 저장할 리스트
        results = []
        
        # 각 행을 처리
        for idx, row in df.iterrows():
            post_id = row.get('VIDEO_ID', f"video_{idx + 1}")  # VIDEO_ID 사용 또는 생성
            
            # TITLE에서 키워드 찾기
            title = row.get('TITLE', '') if 'TITLE' in df.columns else ''
            found_keywords = find_keywords_in_text(title, keywords)
            
            # 발견된 각 키워드에 대해 결과 추가
            for keyword in found_keywords:
                results.append({
                    'post_id': post_id,
                    'keywordname': keyword
                })
        
        # 결과 DataFrame 생성
        result_df = pd.DataFrame(results)
        
        # 출력 파일명 생성
        input_filename = Path(csv_path).stem
        output_filename = f"{input_filename}_komoran_keyword.csv"
        output_path = os.path.join(output_dir, output_filename)
        
        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)
        
        # CSV 파일로 저장
        result_df.to_csv(output_path, index=False, encoding='utf-8')
        
        print(f"✅ 유튜브 키워드 추출 완료: {output_path} ({len(result_df)}개 키워드 언급)")
        return output_path
        
    except Exception as e:
        print(f"❌ 유튜브 파일 처리 중 오류: {e}")
        return None

def main():
    """
    메인 함수: 인스타그램과 유튜브 CSV 파일들을 처리합니다.
    """
    # 기본 경로 설정 (현재 파일이 DataAnalysis/Food_Filter/komoran/ 에 있음)
    base_dir = Path(__file__).parent  # DataAnalysis/Food_Filter/komoran/
    dataanalysis_dir = base_dir.parent.parent  # DataAnalysis/

    # komoran_userdic.txt 파일 경로
    userdic_path = base_dir / "resultDic" / "komoran_userdic.txt"

    # 입력 디렉토리 경로
    instar_input_dir = dataanalysis_dir / "DB" / "instar_post_filter"
    youtube_input_dir = dataanalysis_dir / "DB" / "youtube_video_filter"

    # 출력 디렉토리 경로 (Food_Filter 폴더 아래)
    instar_output_dir = dataanalysis_dir / "Food_Filter" / "instar_post_filter" / "keyword_instar" / "komoran"
    youtube_output_dir = dataanalysis_dir / "Food_Filter" / "youtube_video_filter" / "keyword" / "komoran"
    
    print("🚀 키워드 추출 프로세스 시작")
    print(f"📍 사용자 사전 경로: {userdic_path}")
    
    # 키워드 로드
    keywords = load_komoran_keywords(str(userdic_path))
    if not keywords:
        print("❌ 키워드를 로드할 수 없어 프로세스를 종료합니다.")
        return
    
    # 인스타그램 파일들 처리
    print("\n📱 인스타그램 파일 처리 시작")
    instar_files = list(instar_input_dir.glob("*_filtered_food_posts.csv"))
    
    if not instar_files:
        print("❌ 인스타그램 필터링된 파일을 찾을 수 없습니다.")
    else:
        for csv_file in instar_files:
            print(f"\n처리 중: {csv_file.name}")
            process_instagram_csv(str(csv_file), keywords, str(instar_output_dir))
    
    # 유튜브 파일들 처리
    print("\n🎥 유튜브 파일 처리 시작")
    youtube_files = list(youtube_input_dir.glob("*_Filter_viedos.csv"))
    
    if not youtube_files:
        print("❌ 유튜브 필터링된 파일을 찾을 수 없습니다.")
    else:
        for csv_file in youtube_files:
            print(f"\n처리 중: {csv_file.name}")
            process_youtube_csv(str(csv_file), keywords, str(youtube_output_dir))
    
    print("\n🎉 모든 키워드 추출 작업이 완료되었습니다!")

if __name__ == "__main__":
    main()
