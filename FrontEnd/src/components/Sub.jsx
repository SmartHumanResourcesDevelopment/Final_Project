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

  // props로 받은 데이터가 있으면 우선 사용, 없으면 context 데이터 사용
  const keywordData = propsKeywordData || contextKeywordData;
  const [openChat, setOpenChat]     = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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

  // 페이지 로드 시 감성분석 별도 호출
  useEffect(() => {
    const loadSentimentAnalysis = async () => {
      if (!keywordData?.keyword) return;

      setSentimentLoading(true);
      setSentimentError(null);

      try {
        console.log("🎯 감성분석 로딩 시작:", keywordData.keyword);
        const sentimentData = await keywordApiService.getSentimentAnalysis(keywordData.keyword);
        setSentimentAnalysis(sentimentData);
        console.log("✅ 감성분석 로딩 완료:", sentimentData);
      } catch (error) {
        console.error("❌ 감성분석 로딩 실패:", error);
        setSentimentError(error.message);
      } finally {
        setSentimentLoading(false);
      }
    };

    // 페이지 도착 후 1초 뒤에 감성분석 시작
    const timer = setTimeout(loadSentimentAnalysis, 1000);
    return () => clearTimeout(timer);
  }, [keywordData?.keyword]);

  // 페이지 빈 영역 클릭 시 챗봇 닫기
  const handleBackgroundClick = () => {
    if (openChat) {
      setOpenChat(false);
      onClose?.();
    }
  };

  return (
    <div className="detail-root" onClick={handleBackgroundClick}>
      {/* 상단바 */}
      {isAdmin ? <AdminNavigationBarSection /> : <NavigationSection />}
      {/* 키워드 소개 */}
      <DetailKeyword keywordData={keywordData} />
      {/* 키워드 그래프소개 */}
      <DetailInsightsSection
        keyword={keywordData?.keyword || "키워드 없음"}
        trendExplanation={keywordData?.trendExplanation}
      />
      {/* 감성분석 */}
      <KeywordHighlightSection
        keyword={keywordData?.keyword || "키워드 없음"}
        sentimentAnalysis={sentimentAnalysis}
        sentimentLoading={sentimentLoading}
        sentimentError={sentimentError}
        positiveComments={keywordData?.positiveComments || []}
        negativeComments={keywordData?.negativeComments || []}
      />
      {/* 유사도 */}
      <TrendAnalysisSection
        keyword={keywordData?.keyword || "키워드 없음"}
        similarityInfo={keywordData?.similarityInfo}
        similarKeywords={keywordData?.similarKeywords || []}
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
            <ChartBot onClose={() => {
              setOpenChat(false);
              onClose?.();
            }} />
          </div>
        </div>
      )}
    </div>
  );
};


export default Sub;
