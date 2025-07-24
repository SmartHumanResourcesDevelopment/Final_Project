import React, { useState } from "react";
import "../assets/css/Main_search.css"; 
import searchIcon from "../assets/img/common/search.png";


export default function Main_search() {
  const [searchQuery, setSearchQuery] = useState("");
  const popularKeywords = ["마라탕", "민트초코", "말차", "탕후루", "마라탕"];

  /* 검색 실행 */
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <section className="keyword-search" role="search">
      <h2 id="keyword-search-heading" className="keyword-search__title">
        궁금한 키워드를 직접 검색해보세요
      </h2>

      {/* 인기 키워드 해시태그 */}
      <div className="keyword-search__tags">
        {popularKeywords.map((kw, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Search ${kw}`}
            onClick={() => setSearchQuery(kw)}
          >
            #{kw}
          </button>
        ))}
      </div>

      {/* 검색 인풋 */}
      <form className="keyword-search__form" onSubmit={handleSubmit}>
        <label htmlFor="search-input" className="sr-only">
          키워드 검색
        </label>

        <input
          id="search-input"
          type="text"
          placeholder="예) 민트초코"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button type="submit" aria-label="검색">
          <img src={searchIcon} alt="" />
        </button>
      </form>
    </section>
  );
}
export  {Main_search};