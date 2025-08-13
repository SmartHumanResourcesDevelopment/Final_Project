# KOTE 모델을 활용한 잘파세대 식문화 트렌드 분석 서비스 (EatPick)

> 인스타그램·유튜브 데이터를 수집·정제·분석해 **잘파세대**(Gen Z/Alpha) 식문화 트렌드를 탐지하고, 감성 분석과 키워드 유사도 기반 인사이트를 제공하는 풀스택 프로젝트입니다.
>
> **프로젝트 진행 기간**: 2025.07.14 \~ 2025.08.13
 
**노션 문서**: [📄 프로젝트 노션 링크]([https://www.notion.so/](https://slime-roast-ee5.notion.site/20fa64f7def180d88c26fb1ffd3bb9b5?source=copy_link))



## 목차

* [프로젝트 개요](#프로젝트-개요)
* [주요 기능](#주요-기능)
* [아키텍처](#아키텍처)
* [기술 스택](#기술-스택)
* [데이터 파이프라인](#데이터-파이프라인)
* [데이터 스키마(Schema) & 인덱싱](#데이터-스키마schema--인덱싱)
* [설치 & 실행](#설치--실행)
* [API 개요](#api-개요)
* [UI 주요 화면](#ui-주요-화면)
* [성능 최적화](#성능-최적화)
* [트러블슈팅 기록](#트러블슈팅-기록)
* [윤리·법적 고려](#윤리법적-고려)
* [로드맵](#로드맵)
* [라이선스](#라이선스)

---

## 프로젝트 개요

* **목표**: SNS 원천 데이터(Instagram/YouTube)에서 **키워드 트렌드**와 **감성 흐름**을 분석하여, 마케터/기획자에게 **키워드 랭킹, 유사 키워드, 감성 분포, 마케팅 아이디어**를 제공.
* **핵심 포인트**

  * 대규모 크롤링 안전 전략(로그인 세션 유지, 지연·프록시, 요청량 가이드)
  * KOTE 감정 분류(44 레이블) 기반 정밀 감성 분석
  * 키워드 임베딩/유사도 + RapidFuzz로 문맥 유사 탐지
  * Oracle 기반 집계·인덱싱 최적화로 응답 속도 개선

## 주요 기능

* **키워드 트렌드 대시보드**: 기간별 랭킹, 일별 언급량, 급상승 키워드
* **감성 분석**: 긍/부정 및 세부 감정 Top-N, 감정별 댓글 샘플
* **유사 키워드 탐색**: 임베딩·문자열 유사도 기반 연관 키워드 제안
* **마케팅 인사이트 요약**: 키워드별 요약/활용 아이디어 자동 생성
* **데이터 관리**: 크롤링 → 필터링 → 전처리 → DB 적재 파이프라인

## 아키텍처

```
[Instagram/YouTube]  ─┐
                      ├─(Python Crawlers)─▶ [CSV/Parquet] ─▶ [ETL/전처리] ─▶ [Oracle 11g]
[External Metadata]   ┘                                     │
                                                          [Stored Procs/Indexes]
                                                                 │
                                                        [Spring Boot + MyBatis]
                                                                 │
                                                           [React + Tailwind]
                                                                 │
                                                        [대시보드/REST API]
```

## 기술 스택

| 구분                | 기술                      | 버전/모델      | 뱃지                                                                                                       |
| ----------------- | ----------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| **Frontend**      | React                   | 18         | <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=React&logoColor=white"/>             |
|                   | Tailwind CSS            | 4.x        | <img src="https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=TailwindCSS&logoColor=white"/> |
|                   | CSS                     | -          | <img src="https://img.shields.io/badge/CSS-1572B6?style=flat&logo=CSS3&logoColor=white"/>                |
| **Backend**       | Spring Boot             | 3.x        | <img src="https://img.shields.io/badge/SpringBoot-6DB33F?style=flat&logo=SpringBoot&logoColor=white"/>   |
|                   | MyBatis                 | 3.x        | <img src="https://img.shields.io/badge/MyBatis-BF1F24?style=flat&logo=Java&logoColor=white"/>            |
|                   | Oracle DB               | 11g        | <img src="https://img.shields.io/badge/Oracle-F80000?style=flat&logo=Oracle&logoColor=white"/>           |
| **Data Analysis** | Python                  | 3.11       | <img src="https://img.shields.io/badge/Python-3776AB?style=flat&logo=Python&logoColor=white"/>           |
|                   | Hugging Face KOTE Model | 44 labels  | <img src="https://img.shields.io/badge/HuggingFace-FF6F00?style=flat&logo=HuggingFace&logoColor=white"/> |
|                   | Selenium                | Automation | <img src="https://img.shields.io/badge/Selenium-43B02A?style=flat&logo=Selenium&logoColor=white"/>       |
|                   | OpenAI Embeddings       | -          | <img src="https://img.shields.io/badge/OpenAI-412991?style=flat&logo=OpenAI&logoColor=white"/>           |


## 데이터 파이프라인

1. **수집**: Instagram/YouTube 포스트·댓글 데이터 크롤링
2. **필터링/정제**: 이모지·중복 제거, 불용어 적용
3. **감성 분석**: KOTE 44 레이블 기반 댓글·본문 분석
4. **유사도 계산**: OpenAI 임베딩+RapidFuzz 혼합 방식
5. **적재/집계**: Oracle에 저장 후 인덱스·프로시저 기반 조회 최적화

## 데이터 스키마(Schema) & 인덱싱

* `YOUTUBE_VIDEO`, `YOUTUBE_COMMENT`, `INSTAGRAM_POST`, `INSTAGRAM_COMMENT`, `SENTIMENT_RESULT`, `KEYWORD_DAILY_STATS`, `KEYWORD_MAIN_STATS`, `KEYWORD_SIMILARITY`
* 주요 인덱스: 기간·키워드 복합, 조인 최적화, 감정·출처 필터 인덱스

## 설치 & 실행

* **사전 준비**: Node.js 18+, Java 17, Python 3.11, Oracle 11g
* **환경 변수**: DB 접속, API 키, 클라이언트 URL 등 .env 관리
* **백엔드**: `./mvnw spring-boot:run`
* **프론트엔드**: `npm run dev`
* **데이터 분석**: `pip install -r requirements.txt` 후 크롤러·전처리 스크립트 실행

## API 개요

* 키워드 랭킹, 트렌드, 감성 분석, 유사 키워드, 샘플 댓글 조회

## UI 주요 화면

* 메인: 인기·급상승 키워드
* 키워드 상세: 트렌드 그래프, 감성 TOP3, 유사 키워드, 댓글
* 인사이트: 마케팅 요약/아이디어, 네트워크 시각화

## 성능 최적화

* 인덱스 온리 쿼리, 통계 최신화, 조인 최적화, MERGE 프로시저 활용

## 트러블슈팅 기록

* ORA-06502, ORA-00907, 포맷 변환 오류, Git 브랜치 충돌 해결 내역 포함

## 윤리·법적 고려

* 약관 준수, 과도한 요청 방지, 개인정보 비수집, 익명화 처리

## 로드맵

* 키워드 네트워크 그래프, 멀티모달 분석, 모델 정밀도 향상, 사용자 정의 대시보드, CI/CD

## 라이선스

* 팀 내부 라이선스 적용, 외부 배포 전 협의 필요
