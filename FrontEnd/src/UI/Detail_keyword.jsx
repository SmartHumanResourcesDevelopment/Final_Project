import React from "react";
import { useState } from "react";
import Chart_Bot_Collab from "../UI/ChartBot/ChartBot_coll"
import { useUser } from "../contexts/UserContext";
import { useKeywordData } from "../contexts/KeywordDataContext";
import matchaImg from "../assets/img/common/녹차.png";
import search from "../assets/img/common/search.png";
import "../assets/css/Detail_keyword.css"; // Assuming you have a CSS file for styling
import { keywordApiService } from "../api/sub";

export default function DetailKeyword({ keywordData }) {
  const { user } = useUser(); // 사용자 정보 가져오기
  const { setKeywordData } = useKeywordData(); // 키워드 데이터 전역 상태 관리

  // 기본값 설정
  const defaultKeywordData = {
    keyword: "키워드 없음",
    ranking: "정보 없음",
    emotionLabels: ["즐거움", "건강", "~", "~", "~"],
    description: "‘맛있는 건강’을 추구하는 잘파세대의 새로운 일상",
  };

  // API 응답 데이터를 DetailKeyword 컴포넌트 형식으로 변환
  const transformKeywordData = (apiData) => {
    if (!apiData) {
      console.log("⚠️ API 데이터가 없음, 기본값 사용");
      return defaultKeywordData;
    }

    // API 응답에서 직접 데이터 사용 (백엔드에서 이미 처리됨)
    const result = {
      keyword: apiData.keyword || "키워드 없음",
      ranking: apiData.ranking || "정보 없음",
      emotionLabels: (apiData.emotionLabels && Array.isArray(apiData.emotionLabels)) ? apiData.emotionLabels : defaultKeywordData.emotionLabels,
      description: apiData.description || defaultKeywordData.description,
      // 원본 데이터도 보존
      ...apiData
    };

    console.log("🔄 데이터 변환 결과:", {
      "입력_keyword": apiData.keyword,
      "입력_ranking": apiData.ranking,
      "입력_emotionLabels": apiData.emotionLabels,
      "입력_description": apiData.description,
      "출력_keyword": result.keyword,
      "출력_ranking": result.ranking,
      "출력_emotionLabels": result.emotionLabels,
      "출력_description": result.description
    });

    return result;
  };

  // props로 받은 데이터를 변환하여 사용
  const currentKeywordData = transformKeywordData(keywordData);

  console.log("🔍 Detail_keyword - 원본 키워드 데이터:", keywordData);
  console.log("🔍 Detail_keyword - 변환된 키워드 데이터:", currentKeywordData);

  // API 응답 구조 상세 분석
  if (keywordData) {
    console.log("📊 Detail_keyword API 응답 구조 분석:");
    console.log("  - keywordInfo:", keywordData.keywordInfo);
    console.log("  - mainStats:", keywordData.mainStats);
    console.log("  - trendExplanation:", keywordData.trendExplanation);
    console.log("  - description:", keywordData.description);
    console.log("  - emotionLabels:", keywordData.emotionLabels);
    console.log("  - ranking:", keywordData.ranking);
    console.log("  - 모든 키:", Object.keys(keywordData));
  }
  const [query, setQuery] = useState("");
  const [showCollab, setShowCollab] = useState(false);


  const getKeywordImagePath = (keyword) => {
    if (!keyword) return "/img/default/이미지없음.png";

    const encodedKeyword = encodeURIComponent(keyword);
    return `/img/default/KeywordsImages/${encodedKeyword}.png`;
  };



  // 키워드 검색 함수
  const handleSearch = async () => {
    if (!query.trim()) {
      alert("검색할 키워드를 입력해주세요.");
      return;
    }

    const searchKeyword = query.trim();

    // 🔥 검색 API 요청 시작과 동시에 최근 검색 키워드에 추가
    console.log("💾 Detail 페이지 - 검색 시도 키워드를 최근 검색에 추가:", searchKeyword);

    // Detail 페이지에서 직접 쿠키/localStorage에 저장
    try {
      let currentKeywords = [];

      // 기존 키워드 가져오기
      let savedKeywords = localStorage.getItem('recentSearchKeywords');
      if (savedKeywords) {
        currentKeywords = JSON.parse(savedKeywords);
      }

      // 중복 제거
      currentKeywords = currentKeywords.filter(
        k => k.toLowerCase() !== searchKeyword.toLowerCase()
      );

      // 새 키워드를 맨 앞에 추가
      currentKeywords.unshift(searchKeyword);

      // 최대 7개까지만 유지
      if (currentKeywords.length > 7) {
        currentKeywords = currentKeywords.slice(0, 7);
      }

      // localStorage에 저장
      localStorage.setItem('recentSearchKeywords', JSON.stringify(currentKeywords));
      console.log("✅ Detail 페이지 - 검색 키워드 저장 성공:", searchKeyword);

      // 전역 함수가 있다면 그것도 호출
      if (window.addRecentKeyword) {
        window.addRecentKeyword(searchKeyword);
      }

    } catch (error) {
      console.error("❌ Detail 페이지 - 검색 키워드 저장 실패:", error);
    }

    try {
      console.log("🔍 Detail_keyword - 키워드 검색 시작:", searchKeyword);
      console.log("🔍 Detail_keyword - 검색 전 현재 keywordData:", keywordData);

      // 키워드 검색 API 호출
      const data = await keywordApiService.searchKeyword(searchKeyword);
      console.log("🔍 Detail_keyword - API 응답 데이터:", data);

      if (data && (data.keywordInfo || data.keyword)) {
        // 검색 성공 시 전역 상태에 저장
        console.log("🔄 Detail_keyword - setKeywordData 호출 전");
        console.log("🔄 Detail_keyword - 업데이트할 데이터:", data);

        // 타임스탬프를 추가하여 강제로 새로운 객체로 만들기
        const updatedData = {
          ...data,
          searchTimestamp: Date.now(),
          searchKeyword: searchKeyword
        };

        setKeywordData(updatedData);
        console.log("✅ Detail_keyword - setKeywordData 호출 완료");
        console.log("✅ Detail_keyword - 키워드 검색 성공:", updatedData);

        // 검색어 초기화
        setQuery("");

        // 성공 메시지 표시
        console.log(`✅ Detail_keyword - "${searchKeyword}" 검색 완료, 화면 업데이트 완료`);

      } else {
        // 검색 결과가 없는 경우 (이미 최근 검색에는 추가됨)
        console.log("⚠️ Detail_keyword - 검색 결과 없음:", data);
        alert("해당 키워드로는 검색을 할 수 없습니다. 올바른 키워드 이름을 입력하세요.");
      }

    } catch (error) {
      console.error("❌ 키워드 검색 실패:", error);
      // 검색 실패해도 이미 최근 검색에는 추가됨
      alert("해당 키워드로는 검색을 할 수 없습니다. 올바른 키워드 이름을 입력하세요.");
    }
  };

  // Enter 키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="detailKeyword">
      {/* ① 왼쪽 : 텍스트  */}
      <div className="detailKeyword__info">
        <p className="detailKeyword__intro">{user?.nickname || '찝찝박사'}님이 주목한 키워드</p>
        <p className="detailKeyword__sub">
          {user?.nickname || '찝찝박사'}님이 고르신 키워드 EatPICK이 분석해드려요
        </p>

        <h2 className="detailKeyword__keyword">{currentKeywordData.keyword}</h2>
        <p className="detailKeyword__rank">
        현재 순위 : {currentKeywordData.ranking ?
          (typeof currentKeywordData.ranking === 'number' ?
            `${currentKeywordData.ranking}위` :
            currentKeywordData.ranking) :
          '정보 없음'}
         </p>

        <p className="detailKeyword__labels">
          주요감정 라벨 : {currentKeywordData.emotionLabels.map(label => label.trim()).join(", ")}
        </p>
        <p className="detailKeyword__desc">{currentKeywordData.description || "키워드 설명을 불러오는 중..."}</p>
      </div>

      {/* ② 오른쪽 : 원형 이미지 */}
      <figure className="detailKeyword__thumb">
           <img
              src={getKeywordImagePath(currentKeywordData.keyword)}
              alt={currentKeywordData.keyword}
              onError={(e) => {
                e.target.onerror = null; // 무한루프 방지
                e.target.src = "/img/default/KeywordsImages/noImg.png";
              }}
              />

      </figure>

      {/* ③ 검색 버튼 (페이지 우측 상단 고정) */}
            <div className="detailKeyword__searchBtn">
            {/* 아이콘만 클릭했을 때 검색 실행 */}
             <span className="searchBtn__label">검색</span>
            <img
              src={search}
              alt="검색"
              onClick={handleSearch}
            />

            {/* 텍스트 입력창 – 버튼 hover/focus 시만 펼쳐짐 */}
            <input
              type="text"
              placeholder="키워드를 입력하세요!"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}      // 아이콘 클릭과 구분
            />
          </div>
          {/* 콜라보 컴포넌트 (props 전달) */}
          {showCollab && (
            <Chart_Bot_Collab
              onClose={() => setShowCollab(false)}
              keywordData={keywordData} // *핵심: 여기서 props 전달
            />
          )}
    </section>
  );
}
export {DetailKeyword};