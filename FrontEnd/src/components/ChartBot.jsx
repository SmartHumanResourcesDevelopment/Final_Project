import React, { useState, useEffect } from "react";
import close from "../assets/img/Chart_Bot/close.png";
import call from "../assets/img/Chart_Bot/call.png";
import ideaIcon from "../assets/img/Chart_Bot/idea_icon.png";
import sell from "../assets/img/Chart_Bot/sell.png";
import messageBot from "../assets/img/Chart_Bot/Message_Bot.png";
import  Chart_Bot_idea  from "../UI/ChartBot/ChartBot_idea";
import  Chart_Bot_Collab  from "../UI/ChartBot/ChartBot_coll";
import  Chart_Bot_Sell  from "../UI/ChartBot/ChartBot.sell";

import "../assets/css/chartbot.css";

export const ChartBot = ({ onClose, keywordData }) => {
  const [isVisible] = useState(true);

    // 0: 메뉴, 1: 제품아이디어, 2: 콜라보, 3: 슬로건
  const [view, setView] = useState(0);

  //  콜라보 아이디어와 로딩 상태를 관리할 state 추가 
  const [collabIdeas, setCollabIdeas] = useState(null); // 처음에는 데이터가 없으므로 null
  const [isLoading, setIsLoading] = useState(false);
  

  const menuItems = [
    { id: 1, title: "제품아이디어",    icon: ideaIcon },
    { id: 2, title: "콜라보 아이디어", icon: call },
    { id: 3, title: "슬로건/마케팅문구", icon: sell },
  ];

  // --- view 상태가 바뀔 때마다 실행될 Effect ---
  useEffect(() => {
  // 1. 현재 뷰가 콜라보 아이디어(2)가 아니면, 아무것도 하지 않고 즉시 종료합니다.
  if (view !== 2) {
    return;
  }

  
  
  const fetchCollabIdeasFromAI = async () => {

    // 2. 콜라보 뷰에 진입했으므로, 항상 데이터 로딩을 시작합니다.
    setIsLoading(true);

    console.log(`'${keywordData.keyword}' 키워드로 새 콜라보 아이디어를 요청합니다.`);
    
    // API 호출 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // API로부터 받아온 새로운 데이터
    try {
        // 1. 새로 만든 백엔드 API 주소로 'POST' 요청을 보냅니다.
        const response = await fetch("http://localhost:8095/zal/api/chatbot/collab/generate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // 2. 요청 본문(body)에 키워드를 JSON 형태로 담아 보냅니다.
          body: JSON.stringify({ keyword: keywordData.keyword }),
        });

        // 3. 서버 응답이 성공적이지 않으면 에러를 발생시킵니다.
        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`);
        }

        // 4. 성공적으로 받은 JSON 데이터를 파싱합니다.
        const generatedIdeas = await response.json();
        console.log("✅ 백엔드로부터 받은 AI 아이디어:", generatedIdeas);

        // 5. 받아온 데이터로 state를 업데이트하여 화면에 표시합니다.
        setCollabIdeas(generatedIdeas);

      } catch (error) {
        console.error("❌ AI 아이디어 요청 실패:", error);
        // 에러가 발생하면 사용자에게 알려줄 수 있도록 상태를 업데이트할 수 있습니다.
        setCollabIdeas([
            { title: "오류 발생!", contents: ["아이디어를 불러오는 데 실패했습니다.", "잠시 후 다시 시도해주세요.", error.message] }
        ]);
      } finally {
        // 6. 성공하든 실패하든 로딩 상태를 종료합니다.
        setIsLoading(false);
      }
    };

  fetchCollabIdeasFromAI();

// 5. 이 로직은 'view' 또는 'keywordData'가 변경될 때만 다시 실행됩니다.
}, [view, keywordData]); 

  if (!isVisible) return null;

return(
 <div className="chartbot-overlay" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="chartbot-dialog" onClick={e => e.stopPropagation()}>
        <div className="chartbot-header">
          <img src={messageBot} alt="챗봇" className="message-bot"/>
          <button className="close-btn" onClick={onClose}>
            <img src={close} alt="닫기"/>
          </button>
        </div>

        {/* Content 영역: 메뉴와 서브뷰를 같은 자리에서 토글합니다. */}
        <div className="chartbot-content">
          {view === 0 && (
            <ul className="chartbot-menu">
              {menuItems.map(({ id, title, icon }) => (
                <li key={id}>
                  <button
                    className="chartbot-btn"
                    onClick={() => setView(id)}   // 여기서 view가 바뀝니다
                  >
                    <span>{title}</span>
                    <img src={icon} alt="" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {view === 1 && (
             <div className="chartbot-subcontent">
                <div className="sub-scroll">
                <Chart_Bot_idea onClose={() => setView(0)} keywordData={keywordData} />
                </div>

            </div>
          )}
           {/* --- 콜라보 뷰 로직 --- */}
          {view === 2 && (
            <div className="chartbot-subcontent">
              <div className="sub-scroll">
                {isLoading ? (
                  <div className="loading-message">잠시만 기다려주세요. 멋진 아이디어를 떠올리고 있어요!</div>
                ) : (
                  <Chart_Bot_Collab
                    onClose={() => setView(0)}
                    keywordData={keywordData}
                    collabIdeas={collabIdeas} // <-- 생성된 데이터를 prop으로 전달합니다!
                  />
                )}
              </div>
            </div>
          )}
          {view === 3 && (

            <div className="chartbot-subcontent">
                <div className="sub-scroll">
                <Chart_Bot_Sell onClose={() => setView(0)} keywordData={keywordData} />
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChartBot;