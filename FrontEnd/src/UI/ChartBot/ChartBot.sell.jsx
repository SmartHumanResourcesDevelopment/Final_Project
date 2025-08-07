import React from "react";
import close from "../../assets/img/Chart_Bot/close.png";
import flag from "../../assets/img/Chart_Bot/sell.png";
import "../../assets/css/chartbot/sell.css";

export const Chart_Bot_Sell = ({ onClose }) => {
  const sloganData = [
    {
      id: 1,
      title: '"말차니까, 말 안해도 알지"',
      concepts: [
        "나를 알아주는 브랜드처럼 다가가는 컨셉",
        "이모지 💚나 말풍선으로 감성 살리면 굿",
      ],
    },
    {
      id: 2,
      title: '"찐-초록의 힐링각"',
      concepts: [
        '"찐" + 감성 + 줄임말 = Z세대 언어 완성',
        "유튜브 썸네일형 배너에도 어울림",
      ],
    },
    {
      id: 3,
      title: '"오늘 좀 말차고 싶은 날이야"',
      concepts: [
        "감정 공감 → 소비로 이어지는 연결고리",
        '"카페 대신 말차" 느낌',
      ],
    },
  ];

  const handleScrap = () => console.log("스크랩하기 clicked");

  return (
    <div className="sell-container">
      <button className="sell-close" onClick={onClose} aria-label="닫기">
        <img src={close} alt="닫기" />
      </button>

      <header className="sell-header">
        <h1 className="sell-title">슬로건/마케팅문구</h1>
        <img className="sell-icon" src={flag} alt="Flag" />
      </header>

      <main className="sell-main">
        {sloganData.map((item) => (
          <section key={item.id} className="sell-section">
            <h2 className="sell-section-title">
              {item.id}. {item.title}
            </h2>
            <ul className="sell-concepts">
              {item.concepts.map((c, i) => (
                <li key={i} className="sell-concept">✦ {c}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="sell-footer">
        <button className="sell-scrap-btn" onClick={handleScrap}>
          스크랩하기
        </button>                                          
      </footer>
    </div>
  );
};


export default Chart_Bot_Sell;