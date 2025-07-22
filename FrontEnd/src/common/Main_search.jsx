import React, { useState } from "react";
import search from "./search.png";

export const RecommendationsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const popularKeywords = ["마라탕", "민트초코", "말차", "탕후루", "마라탕"];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Handle search functionality here
    console.log("Searching for:", searchQuery);
  };

  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
  };

  return (
    <section
      className="absolute w-[864px] h-[205px] top-[637px] left-[290px]"
      role="search"
      aria-labelledby="search-heading"
    >
      <h2
        id="search-heading"
        className="absolute top-0 left-[238px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-black text-[26px] text-center tracking-[0.50px] leading-10 whitespace-nowrap"
      >
        궁금한 키워드를 직접 검색해보세요
      </h2>

      <div className="absolute top-[165px] left-[278px] opacity-70 [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-base text-center tracking-[0.50px] leading-10 whitespace-nowrap">
        {popularKeywords.map((keyword, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleKeywordClick(keyword)}
            className="hover:opacity-100 transition-opacity cursor-pointer"
            aria-label={`Search for ${keyword}`}
          >
            #{keyword}
            {index < popularKeywords.length - 1 ? " " : ""}
          </button>
        ))}
      </div>

      <div className="absolute w-[862px] h-[76px] top-[74px] left-0">
        <form
          onSubmit={handleSearchSubmit}
          className="relative w-[860px] h-[76px]"
        >
          <label htmlFor="search-input" className="sr-only">
            키워드 검색
          </label>

          <input
            id="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="예) 민트초코"
            className="absolute w-[860px] h-[76px] top-0 left-0 border border-solid border-black bg-transparent pl-[25px] pr-[60px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-base tracking-[0.50px] leading-10 focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
            aria-describedby="search-description"
          />

          <div
            id="search-description"
            className="absolute top-[18px] left-[25px] opacity-70 [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-base text-center tracking-[0.50px] leading-10 whitespace-nowrap pointer-events-none"
            style={{ display: searchQuery ? "none" : "block" }}
          >
            예) 민트초코
          </div>

          <button
            type="submit"
            className="absolute w-8 h-8 top-[23px] left-[788px] hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="검색"
          >
            <img className="w-8 h-8" alt="" src={search} />
          </button>
        </form>
      </div>
    </section>
  );
};
export default RecommendationsSection;