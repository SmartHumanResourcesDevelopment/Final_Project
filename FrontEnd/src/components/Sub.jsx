import React from "react";
import { KeywordSection } from "./sections/KeywordSection";
import { KeywordTopSection } from "./sections/KeywordTopSection";
import { KoteRankingSection } from "./sections/KoteRankingSection";
import { NavigationBarSection } from "./sections/NavigationBarSection/NavigationBarSection";
import { TrendAnalysisSection } from "./sections/TrendAnalysisSection/TrendAnalysisSection";

// 분리된 CSS 파일 임포트
import './Sub.css';

export const Element = () => {
  return (
    <div className="element-container" data-model-id="414:689">
      <div className="element-inner-wrapper">

        {/* KOTE 감성분석 섹션 */}
        <div className="kote-analysis-section">
          <div className="kote-analysis-bg" />
          <div className="kote-analysis-content">
            <div className="kote-analysis-title">KOTE 감성분석</div>
            <p className="kote-analysis-description">
              내가 주목한 키워드가 어떤 감성을 가지고 있는지 알아보아요
            </p>
          </div>
        </div>

        {/* 비슷한 키워드 TOP5 섹션 */}
        <div className="similar-keywords-section">
          <div className="similar-keywords-bg" />
          <div className="similar-keywords-content">
            <div className="similar-keywords-title">비슷한 키워드 TOP5</div>
            <div className="similar-keywords-description">
              쩝쩝박사님이 고르신 키워드로 EatPICK이&nbsp;&nbsp;만들어드려요
            </div>
          </div>
        </div>

        {/* 상단 네비게이션 및 핵심 섹션 그룹 */}
        <div className="top-sections-group">
          <div className="top-sections-inner">
            <NavigationBarSection />
            <div className="main-content-area">
              <div className="main-content-bg" />
              <KoteRankingSection />
              <KeywordTopSection />
            </div>
          </div>
          <img
            className="top-right-image"
            alt="Rectangle"
            src="/img/rectangle-112.png"
          />
          <div className="search-button">
            <div className="search-text">검색</div>
            <div className="search-icon-wrapper">
              <img className="search-icon-oval" alt="Oval" src="/img/oval.svg" />
              <img className="search-icon-path" alt="Path" src="/img/path-14.svg" />
            </div>
          </div>
        </div>

        {/* 트렌드 확산 배경 정보 박스 */}
        <div className="trend-info-box">
          <p className="trend-info-text">
            말차는 20XX년 XX월경 특정 인플루언서의 챌린지를 시작으로
            급부상했으며, &#39;맛있는 건강&#39;을 추구하는 잘파세대의 취향과
            &#39;인증샷 문화&#39;에 부합하며 빠르게 확산되었습니다. 특히, 기존의
            커피 위주 음료 시장에 대한 대안이자 새로운 미식 경험으로 인식되며
            인기를 얻었습니다.&#34;
          </p>
          <img
            className="trend-info-image"
            alt="Group"
            src="/img/group-410.png"
          />
        </div>

        <TrendAnalysisSection />
        <KeywordSection />

        {/* 말차 트렌드 확산 배경 섹션 (헤더) */}
        <div className="matcha-trend-header">
          <div className="matcha-trend-header-bg" />
          <div className="matcha-trend-header-content">
            <div className="matcha-trend-header-title">말차 트렌드 확산 배경</div>
            <div className="matcha-trend-header-description">
              EAT PICK이 분석해드려요
            </div>
          </div>
        </div>

        {/* 아이디어가 필요하신가요? 챗봇 버튼 */}
        <div className="chatbot-area">
          <div className="chatbot-button-wrapper">
            <img className="chatbot-icon" alt="Message bot" src="/img/message-bot.png" />
          </div>
          <div className="chatbot-text-bubble">
            <div className="chatbot-text">아이디어가 필요하신가요?</div>
          </div>
        </div>

        {/* 하단 푸터 */}
        <div className="footer">
          <div className="footer-content">
            <img className="footer-chatgpt-image" alt="Chatgpt image" src="/img/chatgpt-image-2025-7-16-02-55-42-1.png" />
            <p className="footer-info">
              박병록 · 김다현 · 차명훈&nbsp;&nbsp;| 스마트인재개발원&nbsp;&nbsp;| 0507-1379-9917 <br /> © 2025 Eat Pick
            </p>
          </div>
        </div>

        {/* 날짜 필터 (1일, 1주, 1달, 1년) */}
        <div className="date-filter-group">
          <div className="date-filter-calendar-icon">📅</div>
          <div className="date-filter-option">
            <div className="date-filter-text">1일</div>
          </div>
          <div className="date-filter-option active">
            <div className="date-filter-text">1주</div>
          </div>
          <div className="date-filter-option">
            <div className="date-filter-text">1달</div>
          </div>
          <div className="date-filter-option">
            <div className="date-filter-text">1년</div>
          </div>
        </div>

      </div>
    </div>
  );
};