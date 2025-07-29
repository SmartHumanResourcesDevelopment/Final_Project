import React, { useState } from "react";
import "../assets/css/common/Main_Trending_insight.css"; 
import RisingInsightsChart from "../UI/RisingInsightsChart"; // 실제 그래프 컴포넌트

const PERIODS = [
  { value: "1d", label: "1일" },
  { value: "1w", label: "1주" },
  { value: "1m", label: "1달" },
  { value: "1y", label: "1년" },
];

export default function Main_Trending_insight() {
  const [active, setActive] = useState("1w");

  return (
    <section className="trend-insight">
      {/* ───────── 헤더 (제목+부제+탭) ───────── */}
      <header className="ti-head">

          <h2 className="hl">
            급상승 중! <span >놓치면 늦는 키워드</span>
          </h2>
          <p className="ti-sub">
            깜짝스러운 검색량 증가는 새로운 트렌드의 신호일 수 있어요
          </p>

        <nav className="period-tabs" aria-label="기간 선택">
          {PERIODS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActive(value)}
              className={active === value ? "is-active" : ""}
              aria-pressed={active === value}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* ───────── 그래프 + 요약 카드 ───────── */}
      <div className="ti-card">
        <RisingInsightsChart period={active} />
        <p className="ti-summary">
          AI 푸드는 개인 맞춤형 식단 추천과 3D 푸드 프린팅 기술 발전이
          인플루언서들을 통해 언급되며 새로운 식사 경험으로 주목받고 있습니다.
          로컬 푸드 다이닝은 지역 특산물 활용 미식 경험과 지속 가능한 소비
          트렌드가 미디어와 기사를 통해 부각되며 인기를 얻고 있습니다.
          또한, 식물성 육류 퓨전은 건강과 환경을 모두 고려하는 새로운 미식
          시도로, 언론의 집중 조명과 함께 기존 육류 소비의 대안으로 급부상하고
          있습니다.
        </p>
      </div>
    </section>
  );
}
export { Main_Trending_insight };
