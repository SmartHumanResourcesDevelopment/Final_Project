import React from "react";
import matchaImg from "../assets/img/common/녹차.png";
import search from "../assets/img/common/search.png";
import "../assets/css/Detail_keyword.css"; // Assuming you have a CSS file for styling

const keywordData = {
  keyword: "말차",
  ranking: "20등",
  emotionLabels: ["즐거움", "건강", "~", "~", "~"],
  description: "‘맛있는 건강’을 추구하는 잘파세대의 새로운 일상",
};

export default function DetailKeyword() {
  return (
    <section className="detailKeyword">
      {/* ① 왼쪽 : 텍스트  */}
      <div className="detailKeyword__info">
        <p className="detailKeyword__intro">찝찝박사님이 주목한 키워드</p>
        <p className="detailKeyword__sub">
          찝찝박사님이 고르신 키워드 EatPICK이 분석해드려요
        </p>

        <h2 className="detailKeyword__keyword">{keywordData.keyword}</h2>
        <p className="detailKeyword__rank">현재 순위 : {keywordData.ranking}</p>

        <p className="detailKeyword__labels">
          감정 라벨링 TOP 5 : {keywordData.emotionLabels.join(", ")}
        </p>
        <p className="detailKeyword__desc">{keywordData.description}</p>
      </div>

      {/* ② 오른쪽 : 원형 이미지 */}
      <figure className="detailKeyword__thumb">
        <img src={matchaImg} alt="말차 이미지" />
      </figure>

      {/* ③ 검색 버튼 (페이지 우측 상단 고정) */}
      <button className="detailKeyword__searchBtn" aria-label="검색">
        <img src={search} alt="" />
        <span color="white">검색</span>
      </button>
    </section>
  );
}
export {DetailKeyword};