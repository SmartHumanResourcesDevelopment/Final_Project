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

import "../assets/css/Sub.css";

const Sub = ({ onClose }) => {

  const { user } = useUser();
  const isAdmin = user.role === "관리자";

  const [openChat, setOpenChat]     = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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
      <DetailKeyword />
      {/* 키워드 그래프소개 */}
      <DetailInsightsSection />
      {/* 감성분석 */}
      <KeywordHighlightSection />
      {/* 유사도 */}
      <TrendAnalysisSection />
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
