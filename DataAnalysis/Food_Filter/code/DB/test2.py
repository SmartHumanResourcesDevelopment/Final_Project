#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob
import pandas as pd
from pathlib import Path

def check_missing_values_detailed(file_path):
    """
    단일 CSV 파일의 결측치를 상세히 검사하고 결측치가 있는 행을 보여줍니다.
    
    Args:
        file_path (str): CSV 파일 경로
    
    Returns:
        dict: 결측치 정보와 결측치가 있는 행들
    """
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
        
        # 전체 행 수
        total_rows = len(df)
        
        # 각 컬럼별 결측치 수
        missing_counts = df.isnull().sum()
        
        # 결측치가 있는 컬럼만 필터링
        missing_columns = missing_counts[missing_counts > 0]
        
        # 전체 결측치 수
        total_missing = missing_counts.sum()
        
        # 결측치가 있는 행들 찾기
        missing_rows_info = {}
        if total_missing > 0:
            for column in missing_columns.index:
                # 해당 컬럼에서 결측치가 있는 행들의 인덱스
                missing_row_indices = df[df[column].isnull()].index.tolist()
                
                # 결측치가 있는 행들의 데이터 (최대 10개만)
                missing_rows_data = df.loc[missing_row_indices[:10]].to_dict('records')
                
                missing_rows_info[column] = {
                    'count': len(missing_row_indices),
                    'indices': missing_row_indices[:10],  # 최대 10개 인덱스만
                    'sample_rows': missing_rows_data  # 최대 10개 행만
                }
        
        return {
            'file_path': file_path,
            'total_rows': total_rows,
            'total_missing': total_missing,
            'missing_columns': missing_columns.to_dict(),
            'missing_rows_info': missing_rows_info,
            'has_missing': total_missing > 0,
            'columns': list(df.columns)
        }
        
    except Exception as e:
        return {
            'file_path': file_path,
            'error': str(e),
            'has_missing': None
        }

def display_missing_rows(result):
    """
    결측치가 있는 행들을 보기 좋게 출력합니다.
    
    Args:
        result (dict): check_missing_values_detailed의 결과
    """
    filename = os.path.basename(result['file_path'])
    
    if 'error' in result:
        print(f"❌ {filename}: 오류 - {result['error']}")
        return
    
    if not result['has_missing']:
        print(f"✅ {filename}: 결측치 없음 ({result['total_rows']}행)")
        return
    
    print(f"⚠️  {filename}: 결측치 {result['total_missing']}개 발견 ({result['total_rows']}행)")
    
    for column, info in result['missing_rows_info'].items():
        print(f"\n   📍 컬럼 '{column}': {info['count']}개 결측치")
        print(f"      결측치 행 번호: {info['indices']}")
        
        if info['sample_rows']:
            print(f"      결측치가 있는 행 샘플 (최대 3개):")
            for i, row in enumerate(info['sample_rows'][:3]):
                print(f"         [{info['indices'][i]}행] ", end="")
                # 각 컬럼의 값을 간단히 표시 (너무 길면 자르기)
                row_display = []
                for col, val in row.items():
                    if pd.isna(val):
                        row_display.append(f"{col}=<결측치>")
                    else:
                        val_str = str(val)
                        if len(val_str) > 30:
                            val_str = val_str[:30] + "..."
                        row_display.append(f"{col}={val_str}")
                print(" | ".join(row_display))

def check_directory_files_detailed(directory_path, file_pattern="*.csv"):
    """
    디렉토리 내 모든 CSV 파일의 결측치를 상세히 검사합니다.
    
    Args:
        directory_path (str): 디렉토리 경로
        file_pattern (str): 파일 패턴
    
    Returns:
        list: 각 파일의 상세 결측치 정보 리스트
    """
    results = []
    
    if not os.path.exists(directory_path):
        print(f"❌ 디렉토리가 존재하지 않습니다: {directory_path}")
        return results
    
    # 파일 패턴에 맞는 모든 파일 찾기
    pattern = os.path.join(directory_path, file_pattern)
    files = glob.glob(pattern)
    
    if not files:
        print(f"⚠️  파일을 찾을 수 없습니다: {pattern}")
        return results
    
    print(f"📁 상세 검사 중: {directory_path}")
    print(f"   파일 수: {len(files)}개")
    print("="*80)
    
    for file_path in sorted(files):
        result = check_missing_values_detailed(file_path)
        results.append(result)
        
        # 파일별 상세 결과 출력
        display_missing_rows(result)
        print("-" * 80)
    
    return results

def main():
    """
    메인 함수: 결측치가 있는 파일들의 상세 정보를 보여줍니다.
    """
    print("🔍 결측치 상세 분석 시작")
    print("="*80)
    
    # 기본 경로 설정 (현재 파일이 DataAnalysis/Food_Filter/code/DB/ 에 있음)
    base_dir = Path(__file__).parent.parent.parent  # DataAnalysis/Food_Filter/
    
    # 검사할 디렉토리 경로들
    check_paths = {
        "인스타그램 키워드 매칭": base_dir / "instar_post_filter" / "keyword" / "matching",
        "인스타그램 댓글": base_dir / "instar_post_filter" / "comment" / "filtered",
        "유튜브 키워드 매칭": base_dir / "youtube_video_filter" / "keyword" / "matching", 
        "유튜브 댓글": base_dir / "youtube_video_filter" / "comment" / "filtered",
        "키워드 사전": base_dir / "komoran" / "resultDic"
    }
    
    # 각 경로별로 상세 검사 실행
    for description, path in check_paths.items():
        print(f"\n🔍 {description} 상세 검사")
        print("="*80)
        
        if description == "키워드 사전":
            # keyword_dictionary.csv 파일만 검사
            dict_file = path / "keyword_dictionary.csv"
            if dict_file.exists():
                result = check_missing_values_detailed(str(dict_file))
                display_missing_rows(result)
            else:
                print(f"❌ 파일을 찾을 수 없습니다: {dict_file}")
        else:
            # 디렉토리 내 모든 CSV 파일 상세 검사
            check_directory_files_detailed(str(path))
    
    print(f"\n✅ 결측치 상세 분석 완료!")

if __name__ == "__main__":
    main()
