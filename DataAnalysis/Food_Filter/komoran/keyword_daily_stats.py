import os
import pandas as pd
import re
from pathlib import Path
from datetime import datetime
from collections import defaultdict

def load_komoran_keywords(userdic_path):
    """
    komoran_userdic.txt 파일에서 키워드를 로드합니다.
    
    Args:
        userdic_path (str): komoran_userdic.txt 파일 경로
    
    Returns:
        dict: {키워드: 키워드_ID} 매핑
    """
    keywords = {}
    keyword_id = 1
    
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
                        keywords[keyword] = keyword_id
                        keyword_id += 1
        
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
        keywords (dict): 키워드 딕셔너리 {키워드: ID}
    
    Returns:
        list: 발견된 키워드 리스트 [(키워드, ID), ...]
    """
    if not text or pd.isna(text):
        return []
    
    text = str(text).strip()
    found_keywords = []
    
    # 각 키워드가 텍스트에 포함되어 있는지 확인
    for keyword, keyword_id in keywords.items():
        if keyword in text:
            found_keywords.append((keyword, keyword_id))
    
    return found_keywords

def parse_date(date_str):
    """
    날짜 문자열을 파싱하여 YYYY-MM-DD 형식으로 변환합니다.
    """
    if pd.isna(date_str) or not date_str:
        return None
    
    try:
        # 다양한 날짜 형식 처리
        date_str = str(date_str).strip()
        
        # YYYY-MM-DD 형식
        if re.match(r'^\d{4}-\d{2}-\d{2}', date_str):
            return date_str[:10]
        
        # 다른 형식들도 필요시 추가
        return date_str[:10]  # 기본적으로 앞 10자리만 사용
        
    except Exception as e:
        print(f"❌ 날짜 파싱 오류: {date_str} - {e}")
        return None

def process_instagram_csv(csv_path, keywords):
    """
    인스타그램 CSV 파일을 처리하여 키워드별 일별 언급량을 계산합니다.
    
    Args:
        csv_path (str): 입력 CSV 파일 경로
        keywords (dict): 키워드 딕셔너리 {키워드: ID}
    
    Returns:
        dict: {(keyword_id, keyword_name, date): count}
    """
    daily_counts = defaultdict(int)
    
    try:
        # CSV 파일 읽기
        df = pd.read_csv(csv_path, encoding='utf-8')
        print(f"📖 인스타그램 파일 로드: {csv_path} ({len(df)}행)")
        
        # 각 행을 처리
        for idx, row in df.iterrows():
            # 날짜 정보 추출 (POST_DATE 또는 작성일)
            post_date = None
            if 'POST_DATE' in df.columns:
                post_date = parse_date(row.get('POST_DATE'))
            elif '작성일' in df.columns:
                post_date = parse_date(row.get('작성일'))
            
            if not post_date:
                continue
            
            # 본문(POST_TEXT)에서 키워드 찾기
            post_text = row.get('본문', '') if '본문' in df.columns else ''
            if 'POST_TEXT' in df.columns:
                post_text = row.get('POST_TEXT', '')
            
            hashtags = row.get('해시태그', '') if '해시태그' in df.columns else ''
            if 'HASHTAGS' in df.columns:
                hashtags = row.get('HASHTAGS', '')
            
            # 본문과 해시태그를 합쳐서 키워드 검색
            combined_text = f"{post_text} {hashtags}"
            found_keywords = find_keywords_in_text(combined_text, keywords)
            
            # 발견된 각 키워드에 대해 일별 카운트 증가
            for keyword_name, keyword_id in found_keywords:
                key = (keyword_id, keyword_name, post_date)
                daily_counts[key] += 1
        
        print(f"✅ 인스타그램 키워드 처리 완료: {len(daily_counts)}개 키워드-날짜 조합")
        return daily_counts
        
    except Exception as e:
        print(f"❌ 인스타그램 파일 처리 중 오류: {e}")
        return defaultdict(int)

def process_youtube_csv(csv_path, keywords):
    """
    유튜브 CSV 파일을 처리하여 키워드별 일별 언급량을 계산합니다.
    
    Args:
        csv_path (str): 입력 CSV 파일 경로
        keywords (dict): 키워드 딕셔너리 {키워드: ID}
    
    Returns:
        dict: {(keyword_id, keyword_name, date): count}
    """
    daily_counts = defaultdict(int)
    
    try:
        # CSV 파일 읽기
        df = pd.read_csv(csv_path, encoding='utf-8')
        print(f"📖 유튜브 파일 로드: {csv_path} ({len(df)}행)")
        
        # 각 행을 처리
        for idx, row in df.iterrows():
            # 날짜 정보 추출 (PUBLISHED_AT)
            published_date = parse_date(row.get('PUBLISHED_AT'))
            
            if not published_date:
                continue
            
            # TITLE에서 키워드 찾기
            title = row.get('TITLE', '') if 'TITLE' in df.columns else ''
            found_keywords = find_keywords_in_text(title, keywords)
            
            # 발견된 각 키워드에 대해 일별 카운트 증가
            for keyword_name, keyword_id in found_keywords:
                key = (keyword_id, keyword_name, published_date)
                daily_counts[key] += 1
        
        print(f"✅ 유튜브 키워드 처리 완료: {len(daily_counts)}개 키워드-날짜 조합")
        return daily_counts
        
    except Exception as e:
        print(f"❌ 유튜브 파일 처리 중 오류: {e}")
        return defaultdict(int)

def main():
    """
    메인 함수: 인스타그램과 유튜브 CSV 파일들을 처리하여 키워드별 일별 통계를 생성합니다.
    """
    # 기본 경로 설정 (현재 파일이 DataAnalysis/Food_Filter/komoran/ 에 있음)
    base_dir = Path(__file__).parent  # DataAnalysis/Food_Filter/komoran/
    dataanalysis_dir = base_dir.parent.parent  # DataAnalysis/

    # komoran_userdic.txt 파일 경로
    userdic_path = base_dir / "resultDic" / "komoran_userdic.txt"

    # 입력 디렉토리 경로
    instar_input_dir = dataanalysis_dir / "DB" / "instar_post_filter"
    youtube_input_dir = dataanalysis_dir / "DB" / "youtube_video_filter"

    # 출력 디렉토리 경로
    output_dir = dataanalysis_dir / "Food_Filter" / "keywordDaily"
    
    print("🚀 키워드 일별 통계 생성 프로세스 시작")
    print(f"📍 사용자 사전 경로: {userdic_path}")
    
    # 키워드 로드
    keywords = load_komoran_keywords(str(userdic_path))
    if not keywords:
        print("❌ 키워드를 로드할 수 없어 프로세스를 종료합니다.")
        return
    
    # 전체 일별 카운트를 저장할 딕셔너리
    all_daily_counts = defaultdict(int)
    
    # 인스타그램 파일들 처리
    print("\n📱 인스타그램 파일 처리 시작")
    instar_files = list(instar_input_dir.glob("*_filtered_food_posts.csv"))
    
    if not instar_files:
        print("❌ 인스타그램 필터링된 파일을 찾을 수 없습니다.")
    else:
        for csv_file in instar_files:
            print(f"\n처리 중: {csv_file.name}")
            daily_counts = process_instagram_csv(str(csv_file), keywords)
            
            # 전체 카운트에 합산
            for key, count in daily_counts.items():
                all_daily_counts[key] += count
    
    # 유튜브 파일들 처리
    print("\n🎥 유튜브 파일 처리 시작")
    youtube_files = list(youtube_input_dir.glob("*_Filter_viedos.csv"))
    
    if not youtube_files:
        print("❌ 유튜브 필터링된 파일을 찾을 수 없습니다.")
    else:
        for csv_file in youtube_files:
            print(f"\n처리 중: {csv_file.name}")
            daily_counts = process_youtube_csv(str(csv_file), keywords)
            
            # 전체 카운트에 합산
            for key, count in daily_counts.items():
                all_daily_counts[key] += count
    
    # 결과를 DataFrame으로 변환
    print("\n📊 최종 통계 생성 중...")
    results = []
    stats_id = 1
    
    for (keyword_id, keyword_name, stats_date), daily_count in all_daily_counts.items():
        results.append({
            'STATS_ID': stats_id,
            'KEYWORD_ID': keyword_id,
            'KEYWORD_NAME': keyword_name,
            'DAILY_COUNT': daily_count,
            'STATS_DATE': stats_date
        })
        stats_id += 1
    
    # DataFrame 생성 및 정렬
    result_df = pd.DataFrame(results)
    result_df = result_df.sort_values(['STATS_DATE', 'KEYWORD_NAME'])
    
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # CSV 파일로 저장
    output_path = output_dir / "keyword_daily_stats.csv"
    result_df.to_csv(output_path, index=False, encoding='utf-8')
    
    print(f"✅ 키워드 일별 통계 생성 완료: {output_path}")
    print(f"📊 총 {len(result_df)}개 통계 레코드 생성")
    print(f"📅 날짜 범위: {result_df['STATS_DATE'].min()} ~ {result_df['STATS_DATE'].max()}")
    print(f"🔤 키워드 수: {result_df['KEYWORD_NAME'].nunique()}개")
    
    print("\n🎉 모든 키워드 일별 통계 작업이 완료되었습니다!")

if __name__ == "__main__":
    main()
