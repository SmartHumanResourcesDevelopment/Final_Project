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
export default function KeywordHighlightSection({
  keyword = "말차",
  sentimentAnalysis,
  positiveComments = [],
  negativeComments = []
}) {
  const [active, setActive] = useState("1주");

  // 디버깅 로그
  console.log("KeywordHighlightSection props:", { keyword, sentimentAnalysis, positiveComments, negativeComments });

  // 감성분석 데이터 확인
  const hasSentimentData = sentimentAnalysis &&
    (sentimentAnalysis.POSITIVE_COUNT > 0 || sentimentAnalysis.NEGATIVE_COUNT > 0);

  // 기본 댓글 (데이터가 없을 때)
  const defaultPositiveComments = [
    "🗨 너무 감동적인 맛...",
    "🗨 구하기 힘든걸 구해다준 친구 너무 감동...🥹",
    "🗨 말차 한잔과 즐거운 분위기 굿",
  ];
  const defaultNegativeComments = [
    "🗨 그냥 말차임... 뭐이리 유난들인지",
    "🗨 그냥 말차인데 호들갑떠는듯 노잼임",
    "🗨 건강음료인데... 당이 22g 오바임~",
  ];

  // 실제 표시할 댓글 결정
  const displayPositiveComments = positiveComments.length > 0
    ? positiveComments.map(comment => `🗨 ${comment.COMMENT_TEXT}`)
    : (hasSentimentData ? [] : defaultPositiveComments);

  const displayNegativeComments = negativeComments.length > 0
    ? negativeComments.map(comment => `🗨 ${comment.COMMENT_TEXT}`)
    : (hasSentimentData ? [] : defaultNegativeComments);
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
          {hasSentimentData ? (
            <>
              <div className="kote__charts">
                <DetailInsightsKOTE_positivity_Graph
                  positiveCount={sentimentAnalysis.POSITIVE_COUNT}
                  totalCount={sentimentAnalysis.TOTAL_COUNT}
                />
                <DetailInsightsKOTE_negative_Graph
                  negativeCount={sentimentAnalysis.NEGATIVE_COUNT}
                  totalCount={sentimentAnalysis.TOTAL_COUNT}
                />
              </div>

              <div className="kote__comments">
                <ul className="kote__commentList">
                  {displayPositiveComments.length > 0 ?
                    displayPositiveComments.map((c, index) => <li key={index}>{c}</li>) :
                    <li className="no-comments">긍정 댓글이 없습니다</li>
                  }
                </ul>
                <ul className="kote__commentList">
                  {displayNegativeComments.length > 0 ?
                    displayNegativeComments.map((c, index) => <li key={index}>{c}</li>) :
                    <li className="no-comments">부정 댓글이 없습니다</li>
                  }
                </ul>
              </div>

              <p className="kote__footnote">
                {sentimentAnalysis.TOTAL_COUNT}개 댓글 분석 기준 상위 감정
              </p>
            </>
          ) : (
            <div className="no-sentiment-data">
              <div className="no-data-icon">📊</div>
              <h4>감성분석 데이터 준비중</h4>
              <p>현재 <strong>{keyword}</strong>에 대한<br />감성분석을 진행하고 있습니다</p>
            </div>
          )}
        </article>
      </div>
    </section>
  );
};
export { KeywordHighlightSection};