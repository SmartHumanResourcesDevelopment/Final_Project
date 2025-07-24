import React from "react";
import ellipse172 from "../assets/img/same_/green.png";
import ellipse173 from "../assets/img/same_/orange.png";
import ellipse174 from "../assets/img/same_/sky.png";
import ellipse175 from "../assets/img/same_/pupple.png";
import ellipse17 from "../assets/img/same_/pink.png";

import {DetailBubbleChart} from "../UI/DetailbubleChart";
import "../assets/css/Detailsame.css";

export default function TrendAnalysisSection() {
  /* ▼ 실제 데이터/API 로 교체하면 됨 */
  const trendData = [
    { id: 1, pct: "92%", label: "쑥",    color: "#f89c2f", size: 221, top:  67, left: 141, img: "orange" },
    { id: 2, pct: "55%", label: "흑임자", color: "#2fbede", size: 162, top: 147, left:   0, img: "sky"   },
    { id: 3, pct: "25%", label: "약과",  color: "#6463d6", size: 138, top:  19, left:  23, img: "purple"},
    { id: 4, pct: "15%", label: "그래놀라",color:"#f85a5c",size:101, top:263, left: 119, img:"pink"   },
    { id: 5, pct: "13%", label: "젤라또", color: "#4ad443", size: 93,  top:   0, left: 154, img:"green"  },
  ];

  return (
    <div className="detailSame">
  {/* ------- 제목 & 부제 ------- */}
  <header className="detailSame__header">
    <h2 className="detailSame__title">비슷한 키워드 TOP5</h2>
    <p className="detailSame__subtitle">
      찝찝박사님이 고르신 키워드로 EatPICK이 만들어드려요
    </p>
  </header>

  {/* ------- 카드 ------- */}
  <section className="trendCard" role="region" aria-labelledby="trend-title">
    <h3 id="trend-title" className="sr-only">
      비슷한 키워드 TOP5 버블 차트
    </h3>

    <DetailBubbleChart data={trendData} />

    <p className="trendCard__desc">
      말차를 좋아하는 잘파세대는 ‘쑥, 흑임자, 약과, 그래놀라’ 등 전통적이면서도
      건강한 이미지를 가진 재료에도 관심을 보입니다. 이들 키워드를 활용하여
      확장된 마케팅 전략을 고려해볼 수 있습니다.
    </p>
  </section>
</div>
  );
}
export {TrendAnalysisSection}