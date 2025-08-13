# 잘파세대 식문화 트렌드 대시보드 (EatPick)

> 인스타그램·유튜브 데이터를 수집·정제·분석해 **잘파세대**(Gen Z/Alpha) 식문화 트렌드를 탐지하고, 감성 분석과 키워드 유사도 기반 인사이트를 제공하는 풀스택 프로젝트입니다.
>
> **기간**: 2025.07.14 \~ 2025.08.13
> **노션 문서**: [📄 프로젝트 노션 링크]([https://www.notion.so/](https://slime-roast-ee5.notion.site/20fa64f7def180d88c26fb1ffd3bb9b5?source=copy_link))

<p align="left">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/SpringBoot-3.x-6DB33F?logo=springboot" />
  <img src="https://img.shields.io/badge/Oracle-11g-F80000?logo=oracle" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python" />
  <img src="https://img.shields.io/badge/HuggingFace-KOTE%20Model-FF6F00?logo=huggingface" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/MyBatis-3.x-BF1F24?logo=java" />
  <img src="https://img.shields.io/badge/Selenium-Automation-43B02A?logo=selenium" />
  <img src="https://img.shields.io/badge/OpenAI-Embeddings-412991?logo=openai" />
</p>

---

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

<div align="center" style="display:flex;flex-wrap:wrap;gap:18px;justify-content:center;align-items:flex-start">

  <!-- Spring Boot (inline SVG, auto-colored via currentColor) -->

  <a href="https://spring.io/projects/spring-boot" title="Spring Boot" style="text-decoration:none;color:#6DB33F">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="40" height="40" aria-label="Spring Boot" fill="currentColor">
        <path d="m23.693 10.7058-4.73-8.1844c-.4094-.7106-1.4166-1.2942-2.2402-1.2942H7.2725c-.819 0-1.8308.5836-2.2402 1.2942L.307 10.7058c-.4095.7106-.4095 1.873 0 2.5837l4.7252 8.189c.4094.7107 1.4166 1.2943 2.2402 1.2943h9.455c.819 0 1.826-.5836 2.2402-1.2942l4.7252-8.189c.4095-.7107.4095-1.8732 0-2.5838zM10.9763 5.7547c0-.5365.4377-.9742.9742-.9742s.9742.4377.9742.9742v5.8217c0 .5366-.4377.9742-.9742.9742s-.9742-.4376-.9742-.9742zm.9742 12.4294c-3.6427 0-6.6077-2.965-6.6077-6.6077.0047-2.0896.993-4.0521 2.6685-5.304a.8657.8657 0 0 1 1.2142.1788.8657.8657 0 0 1-.1788 1.2143c-2.1602 1.6048-2.612 4.6592-1.0072 6.8194 1.6049 2.1603 4.6593 2.612 6.8195 1.0072 1.2378-.9177 1.9673-2.372 1.9673-3.9157a4.8972 4.8972 0 0 0-1.9861-3.925c-.386-.2824-.466-.8284-.1836-1.2143.2824-.386.8283-.466 1.2143-.1835 1.6895 1.2471 2.6826 3.2238 2.6873 5.3228 0 3.6474-2.965 6.6077-6.6077 6.6077z"/>
      </svg>
      <sub><b>Spring Boot 3.x</b></sub>
    </div>
  </a>

  <!-- React -->

  <a href="https://react.dev" title="React" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/react/61DAFB" width="40" height="40" alt="React"/>
      <sub><b>React 18</b></sub>
    </div>
  </a>

  <!-- Tailwind CSS -->

  <a href="https://tailwindcss.com" title="Tailwind CSS" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/tailwindcss/38B2AC" width="40" height="40" alt="Tailwind CSS"/>
      <sub><b>Tailwind 4.x</b></sub>
    </div>
  </a>

  <!-- Oracle -->

  <a href="https://www.oracle.com/database/" title="Oracle" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/oracle/F80000" width="40" height="40" alt="Oracle"/>
      <sub><b>Oracle 11g</b></sub>
    </div>
  </a>

  <!-- MyBatis -->

  <a href="https://mybatis.org" title="MyBatis" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/java/BF1F24" width="40" height="40" alt="MyBatis"/>
      <sub><b>MyBatis 3.x</b></sub>
    </div>
  </a>

  <!-- Python -->

  <a href="https://www.python.org" title="Python" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/python/3776AB" width="40" height="40" alt="Python"/>
      <sub><b>Python 3.11</b></sub>
    </div>
  </a>

  <!-- Selenium -->

  <a href="https://www.selenium.dev" title="Selenium" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/selenium/43B02A" width="40" height="40" alt="Selenium"/>
      <sub><b>Selenium</b></sub>
    </div>
  </a>

  <!-- Hugging Face -->

  <a href="https://huggingface.co" title="Hugging Face" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/huggingface/FF6F00" width="40" height="40" alt="Hugging Face"/>
      <sub><b>KOTE (44)</b></sub>
    </div>
  </a>

  <!-- OpenAI -->

  <a href="https://platform.openai.com" title="OpenAI" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/openai/412991" width="40" height="40" alt="OpenAI"/>
      <sub><b>Embeddings</b></sub>
    </div>
  </a>

  <!-- RapidFuzz -->

  <a href="https://github.com/rapidfuzz/RapidFuzz" title="RapidFuzz" style="text-decoration:none">
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
      <img src="https://cdn.simpleicons.org/git/181717" width="40" height="40" alt="RapidFuzz"/>
      <sub><b>RapidFuzz</b></sub>
    </div>
  </a>
</div>

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
