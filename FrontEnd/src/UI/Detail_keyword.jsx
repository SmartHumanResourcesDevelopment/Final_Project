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

  // props로 받은 데이터가 있으면 사용, 없으면 기본값 사용
  const currentKeywordData = keywordData || defaultKeywordData;
  const [query, setQuery] = useState("");
  const [showCollab, setShowCollab] = useState(false);


  // 키워드 검색 함수
  const handleSearch = async () => {
    if (!query.trim()) {
      alert("검색할 키워드를 입력해주세요.");
      return;
    }

    try {
      console.log("🔍 키워드 검색 시작:", query.trim());

      // 키워드 검색 API 호출
      const data = await keywordApiService.searchKeyword(query.trim());

      if (data && data.keywordInfo) {
        // 검색 성공 시 전역 상태에 저장하고 현재 페이지 새로고침
        setKeywordData(data);
        console.log("✅ 키워드 검색 성공:", data);

        // 검색어 초기화
        setQuery("");

        // 페이지 새로고침 또는 상태 업데이트를 통해 새로운 키워드 데이터 표시
        window.location.reload();

      } else {
        // 검색 결과가 없는 경우
        alert("해당 키워드로는 검색을 할 수 없습니다. 올바른 키워드 이름을 입력하세요.");
      }

    } catch (error) {
      console.error("❌ 키워드 검색 실패:", error);
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
          감정 라벨링 TOP 5 : {currentKeywordData.emotionLabels.join(", ")}
        </p>
        <p className="detailKeyword__desc">{currentKeywordData.description}</p>
      </div>

      {/* ② 오른쪽 : 원형 이미지 */}
      <figure className="detailKeyword__thumb">
        <img src={matchaImg} alt="말차 이미지" />
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