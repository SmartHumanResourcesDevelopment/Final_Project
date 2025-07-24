import React, { useState } from "react";
import close from "../../assets/img/Chart_Bot/close.png";
import handshake from "../../assets/img/Chart_Bot/call.png";
import "../../assets/css/chartbot/coll.css";

export const Chart_Bot_Collab = ({ onClose }) => {
  const collaborationItems = [
    {
      id: 1,
      title: "말차 × 독서타임 유튜버",
      subtitle: "북카페 느낌 말차 패키지",
      description: "영상 배경템으로 협업 → 노출 자연스럽게",
    },
    {
      id: 2,
      title: "말차 × 감성 스터디카페",
      subtitle: "고요한 초록 한입",
      description: "포스트잇, 무드등 세트에 말차 구성해 굿즈화",
    },
    {
      id: 3,
      title: "말차 × 틱톡 챌린지",
      subtitle: "말차폼 흔들기 챌린지",
      description: "음악 + 컷 편집 + 폼 클로즈업 영상 유도",
    },
  ];

  const handleScrap = () => console.log("스크랩하기 clicked");

  return (
    <div className="collab-container">
      <button className="collab-close" onClick={onClose} aria-label="닫기">
        <img src={close} alt="닫기" />
      </button>

      <header className="collab-header">
        <h1 className="collab-title">콜라보레이션</h1>
        <img className="collab-icon" src={handshake} alt="Handshake" />
      </header>

      <main className="collab-main">
        {collaborationItems.map((item, idx) => (
          <section key={item.id} className="collab-section">
            <h2 className="collab-section-title">
              {item.id}. {item.title}
            </h2>
            <p className="collab-subtitle">✦ “{item.subtitle}”</p>
            <p className="collab-desc">✦ {item.description}</p>
          </section>
        ))}
      </main>

      <footer className="collab-footer">
        <button className="collab-scrap-btn" onClick={handleScrap}>
          스크랩하기
        </button>
      </footer>
    </div>
  );
};

export default Chart_Bot_Collab;