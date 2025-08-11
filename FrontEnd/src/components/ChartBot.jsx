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

  // 2. 콜라보 뷰에 진입했으므로, 항상 데이터 로딩을 시작합니다.
  setIsLoading(true);
  
  const fetchCollabData = async () => {
    console.log(`'${keywordData.keyword}' 키워드로 새 콜라보 아이디어를 요청합니다.`);
    
    // API 호출 시뮬레이션 (1초 대기)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // API로부터 받아온 새로운 데이터
    const generatedIdeas = [
      `'${keywordData.keyword}' 컨셉의 팝업 스토어 열기`,
      `'${keywordData.keyword}' 관련 인플루언서와 공동구매 진행`,
      `경쟁사와의 '${keywordData.keyword}' 비교 분석 콘텐츠 발행`,
      `'${keywordData.keyword}'를 주제로 한 숏폼 챌린지`
    ];
    
    // 3. 받아온 새 데이터로 state를 업데이트합니다.
    setCollabIdeas(generatedIdeas);
    setIsLoading(false); // 4. 로딩을 종료합니다.
  };

  fetchCollabData();

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