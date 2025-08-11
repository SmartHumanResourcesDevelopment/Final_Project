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


// const PERIODS = ["1일", "1주", "1달", "1년"];  // 예시 탭
export default function KeywordHighlightSection({
  keyword = "말차",
  sentimentAnalysis,
  sentimentLoading = false,
  sentimentError = null,
  positiveComments = [],
  negativeComments = []
}) {
  const [active, setActive] = useState("1주");

  // 디버깅 로그
  console.log("KeywordHighlightSection props:", { keyword, sentimentAnalysis, positiveComments, negativeComments });

  // 감성분석 댓글 데이터 상세 로그
  if (sentimentAnalysis) {
    console.log("📊 감성분석 댓글 데이터:");
    console.log("   긍정 댓글:", sentimentAnalysis.POSITIVE_COMMENTS);
    console.log("   부정 댓글:", sentimentAnalysis.NEGATIVE_COMMENTS);
  }

  // 감성분석 데이터 확인 - TOP 3만 사용
  const hasSentimentData = sentimentAnalysis &&
    (sentimentAnalysis.POSITIVE_COUNT > 0 || sentimentAnalysis.NEGATIVE_COUNT > 0);

  // TOP 3 감정 데이터 추출
  const topPositiveEmotions = sentimentAnalysis?.TOP_POSITIVE || [];
  const topNegativeEmotions = sentimentAnalysis?.TOP_NEGATIVE || [];

  // 그래프에 표시할 데이터 결정
  const hasPositiveData = topPositiveEmotions.length > 0;
  const hasNegativeData = topNegativeEmotions.length > 0;

  console.log("TOP 3 감정 데이터:", { topPositiveEmotions, topNegativeEmotions });

  // 댓글 기능은 추후 추가 예정
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

          </nav>
        </header>

        {/* ---------- 카드 ---------- */}
        <article className="kote__card">
          {sentimentLoading ? (
            // 로딩 상태
            <div className="sentiment-loading">
              <div className="loading-spinner"></div>
              <h3>감성분석 중입니다...</h3>
              <p>키워드 '{keyword}'의 감정을 분석하고 있습니다.</p>
            </div>
          ) : sentimentError ? (
            // 에러 상태
            <div className="sentiment-error">
              <div className="error-icon">⚠️</div>
              <h3>감성분석 오류</h3>
              <p>{sentimentError}</p>
            </div>
          ) : hasSentimentData ? (
            // 데이터 있음
            <>
              <div className="kote__charts">
                {hasPositiveData && (
                  <DetailInsightsKOTE_positivity_Graph
                    positiveCount={sentimentAnalysis.POSITIVE_COUNT}
                    totalCount={sentimentAnalysis.TOTAL_COUNT}
                    topEmotions={topPositiveEmotions}
                    comments={sentimentAnalysis.POSITIVE_COMMENTS || []}
                  />
                )}
                {hasNegativeData && (
                  <DetailInsightsKOTE_negative_Graph
                    negativeCount={sentimentAnalysis.NEGATIVE_COUNT}
                    totalCount={sentimentAnalysis.TOTAL_COUNT}
                    topEmotions={topNegativeEmotions}
                    comments={sentimentAnalysis.NEGATIVE_COMMENTS || []}
                  />
                )}
                {!hasPositiveData && !hasNegativeData && (
                  <div className="no-emotion-data">
                    <p>감정 분석 데이터가 없습니다.</p>
                  </div>
                )}
              </div>

              {/* 댓글은 각 그래프 컴포넌트 내부에서 표시되므로 여기서는 제거 */}

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