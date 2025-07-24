import React, { useState } from "react";
import close from "../assets/img/Chart_Bot/close.png";
import call from "../assets/img/Chart_Bot/call.png";
import ideaIcon from "../assets/img/Chart_Bot/idea_icon.png";
import sell from "../assets/img/Chart_Bot/sell.png";
import messageBot from "../assets/img/Chart_Bot/Message_Bot.png";
import  Chart_Bot_idea  from "../UI/ChartBot/ChartBot_idea";
import  Chart_Bot_Collab  from "../UI/ChartBot/ChartBot_coll";
import  Chart_Bot_Sell  from "../UI/ChartBot/ChartBot.sell";

import "../assets/css/chartbot.css";

export const ChartBot = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

    // 0: 메뉴, 1: 제품아이디어, 2: 콜라보, 3: 슬로건
  const [view, setView] = useState(0);

  const menuItems = [
    { id: 1, title: "제품아이디어",    icon: ideaIcon },
    { id: 2, title: "콜라보 아이디어", icon: call },
    { id: 3, title: "슬로건/마케팅문구", icon: sell },
  ];

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
                <Chart_Bot_idea onClose={() => setView(0)} />
                </div>

            </div>
          )}
          {view === 2 && (

            <div className="chartbot-subcontent">
                <div className="sub-scroll">
                <Chart_Bot_Collab onClose={() => setView(0)} />
                </div>
  
            </div>
          )}
          {view === 3 && (

            <div className="chartbot-subcontent">
                <div className="sub-scroll">
                <Chart_Bot_Sell onClose={() => setView(0)} />
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ChartBot;