import React, { useState, useEffect } from "react";
import close from "../assets/img/Chart_Bot/close.png";
import call from "../assets/img/Chart_Bot/call.png";
import ideaIcon from "../assets/img/Chart_Bot/idea_icon.png";
import sell from "../assets/img/Chart_Bot/sell.png";
import messageBot from "../assets/img/Chart_Bot/Message_Bot.png";
import Chart_Bot_idea from "../UI/ChartBot/ChartBot_idea";
import Chart_Bot_Collab from "../UI/ChartBot/ChartBot_coll";
import Chart_Bot_Sell from "../UI/ChartBot/ChartBot.sell";
import LoadingMessage from "./LoadingMessage";

import "../assets/css/chartbot.css";

export const ChartBot = ({ onClose, keywordData }) => {
  const [isVisible] = useState(true);
  const [view, setView] = useState(0); // 0:메뉴, 1:제품, 2:콜라보, 3:슬로건

  // 1. 각 메뉴에 대한 상태를 개별적으로 관리합니다.
  const [productIdeas, setProductIdeas] = useState(null);
  const [collabIdeas, setCollabIdeas] = useState(null);
  const [slogans, setSlogans] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const menuItems = [
    { id: 1, title: "제품아이디어", icon: ideaIcon },
    { id: 2, title: "콜라보 아이디어", icon: call },
    { id: 3, title: "슬로건/마케팅문구", icon: sell },
  ];

  // 2. useEffect를 수정하여 view 상태에 따라 다른 API를 호출하도록 합니다.
  useEffect(() => {
    // 메뉴 화면(view: 0)이거나 키워드가 없으면 API를 호출하지 않습니다.
    if (view === 0 || !keywordData?.keyword) {
      return;
    }

    const fetchAIData = async () => {
      setIsLoading(true);
      let apiUrl = "";
      let logMessage = "";

      // view 값에 따라 API 주소와 로그 메시지를 설정합니다.
      switch (view) {
        case 1:
          apiUrl = "http://localhost:8095/zal/api/chatbot/product/generate";
          logMessage = "AI 제품 아이디어";
          break;
        case 2:
          apiUrl = "http://localhost:8095/zal/api/chatbot/collab/generate";
          logMessage = "AI 콜라보 아이디어";
          break;
        case 3:
          apiUrl = "http://localhost:8095/zal/api/chatbot/slogan/generate";
          logMessage = "AI 슬로건";
          break;
        default:
          setIsLoading(false);
          return;
      }

      console.log(`'${keywordData.keyword}'로 ${logMessage}를 요청합니다.`);

      try {
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: keywordData.keyword }),
        });

        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`);
        }

        const generatedData = await response.json();
        console.log(`✅ ${logMessage} 수신:`, generatedData);

        // view 값에 따라 적절한 state를 업데이트합니다.
        switch (view) {
          case 1: setProductIdeas(generatedData); break;
          case 2: setCollabIdeas(generatedData); break;
          case 3: setSlogans(generatedData); break;
        }
      } catch (error) {
        console.error(`❌ ${logMessage} 요청 실패:`, error);
        const errorPayload = { title: "오류 발생!", contents: ["아이디어를 불러오는 데 실패했습니다.", error.message] };
        switch (view) {
          case 1: setProductIdeas([errorPayload]); break;
          case 2: setCollabIdeas([errorPayload]); break;
          case 3: setSlogans([errorPayload]); break;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAIData();
  }, [view, keywordData]);

  if (!isVisible) return null;

  return (
    <div className="chartbot-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="chartbot-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="chartbot-header">
          <img src={messageBot} alt="챗봇" className="message-bot" />
          <button className="close-btn" onClick={onClose}>
            <img src={close} alt="닫기" />
          </button>
        </div>

        <div className="chartbot-content">
          {view === 0 && (
            <ul className="chartbot-menu">
              {menuItems.map(({ id, title, icon }) => (
                <li key={id}>
                  <button className="chartbot-btn" onClick={() => setView(id)}>
                    <span>{title}</span>
                    <img src={icon} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* 3. 각 뷰에 맞는 state를 props로 전달합니다. */}
          {view === 1 && (
            <div className="chartbot-subcontent">
              <div className="sub-scroll">
                {isLoading ? (
                  <LoadingMessage
                    message="AI가 제품 아이디어를 구상 중입니다"
                    type="typing"
                    showIcon={true}
                    textColor="#ffffff"
                  />
                ) : (
                  <Chart_Bot_idea
                    onClose={() => setView(0)}
                    keywordData={keywordData}
                    productIdeas={productIdeas}
                  />
                )}
              </div>
            </div>
          )}

          {view === 2 && (
            <div className="chartbot-subcontent">
              <div className="sub-scroll">
                {isLoading ? (
                  <LoadingMessage
                    message="AI가 콜라보 아이디어를 구상 중입니다"
                    type="dots"
                    showIcon={true}
                    textColor="#ffffff"
                  />
                ) : (
                  <Chart_Bot_Collab
                    onClose={() => setView(0)}
                    keywordData={keywordData}
                    collabIdeas={collabIdeas}
                  />
                )}
              </div>
            </div>
          )}

          {view === 3 && (
            <div className="chartbot-subcontent">
              <div className="sub-scroll">
                {isLoading ? (
                  <LoadingMessage
                    message="AI가 마케팅 문구를 작성 중입니다"
                    type="pulse"
                    showIcon={true}
                  />
                ) : (
                  <Chart_Bot_Sell
                    onClose={() => setView(0)}
                    keywordData={keywordData}
                    slogans={slogans}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartBot;
