import React, { useState } from "react";
import "../assets/css/Main_top3_insight.css";
import Top3graph from "../UI/Main_top3_insight_gr";   // 리네임했으므로 대소문자 확인!

/** 기간 탭 */
const PERIODS = ["1일", "1주", "1달", "1년"];

export default function Main_top3_insight() {
  const [active, setActive] = useState("1주");   // 기본 기간

  return (
    <section className="insight">
      {/* ── 제목 + 기간 탭 ─────────────────── */}
      <header className="insight__header">
        <h2 className="highlight">
          핫한 이유, <span >숫자가 말해요</span>
        </h2>
        <p className="insight__sub">
          일주일간 언급량 변화를 통해 인기 상승세를 확인하세요
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

        {/* 설명문 – 기존 그대로 유지 */}
        <p className="insight__caption">
          탕후루는 비주얼 중심 SNS 유행과 함께 급상승, 마라탕은 여전히
          MZ세대의 꾸준한 선택, 제로음료는 건강함을 중시하는 흐름 속
          점진적 성장 중입니다.
        </p>
      </div>
    </section>
  );
}
export { Main_top3_insight };