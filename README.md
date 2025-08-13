# KOTE 모델을 활용한 잘파세대 식문화 트렌드 분석 서비스 (EatPick)

## 📃프로젝트 소개
인스타그램·유튜브 데이터를 수집·정제·분석해 **잘파세대**(Gen Z/Alpha) 식문화 트렌드를 탐지하고, 감성 분석과 키워드 유사도 기반 인사이트를 제공하는 풀스택 프로젝트입니다.

> **프로젝트 진행 기간**: 2025.07.14 \~ 2025.08.13
## 🧑‍💻팀원 역할

| 이름  | 역할                | 담당 업무                                     |
| --- | ----------------- | ----------------------------------------- |
| 박병록 | Team Leader (PM), DataAnalysis  | 리액트 컴포넌트 설계, 각 페이지 키워드 설명, 데이터 분석, API 관리 |
| 김다현 | FrontEnd, BackEnd | 화면 설계, 프론트엔드(CSS), 크롤링                    |
| 차명훈 | FrontEnd, BackEnd | 챗봇, 마이페이지 스크랩 보기, 로그인(SNS), 회원가입          |


**협업 노션 문서**: [📄 프로젝트 노션 링크](https://slime-roast-ee5.notion.site/20fa64f7def180d88c26fb1ffd3bb9b5?source=copy_link)


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
* [ER 다이어그램](#ER-다이어그램)
* [서비스 흐름도](#서비스-흐름도)
* [유스케이스 다이어그램](#유스케이스-다이어그램)

---

## 프로젝트 개요

* **목표**: SNS 원천 데이터(Instagram/YouTube)에서 **키워드 트렌드**와 **감성 흐름**을 분석하여, 마케터/기획자에게 **키워드 랭킹, 유사 키워드, 감성 분포, 마케팅 아이디어**를 제공.
* **핵심 포인트**

  * 각 SNS 플랫폼별 크롤링 안전 전략(로그인 세션 유지, 지연·프록시, 요청량 가이드)
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

* `YOUTUBE_VIDEO`, `YOUTUBE_COMMENT`, `INSTAGRAM_POST`, `INSTAGRAM_COMMENT`, `SENTIMENT_RESULT`, `KEYWORD_DAILY_STATS`, `KEYWORD_MAIN_STATS`, `KEYWORD_SIMILARITY`,`USER_TBL`, `KEYWORD`,`SENTIMENT_KEYWORD_MAP`
* `USER_COLLAB_IDEA`,`USER_MARKETING_SLOGAN`,`USER_PRODUCT_IDEA`
* 주요 인덱스: 기간·키워드 복합, 조인 최적화, 감정·출처 필터 인덱스, 랭킹 관련 인덱스

## ER 다이어그램

<img width="645" height="591" alt="image" src="https://github.com/user-attachments/assets/784e1d38-7dfc-4a6c-9fe3-2fb8305eb42c" />

## 서비스 흐름도
![22](https://github.com/user-attachments/assets/31e18562-cc0b-4bbd-a97b-e7273b728803)


## 유스케이스 다이어그램
![444](https://github.com/user-attachments/assets/5f4ae36c-01e1-436f-baa7-e98fca506c1b)


## 설치 & 실행

* **사전 준비**: Node.js 18+, Java 17, Python 3.11, Oracle 11g
* **환경 변수**: DB 접속, API 키, 클라이언트 URL 등 .env 관리
* **백엔드**: `./mvnw spring-boot:run`
* **프론트엔드**: `npm run dev`
* **데이터 분석**: `pip install -r requirements.txt` 후 크롤러·전처리 스크립트 실행

## API 개요

* 키워드 랭킹, 트렌드, 감성 분석, 유사 키워드, 샘플 댓글 조회

## UI 주요 화면
### 메인 화면 구성
<img width="1803" height="695" alt="image" src="https://github.com/user-attachments/assets/5a29aade-6169-43a1-a294-53d3dfce5115" />

<img width="1070" height="790" alt="image" src="https://github.com/user-attachments/assets/0025a8d0-1231-431c-bc03-1ba7dcfca796" />

<img width="1260" height="519" alt="image" src="https://github.com/user-attachments/assets/fc699bbd-25d5-444b-a2a3-f69f2f460676" />

<img width="1076" height="696" alt="image" src="https://github.com/user-attachments/assets/c5dcaf88-4b16-4190-ac9a-12775903cf21" />

### 심층 상세페이지
<img width="1045" height="552" alt="image" src="https://github.com/user-attachments/assets/0a796635-1a19-4f0a-86a1-5934c890c128" />

<img width="781" height="584" alt="image" src="https://github.com/user-attachments/assets/a98e293c-0d95-4baf-90bb-f47235307ba0" />

<img width="791" height="445" alt="image" src="https://github.com/user-attachments/assets/cb0ed64a-6edd-4375-a66e-d161a57b43b9" />

### 챗봇 인사이트
<img width="583" height="770" alt="image" src="https://github.com/user-attachments/assets/c2986914-f8ef-471b-9d19-d9fc2d30a0ea" />
<img width="579" height="756" alt="image" src="https://github.com/user-attachments/assets/eca70f71-9d93-453f-9405-bc635373e376" />

## 성능 최적화

* 인덱스 온리 쿼리, 통계 최신화, 조인 최적화, MERGE 프로시저 활용

## 주요 트러블슈팅

> 아래 항목은 실제 프로젝트 진행 중 발생한 대표 이슈를 **요약 → 원인 → 해결 → 검증** 순으로 정리한 기록입니다.

---

### 1) 인덱스 관련 성능 저하
<img width="296" height="285" alt="image" src="https://github.com/user-attachments/assets/a8cca75c-3188-4bd1-8d7a-1c5082fd500d" />

**요약**

* 대량 조회(기간 + 키워드 통계, 댓글/포스트 조인)에서 응답 지연.

**원인**

* 적절한 인덱스 부재로 테이블 풀스캔/비효율적 조인 발생.

**해결**

* 기간 우선 범위 스캔 + 키워드 정렬을 위한 인덱스 추가.
* 조인 키는 "복합 1개"보다 **단일 인덱스 2개** 제공으로 옵티마이저 선택지 확대.

```sql
-- 일별 통계 조회용
CREATE INDEX IX_KDS_DT_KW_CNT ON KEYWORD_DAILY_STATS (STATS_DATE, KEYWORD_ID, DAILY_COUNT);
CREATE INDEX IX_KDS_KW_DT     ON KEYWORD_DAILY_STATS (KEYWORD_ID, STATS_DATE);

-- 조인/필터 최적화
CREATE INDEX IX_YV_KEYWORD    ON YOUTUBE_VIDEO(KEYWORD_ID);
CREATE INDEX IX_IP_KEYWORD    ON INSTAGRAM_POST(KEYWORD_ID);
CREATE INDEX IX_YC_VIDEO_ONLY ON YOUTUBE_COMMENT(VIDEO_ID);
CREATE INDEX IX_IC_POST_COM   ON INSTAGRAM_COMMENT(POST_ID, COMMENT_ID);
CREATE INDEX IX_SR_SRC        ON SENTIMENT_RESULT(SOURCE_TYPE, SOURCE_ID);
```

**검증**

* 실행계획에서 **INDEX RANGE SCAN**으로 전환, 동일 질의 기준 평균 응답시간↓.

---

### 2) 사용자 사전(키워드 매핑) 오류
<img width="476" height="280" alt="image" src="https://github.com/user-attachments/assets/cee02632-9d5f-43da-b52f-641ecc9e0e07" />

**요약**

* 신규 트렌드 키워드가 매칭되지 않거나 오매칭 발생.

**원인**

* 사용자 사전 미갱신, 해시태그/본문 매칭 우선순위 부재, 유사도 임계값 부적절.

**해결**

* 매칭 순서 고정: **본문 정확매칭 → 해시태그 정확매칭 → 유사도 매칭(RapidFuzz)**.
* 주 1회 사전 동기화(신규 키워드 자동 반영)와 임계값 재점검.

**검증**

* 샘플 200건 수동 라벨 비교 시 매칭 정확도 향상 확인.

---

### 3) CLOB → VARCHAR2 변환 시 버퍼 부족(ORA-06502)
 <img width="1920" height="1080" alt="55" src="https://github.com/user-attachments/assets/83f7d8b8-23c9-4507-b24f-c67992f78042" />

**요약**

* 댓글/본문 CLOB를 목록용으로 잘라 보여줄 때 **numeric or value error** 발생.

**원인**

* SQL 컨텍스트에서 `VARCHAR2`는 최대 4000 bytes. CLOB을 바로 캐스팅/서브스트링 시 길이 초과.

**해결**

* `DBMS_LOB.SUBSTR`로 먼저 CLOB을 잘라내고, 2차로 `SUBSTR`로 표시길이 축소.
* MyBatis 매퍼에서 컬럼 타입/파라미터 타입을 문자열로 명시.

```sql
SELECT
  SUBSTR(DBMS_LOB.SUBSTR(yc.COMMENT_TEXT, 4000, 1), 1, 120) AS COMMENT_PREVIEW
FROM YOUTUBE_COMMENT yc
WHERE ...;
```

**검증**

* 동일 질의 재실행 시 예외 미발생, 미리보기 길이 정책 내 정상 동작.

---

### 4) 소셜 로그인(네이버) 사용자 정보 Insert 실패
<img width="1900" height="414" alt="56556" src="https://github.com/user-attachments/assets/284b6c9f-bde8-47be-afbc-9f07f9f82c32" />

**요약**

* 기능: 네이버 로그인 성공 후 사용자 정보를 DB에 **Insert**.
* 버그: **열 유형 부적합**으로 DB에 저장되지 않음.

**원인**

* DTO/매퍼 타입과 DB 컬럼 타입 불일치(문자열 길이/CHAR vs VARCHAR2/NULL 제약 등).

**해결**

* 스키마와 매핑을 일치화(길이/타입/NOT NULL/기본값 재정의), DTO·MyBatis 매퍼 동시 수정.
* 예: 소셜 여부 플래그는 `CHAR(1) DEFAULT 'N'`로 단일화, 외부 ID는 `VARCHAR2(255)`.

```sql
ALTER TABLE USER_TBL MODIFY (
  NAVERLOGINCHECK CHAR(1) DEFAULT 'N' NOT NULL,
  USERNAME        VARCHAR2(255),
  USERPROFILE     VARCHAR2(500)
);
```

**검증**

* 로그인 플로우 통합 테스트에서 신규/기존 사용자 모두 Insert/Upsert 정상.

---

### 5) 챗봇 글 스크랩 API — Authentication null
<img width="521" height="171" alt="14" src="https://github.com/user-attachments/assets/8054deb9-5956-47f5-be72-f95b627fd75d" />

**요약**

* 기능: 챗봇 생성 글을 **스크랩 버튼**으로 DB 저장.
* 버그: 컨트롤러 진입 시 `Authentication`이 **null** → 로그인 상태 인식 불가.

**원인**

* 해당 엔드포인트를 `.permitAll()`로 설정하여 **Spring Security 인증 필터 체인**을 건너뜀.

**해결**

* 엔드포인트를 인증 필요로 변경하고, 컨트롤러에서 인증 주체를 명시적으로 사용.

```java
// SecurityFilterChain
http
  .authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/scrap/**").authenticated()  // 인증 필요
    .anyRequest().permitAll()
  );

// Controller
@PostMapping("/api/scrap")
public ResponseEntity<?> scrap(@AuthenticationPrincipal UserPrincipal user,
                               @RequestBody ScrapReq req) {
  Long userId = user.getId();
  // ... save
  return ResponseEntity.ok().build();
}
```

**검증**

* 인증 사용자로 호출 시 200 OK, 비인증 호출 시 401 Unauthorized 확인.

## 시연 영상
[![프로젝트시연파일](https://github.com/user-attachments/assets/746cde71-6f92-42d2-8bfe-9d7a25eded36)](https://drive.google.com/file/d/1_avCMTfeb32LSSvnrROxXldI7Bkqz-ZR/view?usp=sharing)

