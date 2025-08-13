import React, { useState, useEffect, useRef } from "react";
import "../assets/css/Main_top3_insight.css";
import Top3graph from "../UI/Main_top3_insight_gr";
import { mainApiService } from "../api/mainApi";

/** 기간 탭 */
const PERIODS = ["일", "주", "월"];

export default function Main_top3_insight() {
  const [active, setActive] = useState("월");   // 기본 기간
  const [aiSummary, setAiSummary] = useState(""); // AI 요약문
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [fullDataCache, setFullDataCache] = useState({}); // 전체 데이터 캐시 (차트 + AI 요약)
  const isFirstRender = useRef(true); // 첫 렌더링 여부 추적

  // 통합 데이터 가져오기 (차트 + AI 요약 한 번에)
  const fetchFullData = async (period) => {
    // 캐시된 데이터가 있으면 사용
    if (fullDataCache[period]) {
      const cachedData = fullDataCache[period];
      setAiSummary(cachedData.aiSummary);
      console.log("📋 캐시된 전체 데이터 사용:", period);
      return cachedData;
    }

    setLoading(true);
    try {
      console.log("🤖 통합 데이터 요청 - 기간:", period);
      const data = await mainApiService.getTop3Insights(period);

      if (data.aiSummary) {
        setAiSummary(data.aiSummary);
        // 전체 데이터를 캐시에 저장
        setFullDataCache(prev => ({ ...prev, [period]: data }));
        console.log("✅ 통합 데이터 로드 성공");
        return data;
      } else {
        setAiSummary("트렌드 분석 결과를 불러오는 중입니다...");
        return data;
      }
    } catch (error) {
      console.error("❌ 통합 데이터 로드 실패:", error);
      setAiSummary("트렌드 분석 결과를 불러올 수 없습니다.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 기간 변경 핸들러
  const handlePeriodChange = (newPeriod) => {
    if (newPeriod === active) {
      console.log("📋 동일한 기간 선택됨, 요청 생략:", newPeriod);
      return; // 같은 기간이면 요청하지 않음
    }

    setActive(newPeriod);
    fetchFullData(newPeriod);
  };

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    if (isFirstRender.current) {
      console.log("📋 컴포넌트 첫 렌더링 - 기간:", active);
      fetchFullData(active);
      isFirstRender.current = false;
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  return (
    <section className="insight_cont">
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
              onClick={() => handlePeriodChange(p)}
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
        {/* 실제 그래프 컴포넌트 - 캐시된 데이터 전달 */}
        <Top3graph
          period={active}
          cachedData={fullDataCache[active]}
        />

        {/* AI 생성 설명문 */}
        <div className="insight__caption">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <span className="loading-text">
                AI가 트렌드를 분석하고 있습니다
              </span>
              <div className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          ) : (
            <p className="summary-text">
              {aiSummary || "트렌드 분석 결과를 불러오는 중입니다."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
export { Main_top3_insight };