import React from "react";
import "../assets/css/common/Main_Trending_insight.css";
import RisingInsightsChart from "../UI/RisingInsightsChart"; // 실제 그래프 컴포넌트

export default function Main_Trending_insight() {

  return (
    <section className="trend-insight">
      {/* ───────── 헤더 (제목+부제+탭) ───────── */}
      <header className="ti-head">

          <h2 className="hl">
            급상승 중! <span >놓치면 늦는 키워드</span>
          </h2>
          <p className="ti-sub">
            깜짝스러운 검색량 증가는 새로운 트렌드의 신호일 수 있어요, 그리고 가까운 미래 예측 분석까지 함께 볼수있어요
          </p>

        <div className="period-info">
          <span style={{
            fontSize: '0.9rem',
            color: '#666',
            fontWeight: '500'
          }}>
            📅 최근 30일 데이터
          </span>
        </div>
      </header>

      {/* ───────── 그래프 + 요약 카드 ───────── */}
      <div className="ti-card">
        <RisingInsightsChart />

      </div>
    </section>
  );
}
export { Main_Trending_insight };
