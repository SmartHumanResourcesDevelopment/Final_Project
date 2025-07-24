import React, { useState } from "react";
import  "../assets/css/DetailInsightsSection.css"; // Assuming you have a CSS file for styling
import DetailInsightsGraph from "../UI/Detail_graph"; // 실제 그래프 컴포넌트
const PERIODS = ["1일", "1주", "1달", "1년"];
export default function DetailInsightsSection({ keyword = "말차" }) {
  const [active, setActive] = useState("1주");   // 기본 탭

  return (
    <section className="detailInsights">
      {/* ---------- 헤더 영역 ---------- */}
      <header className="insightHeader">
        <h2 className="insightHeader__title">
          <span className="keywordHighlight">{keyword}</span><span className="keywordHighlight">트렌드 확산 배경</span>
        </h2>
        <p className="insightHeader__sub">EAT PICK이 분석해드려요</p>

        <nav className="insightTabs" aria-label="기간 선택">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setActive(p)}
              className={active === p ? "is-active" : ""}
              aria-pressed={active === p}
            >
              {p}
            </button>
          ))}
        </nav>
      </header>

      {/* ---------- 그래프 카드 ---------- */}
      <article className="insightCard">
        <div className="insightCard__chart">
          <DetailInsightsGraph/>
        </div>

        <p className="insightCard__desc">
          말차는 20XX년 XX월경 특정 인플루언서의 챌린지를 시작으로 급부상했으며,
          ‘맛있는 건강’을 추구하는 잘파세대의 취향과 ‘인증샷 문화’에 부합하며
          빠르게 확산되었습니다. 특히, 기존의 커피 위주 음료 시장에 대한 대안이자
          새로운 미식 경험으로 인식되며 인기를 얻었습니다.
        </p>
      </article>
    </section>
  );
}
export { DetailInsightsSection };