#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import glob
import pandas as pd
from pathlib import Path

def check_missing_values_in_file(file_path):
    """
    단일 CSV 파일의 결측치를 검사합니다.
    
    Args:
        file_path (str): CSV 파일 경로
    
    Returns:
        dict: 결측치 정보
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
        
        return {
            'file_path': file_path,
            'total_rows': total_rows,
            'total_missing': total_missing,
            'missing_columns': missing_columns.to_dict(),
            'has_missing': total_missing > 0,
            'columns': list(df.columns)
        }
        
    except Exception as e:
        return {
            'file_path': file_path,
            'error': str(e),
            'has_missing': None
        }

def check_directory_files(directory_path, file_pattern="*.csv"):
    """
    디렉토리 내 모든 CSV 파일의 결측치를 검사합니다.
    
    Args:
        directory_path (str): 디렉토리 경로
        file_pattern (str): 파일 패턴
    
    Returns:
        list: 각 파일의 결측치 정보 리스트
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
    
    print(f"📁 검사 중: {directory_path}")
    print(f"   파일 수: {len(files)}개")
    
    for file_path in sorted(files):
        result = check_missing_values_in_file(file_path)
        results.append(result)
        
        # 파일별 결과 출력
        filename = os.path.basename(file_path)
        if 'error' in result:
            print(f"   ❌ {filename}: 오류 - {result['error']}")
        elif result['has_missing']:
            print(f"   ⚠️  {filename}: 결측치 {result['total_missing']}개 발견")
            for col, count in result['missing_columns'].items():
                print(f"      - {col}: {count}개")
        else:
            print(f"   ✅ {filename}: 결측치 없음 ({result['total_rows']}행)")
    
    return results

def generate_summary_report(all_results):
    """
    전체 결측치 검사 결과 요약 보고서를 생성합니다.
    
    Args:
        all_results (dict): 모든 디렉토리의 검사 결과
    """
    print("\n" + "="*80)
    print("📊 결측치 검사 요약 보고서")
    print("="*80)
    
    total_files = 0
    files_with_missing = 0
    total_missing_values = 0
    
    for directory, results in all_results.items():
        print(f"\n📂 {directory}")
        print("-" * 60)
        
        if not results:
            print("   파일 없음 또는 오류")
            continue
        
        dir_files = len(results)
        dir_missing_files = sum(1 for r in results if r.get('has_missing', False))
        dir_total_missing = sum(r.get('total_missing', 0) for r in results)
        
        total_files += dir_files
        files_with_missing += dir_missing_files
        total_missing_values += dir_total_missing
        
        print(f"   총 파일 수: {dir_files}개")
        print(f"   결측치 있는 파일: {dir_missing_files}개")
        print(f"   총 결측치 수: {dir_total_missing}개")
        
        if dir_missing_files > 0:
            print("   ⚠️  결측치가 있는 파일들:")
            for result in results:
                if result.get('has_missing', False):
                    filename = os.path.basename(result['file_path'])
                    print(f"      - {filename}: {result['total_missing']}개")
    
    print("\n" + "="*80)
    print("🎯 전체 요약")
    print("="*80)
    print(f"총 검사 파일 수: {total_files}개")
    print(f"결측치 있는 파일 수: {files_with_missing}개")
    print(f"전체 결측치 수: {total_missing_values}개")
    
    if total_missing_values == 0:
        print("🎉 모든 파일이 결측치 없이 깨끗합니다!")
    else:
        print("⚠️  데이터베이스 삽입 전에 결측치 처리가 필요합니다.")

def main():
    """
    메인 함수: 지정된 경로들의 CSV 파일들을 검사합니다.
    """
    print("🔍 데이터베이스 삽입 전 결측치 검증 시작")
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
    
    # 각 디렉토리별 결과 저장
    all_results = {}
    
    # 각 경로별로 검사 실행
    for description, path in check_paths.items():
        print(f"\n🔍 {description} 검사 중...")
        
        if description == "키워드 사전":
            # keyword_dictionary.csv 파일만 검사
            dict_file = path / "keyword_dictionary.csv"
            if dict_file.exists():
                results = [check_missing_values_in_file(str(dict_file))]
                print(f"📁 검사 중: {path}")
                print(f"   파일 수: 1개")
                
                result = results[0]
                filename = dict_file.name
                if 'error' in result:
                    print(f"   ❌ {filename}: 오류 - {result['error']}")
                elif result['has_missing']:
                    print(f"   ⚠️  {filename}: 결측치 {result['total_missing']}개 발견")
                    for col, count in result['missing_columns'].items():
                        print(f"      - {col}: {count}개")
                else:
                    print(f"   ✅ {filename}: 결측치 없음 ({result['total_rows']}행)")
            else:
                print(f"❌ 파일을 찾을 수 없습니다: {dict_file}")
                results = []
        else:
            # 디렉토리 내 모든 CSV 파일 검사
            results = check_directory_files(str(path))
        
        all_results[description] = results
    
    # 요약 보고서 생성
    generate_summary_report(all_results)
    
    print(f"\n✅ 결측치 검증 완료!")

if __name__ == "__main__":
    main()
