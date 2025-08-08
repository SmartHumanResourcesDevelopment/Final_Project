// src/pages/Main.jsx
import React from "react";
import "../assets/css/Main.css"; // 메인 페이지 스타일

import { NavigationSection } from "../common/menu_bar";
import { AdminNavigationBarSection } from "../common/Admin_menu_bar";

import {useUser} from "../contexts/UserContext";

import { Main_search } from "../common/Main_search";
import { Main_servise_banner } from "../UI/Main_servise_banner";
import { Main_rank } from "../UI/Main_rank";
import { Main_top3 } from "../UI/Main_top3";
import { Main_Trending } from "../UI/Main_Trending";
import { Main_top3_insight } from "../UI/Main_top3_insight";
import { Main_Trending_insight } from "../UI/Main_Trending_insight.jsx";
import FooterSection from "../common/footer";



const Main = () => {

  const { user } = useUser();
  const isAdmin = user.role === "관리자";
  

  /* ---------- 렌더 ---------- */
  return (
    <div className="main-root">
       {/* 상단 바 */}
      {isAdmin ? <AdminNavigationBarSection /> : <NavigationSection />}

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

      {/* 잠재키워드 */}
      <Main_Trending />

      {/* 급상승 인사이트 */}
      <Main_Trending_insight />

      {/* footer */}
      <FooterSection />

    </div>
  );
}
export default Main;
  
