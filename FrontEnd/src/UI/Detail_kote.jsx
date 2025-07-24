import React, { useState } from "react";
// import image from "./image.svg";
import line2 from "../assets/img/admin/line.png";
import line3 from "../assets/img/admin/line.png";
import line4 from "../assets/img/admin/line.png";
import line5 from "../assets/img/admin/line.png";
import line6 from "../assets/img/admin/line.png";
import line7 from "../assets/img/admin/line.png";
import line8 from "../assets/img/admin/line.png";
import line from "../assets/img/admin/line.png";
import rectangle62 from "../assets/img/common/Rectangle_bar.png";
import rectangle6 from "../assets/img/common/Rectangle_bar.png";
import rectangle7 from "../assets/img/common/Rectangle_bar.png";
import rectangle105 from "../assets/img/common/Rectangle_red.png";
import rectangle106 from "../assets/img/common/Rectangle_red.png";
import rectangle107 from "../assets/img/common/Rectangle_red.png";
import {
  DetailInsightsKOTE_positivity_Graph,
  DetailInsightsKOTE_negative_Graph,
} from "../UI/DetailInsightsKOTEGraph";
import "../assets/css/common/keyword_Kote.css";


const PERIODS = ["1일", "1주", "1달", "1년"];  // 예시 탭
export default function KeywordHighlightSection() {
  const [active, setActive] = useState("1주");
 /* 예시 댓글 */
  const positiveComments = [
    "🗨 너무 감동적인 맛...",
    "🗨 구하기 힘든걸 구해다준 친구 너무 감동...🥹",
    "🗨 말차 한잔과 즐거운 분위기 굿",
  ];
  const negativeComments = [
    "🗨 그냥 말차임... 뭐이리 유난들인지",
    "🗨 그냥 말차인데 호들갑떠는듯 노잼임",
    "🗨 건강음료인데... 당이 22g 오바임~",
  ];
  return (
    <section className="kote">
      <div className="kote__inner">
        {/* ---------- 헤더 ---------- */}
        <header className="kote__header">
          <h2 className="kote__title">KOTE 감성분석</h2>
          <p className="kote__subtitle">
            내가 주목한 키워드가 어떤 감성을 가지고 있는지 알아보아요
          </p>

          <nav className="kote__tabs" aria-label="기간 선택">
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

        {/* ---------- 카드 ---------- */}
        <article className="kote__card">
          <div className="kote__charts">
            <DetailInsightsKOTE_positivity_Graph />
            <DetailInsightsKOTE_negative_Graph />
          </div>

          <div className="kote__comments">
            <ul className="kote__commentList">{positiveComments.map((c) => <li key={c}>{c}</li>)}</ul>
            <ul className="kote__commentList">{negativeComments.map((c) => <li key={c}>{c}</li>)}</ul>
          </div>

          <p className="kote__footnote">
            1500개 댓글 분석 기준 상위 감정
          </p>
        </article>
      </div>
    </section>
  );
};
export { KeywordHighlightSection};