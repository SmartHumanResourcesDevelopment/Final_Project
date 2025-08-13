// src/pages/Sub.jsx
import React, { useState, useEffect } from "react";
import { NavigationSection }  from "../common/menu_bar";

import { AdminNavigationBarSection } from "../common/Admin_menu_bar";

import { useUser } from "../contexts/UserContext";

import { DetailKeyword }      from "../UI/Detail_keyword";
import { DetailInsightsSection } from "../UI/Detail_title";
import { KeywordHighlightSection } from "../UI/Detail_kote";
import { TrendAnalysisSection } from "../UI/Detail_same";
import FooterSection           from "../common/footer";

import ChartBotIcon            from "../assets/img/Chart_Bot/ChartBotIcon.png";
import ChartBot                from "../components/ChartBot";
import { keywordApiService }   from "../api/sub";
import { useKeywordData }      from "../contexts/KeywordDataContext";

import "../assets/css/Sub.css";



const Sub = ({ keywordData: propsKeywordData, onClose }) => {
  const { keywordData: contextKeywordData } = useKeywordData();


  const { user } = useUser();
  const isAdmin = user.role === "관리자";

  // context 데이터를 우선 사용 (검색 시 업데이트), props는 초기 로드용
  const keywordData = contextKeywordData || propsKeywordData;

  // keywordData 변경 감지를 위한 상태
  const [currentKeywordData, setCurrentKeywordData] = useState(keywordData);
  const [lastSearchTimestamp, setLastSearchTimestamp] = useState(null);
  const [openChat, setOpenChat]     = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // keywordData 변경 감지 - 검색 시에만 한 번 업데이트
  useEffect(() => {
    // keywordData가 있고, searchTimestamp가 변경된 경우에만 업데이트
    if (keywordData && keywordData.searchTimestamp && keywordData.searchTimestamp !== lastSearchTimestamp) {
      console.log("🔄 Sub - 새로운 검색 감지");
      console.log("  이전 타임스탬프:", lastSearchTimestamp);
      console.log("  새로운 타임스탬프:", keywordData.searchTimestamp);
      console.log("  키워드:", keywordData.keyword || keywordData.keywordInfo?.KEYWORD_NAME);

      setCurrentKeywordData(keywordData);
      setLastSearchTimestamp(keywordData.searchTimestamp);

      console.log("✅ Sub - 키워드 데이터 업데이트 완료");
    }
  }, [keywordData?.searchTimestamp, lastSearchTimestamp]);

  // 감성분석 상태
  const [sentimentAnalysis, setSentimentAnalysis] = useState(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);
  const [sentimentError, setSentimentError] = useState(null);

  // 말풍선 타이밍 로직
  useEffect(() => {
    const iv = setInterval(() => {
      if (!openChat) {
        setShowBubble(true);
        setTimeout(() => setShowBubble(false), 3000);
      }
    }, 15000);
    return () => clearInterval(iv);
  }, [openChat]);

  // 키워드 변경 시 감성분석 별도 호출
  useEffect(() => {
    const loadSentimentAnalysis = async () => {
      const keyword = currentKeywordData?.keywordInfo?.KEYWORD_NAME || currentKeywordData?.keyword;
      if (!keyword || !currentKeywordData?.searchTimestamp) {
        console.log("⚠️ 감성분석 로딩 스킵: 키워드 없음 또는 검색 데이터 아님");
        return;
      }

      setSentimentLoading(true);
      setSentimentError(null);

      try {
        console.log("🎯 감성분석 로딩 시작:", keyword);
        const sentimentData = await keywordApiService.getSentimentAnalysis(keyword);
        setSentimentAnalysis(sentimentData);
        console.log("✅ 감성분석 로딩 완료:", sentimentData);
      } catch (error) {
        console.error("❌ 감성분석 로딩 실패:", error);
        setSentimentError(error.message);
      } finally {
        setSentimentLoading(false);
      }
    };

    // 키워드 데이터가 변경된 경우에만 감성분석 시작
    if (currentKeywordData?.searchTimestamp) {
      const timer = setTimeout(loadSentimentAnalysis, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentKeywordData?.searchTimestamp]);

  // 페이지 빈 영역 클릭 시 챗봇 닫기
  const handleBackgroundClick = () => {
    if (openChat) {
      setOpenChat(false);
      onClose?.();
    }
  };
  console.log("🔍 Sub 컴포넌트 - keywordData 내용:", keywordData);
  console.log("🔍 Sub 컴포넌트 - currentKeywordData 내용:", currentKeywordData);
  console.log("🔍 Sub 컴포넌트 - propsKeywordData:", propsKeywordData);
  console.log("🔍 Sub 컴포넌트 - contextKeywordData:", contextKeywordData);

  // API 응답 구조 상세 분석
  if (currentKeywordData) {
    console.log("📊 현재 사용 중인 키워드 데이터 구조 분석:");
    console.log("  - keyword:", currentKeywordData.keyword);
    console.log("  - keywordInfo:", currentKeywordData.keywordInfo);
    console.log("  - mainStats:", currentKeywordData.mainStats);
    console.log("  - trendExplanation:", currentKeywordData.trendExplanation);
    console.log("  - description:", currentKeywordData.description);
    console.log("  - emotionLabels:", currentKeywordData.emotionLabels);
    console.log("  - ranking:", currentKeywordData.ranking);
    console.log("  - 모든 키:", Object.keys(currentKeywordData));
  }
  return (
    <div className="detail-root" onClick={handleBackgroundClick}>
      {/* 상단바 */}
      {isAdmin ? <AdminNavigationBarSection /> : <NavigationSection />}
      {/* 키워드 소개 */}
      <DetailKeyword
        key={`detail-${currentKeywordData?.searchTimestamp || 'default'}`}
        keywordData={currentKeywordData}
      />
      {/* 키워드 그래프소개 */}
      <DetailInsightsSection
        key={`insights-${currentKeywordData?.searchTimestamp || 'default'}`}
        keyword={currentKeywordData?.keywordInfo?.KEYWORD_NAME || currentKeywordData?.keyword || "키워드 없음"}
        trendExplanation={
          currentKeywordData?.trendExplanation ||
          currentKeywordData?.aiSummary ||
          currentKeywordData?.description ||
          currentKeywordData?.keywordInfo?.description ||
          "트렌드 분석 정보를 불러오는 중입니다..."
        }
      />
      {/* 감성분석 */}
      <KeywordHighlightSection
        key={`highlight-${currentKeywordData?.searchTimestamp || 'default'}`}
        keyword={currentKeywordData?.keywordInfo?.KEYWORD_NAME || currentKeywordData?.keyword || "키워드 없음"}
        sentimentAnalysis={sentimentAnalysis}
        sentimentLoading={sentimentLoading}
        sentimentError={sentimentError}
        positiveComments={currentKeywordData?.positiveComments || []}
        negativeComments={currentKeywordData?.negativeComments || []}
      />
      {/* 유사도 */}
      <TrendAnalysisSection
        key={`trend-${currentKeywordData?.searchTimestamp || 'default'}`}
        keyword={currentKeywordData?.keywordInfo?.KEYWORD_NAME || currentKeywordData?.keyword || "키워드 없음"}
        similarityInfo={currentKeywordData?.similarityInfo}
        similarKeywords={currentKeywordData?.similarKeywords || []}
      />
      <FooterSection />

      {/* 말풍선 */}
      {showBubble && !isHovering && !openChat && (
        <div className="chatbot-bubble">
          아이디어가 필요하신가요?
        </div>
      )}

      {/* 챗봇 아이콘 */}
      <button
        type="button"
        className="chatbot-fab"
        onClick={e => {
          e.stopPropagation();
          setOpenChat(true);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        aria-label="챗봇 열기"
      >
        <img src={ChartBotIcon} alt="챗봇 아이콘" />
      </button>

      {/* 챗봇 다이얼로그 (한 번만 렌더링) */}
      {openChat && (
        <div
          className="chartbot-overlay-wrapper"
          onClick={e => {
            // overlay 클릭으로도 닫기
            e.stopPropagation();
            setOpenChat(false);
            onClose?.();
          }}
        >
          <div
            className="chartbot-dialog-wrapper"
            onClick={e => e.stopPropagation()}
          >
          {/* keywordData를 ChartBot 컴포넌트에 props로 전달 */}
            <ChartBot onClose={() => {
              setOpenChat(false);
              onClose?.();
            }}
            keywordData={keywordData}
            />
          </div>
        </div>
      )}
    </div>
  );
};


export default Sub;
