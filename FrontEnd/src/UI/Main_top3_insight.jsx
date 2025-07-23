import React,{useState} from "react";
import chartImg from "../assets/img/common/hot_chart.png";
import "../assets/css/Main_top3_insight.css";

const periods = ["1일", "1주", "1달", "1년"];
const dateLabels = ["07/11", "07/12", "07/13", "07/14", "06/26", "06/26", "06/27"];
const legends = [
  { color: "#ff0040", text: "탕후루" },
  { color: "#ff4cf9", text: "마라탕" },
  { color: "#4f6ff5", text: "제로음료" },
];

export default function Main_top3_insight() {
  const [active, setActive] = useState("1주");   // ★ 탭 상태

  return (
    <section className="insight">
      {/* ── 제목 & 탭 ─────────────────────────── */}
      <header className="insight__header">
        <h2>
          핫한 이유, <span className="highlight">숫자가 말해요</span>
        </h2>
        <p className="insight__sub">
          일주일간 언급량 변화를 통해 인기 상승세를 확인하세요
        </p>

        {/* 기간 탭 */}
        <nav className="insight__tabs" aria-label="기간 선택">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setActive(p)}
              className={active === p ? "is-active" : ""}
            >
              {p}
            </button>
          ))}
        </nav>
      </header>

      {/* ── 그래프 캔버스 ─────────────────────── */}

      <div className="insight__canvas" role="figure" aria-label={`${active} 언급량 추이`}>
        <img src={chartImg} alt="3개 키워드 언급량 추이 선그래프" />

        {/* 범례 */}
        <ul className="legend">
          {legends.map(({ color, text }) => (
            <li key={text}>
              <span style={{ backgroundColor: color }} /> {text}
            </li>
          ))}
        </ul>

        {/* ★ 날짜 레이블 : 그래프와 설명 사이 */}
          <ul className="xlabels">
            {dateLabels.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          {/* 설명문 */}
          <p className="insight__caption">
            탕후루는 비주얼 중심 SNS 유행과 함께 급상승, 마라탕은 여전히 MZ세대의
            꾸준한 선택, 제로음료는 건강함을 중시하는 흐름 속 점진적 성장 중입니다.
          </p>
      </div>

      
     
      
    </section>
  );
}
export {Main_top3_insight}
