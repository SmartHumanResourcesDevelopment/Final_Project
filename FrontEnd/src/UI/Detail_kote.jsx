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


const SENTIMENT_PERIODS = ["전체", "최신순(3개월)"];  // 감성분석 기간 탭
export default function KeywordHighlightSection({
  keyword = "말차",
  sentimentAnalysis,
  sentimentLoading = false,
  sentimentError = null,
  positiveComments = [],
  negativeComments = []
}) {
  const [activePeriod, setActivePeriod] = useState("전체"); // 기간 필터 상태
  const [periodSentimentData, setPeriodSentimentData] = useState(null); // 기간별 감성분석 데이터

  // 디버깅 로그
  console.log("KeywordHighlightSection props:", { keyword, sentimentAnalysis, positiveComments, negativeComments });

  // 감성분석 댓글 데이터 상세 로그
  if (sentimentAnalysis) {
    console.log("📊 감성분석 댓글 데이터:");
    console.log("   긍정 댓글:", sentimentAnalysis.POSITIVE_COMMENTS);
    console.log("   부정 댓글:", sentimentAnalysis.NEGATIVE_COMMENTS);
  }

  // 기간별 감성분석 데이터 로드 함수
  const loadSentimentDataByPeriod = async (period) => {
    if (period === "전체") {
      setPeriodSentimentData(null); // 전체 기간은 기본 데이터 사용
      return;
    }

    try {
      console.log("🔍 기간별 감성분석 데이터 로드:", keyword, period);
      const response = await fetch(`http://localhost:8095/zal/api/keyword/sentiment?keyword=${encodeURIComponent(keyword)}&period=${encodeURIComponent(period)}`);

      if (!response.ok) {
        throw new Error('기간별 감성분석 조회 실패');
      }

      const data = await response.json();
      console.log("✅ 기간별 감성분석 데이터:", data);
      setPeriodSentimentData(data);

    } catch (error) {
      console.error("❌ 기간별 감성분석 로드 실패:", error);
      setPeriodSentimentData(null);
    }
  };

  // 기간 변경 핸들러
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
    loadSentimentDataByPeriod(period);
  };

  // 기간별로 필터링된 감성분석 데이터
  const filteredSentimentAnalysis = periodSentimentData || sentimentAnalysis;

  // 감성분석 데이터 확인 - TOP 3만 사용
  const hasSentimentData = filteredSentimentAnalysis &&
    (filteredSentimentAnalysis.POSITIVE_COUNT > 0 || filteredSentimentAnalysis.NEGATIVE_COUNT > 0);

  // TOP 3 감정 데이터 추출
  const topPositiveEmotions = filteredSentimentAnalysis?.TOP_POSITIVE || [];
  const topNegativeEmotions = filteredSentimentAnalysis?.TOP_NEGATIVE || [];

  // 그래프에 표시할 데이터 결정
  const hasPositiveData = topPositiveEmotions.length > 0;
  const hasNegativeData = topNegativeEmotions.length > 0;

  console.log("기간별 필터링된 감정 데이터:", { activePeriod, topPositiveEmotions, topNegativeEmotions });

  // 댓글 기능은 추후 추가 예정
  return (
    <section className="kote">
      <div className="kote__inner">
        {/* ---------- 헤더 ---------- */}
        <header className="kote__header">
          <h2 className="kote__title">
            <span className="keywordHighlight">{keyword}</span> KOTE 감성분석
          </h2>
          <p className="kote__subtitle">
            EAT PICK이 분석해드려요
          </p>

          <nav className="kote__tabs" aria-label="감성분석 기간 선택">
            {SENTIMENT_PERIODS.map((period) => (
              <button
                key={period}
                onClick={() => handlePeriodChange(period)}
                className={activePeriod === period ? "is-active" : ""}
                aria-pressed={activePeriod === period}
              >
                {period}
              </button>
            ))}
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
                    positiveCount={filteredSentimentAnalysis.POSITIVE_COUNT}
                    totalCount={filteredSentimentAnalysis.TOTAL_COUNT}
                    topEmotions={topPositiveEmotions}
                    comments={filteredSentimentAnalysis.POSITIVE_COMMENTS || []}
                    period={activePeriod}
                  />
                )}
                {hasNegativeData && (
                  <DetailInsightsKOTE_negative_Graph
                    negativeCount={filteredSentimentAnalysis.NEGATIVE_COUNT}
                    totalCount={filteredSentimentAnalysis.TOTAL_COUNT}
                    topEmotions={topNegativeEmotions}
                    comments={filteredSentimentAnalysis.NEGATIVE_COMMENTS || []}
                    period={activePeriod}
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
                {filteredSentimentAnalysis.TOTAL_COUNT}개 댓글 분석 기준 상위 감정 ({activePeriod})
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