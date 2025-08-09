import React from "react";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import matchaImg from "../assets/img/common/녹차.png";
import search from "../assets/img/common/search.png";
import "../assets/css/Detail_keyword.css"; // Assuming you have a CSS file for styling

export default function DetailKeyword({ keywordData }) {
  const { user } = useUser(); // 사용자 정보 가져오기

  // 기본값 설정
  const defaultKeywordData = {
    keyword: "말차",
    ranking: "20등",
    emotionLabels: ["즐거움", "건강", "~", "~", "~"],
    description: "‘맛있는 건강’을 추구하는 잘파세대의 새로운 일상",
  };

  // props로 받은 데이터가 있으면 사용, 없으면 기본값 사용
  const currentKeywordData = keywordData || defaultKeywordData;
  const [query, setQuery] = useState("");
  return (
    <section className="detailKeyword">
      {/* ① 왼쪽 : 텍스트  */}
      <div className="detailKeyword__info">
        <p className="detailKeyword__intro">{user?.nickname || '찝찝박사'}님이 주목한 키워드</p>
        <p className="detailKeyword__sub">
          {user?.nickname || '찝찝박사'}님이 고르신 키워드 EatPICK이 분석해드려요
        </p>

        <h2 className="detailKeyword__keyword">{currentKeywordData.keyword}</h2>
        <p className="detailKeyword__rank">현재 순위 : {currentKeywordData.ranking}</p>

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
            {/* 아이콘만 클릭했을 때 이동 */}
             <span className="searchBtn__label">검색</span>
            <img
              src={search}
              alt="검색"
              onClick={() => {
                /* TODO: 상세 서브 페이지로 이동
                  예: navigate(`/search/${query}`);
                */
              }}
            />

            {/* 텍스트 입력창 – 버튼 hover/focus 시만 펼쳐짐 */}
            <input
              type="text"
              placeholder="키워드를 입력하세요!"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}      // 아이콘 클릭과 구분
            />
          </div>
    </section>
  );
}
export {DetailKeyword};