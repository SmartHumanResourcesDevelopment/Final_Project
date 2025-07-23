// src/pages/Main.jsx
import React from "react";
import "../assets/css/Main.css"; // 메인 페이지 스타일

import { NavigationSection } from "../common/menu_bar";
import { Main_search } from "../common/Main_search";
import { Main_servise_banner } from "../UI/Main_servise_banner";
import { Main_rank } from "../UI/Main_rank";
import { Main_top3 } from "../UI/Main_top3";
import { KeywordSection } from "../UI/Main_up";
import { Main_top3_insight } from "../UI/Main_top3_insight";
import FooterSection from "../common/footer";



const Main = () => {

  

  /* ---------- 렌더 ---------- */
  return (
    <div className="main-root">
       {/* 상단 바 */}
      <NavigationSection />

     {/* 상단 배너 */}
      <Main_servise_banner />

      {/* 검색창 */}
      <Main_search />


      {/* 랭킹  */}
      <Main_rank />
     
     {/* 키워드 TOP3 */}
      <Main_top3 />

    {/* 키워드TOP3 그래프 */}
    <Main_top3_insight />

      {/* 잠재키워드
      <KeywordSection /> */}

      {/* 서비스 소개 */}

     
      {/* footer */}
        <FooterSection />
      
    </div>
  );
}
export default Main;
  
