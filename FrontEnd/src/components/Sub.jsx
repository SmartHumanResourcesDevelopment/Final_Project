import React from "react";
import { NavigationSection }  from "../common/menu_bar";
import { DetailKeyword } from "../UI/Detail_keyword";
import "../assets/css/Sub.css"; // Assuming you have a CSS file for styling

import { InsightsSection } from "../UI/Detail_title";
import { KeywordHighlightSection } from "../UI/Detail_kote";

import { TrendAnalysisSection } from "../UI/Detail_same";
import chatgptImage20257160255421 from "../assets/img/common/footer_img.png";
import group410 from "../assets/img/common/Group 410.png";
import messageBot from "../assets/img/common/Message Bot.png";
// import oval from "./oval.svg";
// import path14 from "./path-14.svg";
import rectangle112 from "../assets/img/common/녹차.png";

const Sub = () => {
  // const timeFilterOptions = [
  //   { label: "1일", active: false },
  //   { label: "1주", active: true },
  //   { label: "1달", active: false },
  //   { label: "1년", active: false },
  // ];
return (
    <div className="detail-root">
      {/* 상단바 */}
      <NavigationSection />

      {/* 상세 페이지 키워드 상단 정보 */}
      <DetailKeyword/>


   </div>
  );
};

export default Sub;