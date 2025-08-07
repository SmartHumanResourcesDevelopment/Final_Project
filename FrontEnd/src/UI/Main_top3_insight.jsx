import React, { useState } from "react";
import "../assets/css/Main_top3_insight.css";
import Top3graph from "../UI/Main_top3_insight_gr";   // 리네임했으므로 대소문자 확인!

/** 기간 탭 */
const PERIODS = ["일", "주", "월"];

export default function Main_top3_insight() {
  const [active, setActive] = useState("월");   // 기본 기간

  return (
    <section className="insight">
      {/* ── 제목 + 기간 탭 ─────────────────── */}
      <header className="insight__header">
        <h2 className="highlight">
          핫한 이유, <span >숫자가 말해요</span>
        </h2>
        <p className="insight__sub">
          {active === "일" && "최근 한 달간 일별 언급량 변화를 확인하세요"}
          {active === "주" && "최근 3개월간 주별 언급량 변화를 확인하세요"}
          {active === "월" && "최근 6개월간 월별 언급량 변화를 확인하세요"}
        </p>

        <nav className="insight__tabs" aria-label="기간 선택">
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

      {/* ── 그래프 + 설명 카드 ───────────────── */}
      <div
        className="insight__canvas"
        role="figure"
        aria-label={`${active} 언급량 추이`}
      >
        {/* 그래프 컴포넌트 (period prop 전달) */}
        <Top3graph period={active} />

        {/* 설명문 – 동적 업데이트 */}
        <p className="insight__caption">
          {active === "일" && "일별 데이터를 통해 최근 트렌드의 세밀한 변화와 급상승 구간을 파악할 수 있습니다."}
          {active === "주" && "주별 데이터로 단기 트렌드 변화와 지속성을 확인하여 향후 전망을 예측할 수 있습니다."}
          {active === "월" && "월별 데이터를 통해 중장기 트렌드와 계절적 패턴을 분석할 수 있습니다."}
        </p>
      </div>
    </section>
  );
}
export { Main_top3_insight };