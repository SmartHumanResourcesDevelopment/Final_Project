import React, { useState } from "react";
import axios from "axios";
import close from "../../assets/img/Chart_Bot/close.png";
import handshake from "../../assets/img/Chart_Bot/call.png";
import "../../assets/css/chartbot/coll.css";

export const Chart_Bot_Collab = ({ onClose }) => {
  const [collabIdeas] = useState([
    {
      id: 1,
      title: "말차 × 독서타임 유튜버",
      subtitle: "북카페 느낌 말차 패키지",
      description: "영상 배경템으로 협업 → 노출 자연스럽게",
      contrnt : "임시 작성1 글입니다."
    },
    {
      id: 2,
      title: "말차 × 감성 스터디카페",
      subtitle: "고요한 초록 한입",
      description: "포스트잇, 무드등 세트에 말차 구성해 굿즈화",
      contrnt : "임시 작성2 글입니다."
    },
    {
      id: 3,
      title: "말차 × 틱톡 챌린지",
      subtitle: "말차폼 흔들기 챌린지",
      description: "음악 + 컷 편집 + 폼 클로즈업 영상 유도",
      contrnt : "임시 작성3 글입니다."
    },
  ]);

  const handleScrap = async (collabs) => {
    console.log("==== [콜라보 API 호출됨] ====");
    console.log("콜라보 아이템:", collabs);

    try {

      console.log(localStorage.getItem("jwtToken"));

      const token = localStorage.getItem("jwtToken");
      
      if (!token) {
        console.warn("⚠ Authentication 객체가 null입니다. 로그인 상태를 확인하세요.");
        return;
      }

      const dtoList = collabs.map(collab => ({
        ideaId: collab.id,
        title: collab.title,
        contentTitle: collab.title,
        contentDesc1: collab.subtitle,
        contentDesc2: collab.description,
        contentDesc3: collab.contrnt,
      }));

        const response = await fetch("http://localhost:8095/zal/api/chatbot/collab", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(dtoList) // 전체 배열 전송
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "저장 실패");
          }

          const result = await response.json();
            alert(result.message || "저장 완료!");
            
          } catch (error) {
            console.error("스크랩 중 오류:", error);
            alert(`저장 실패: ${error.message}`);
          }

        };


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
        {collabIdeas.map((collab, i) => (
          <section key={collab.id} className="collab-section">
            <h2 className="collab-section-title">{i + 1}. {collab.title}</h2>
            <ul className="collab-content">
              <li className="collab-feature">✦ {collab.subtitle}</li>
              <li className="collab-feature">✦ {collab.description}</li> 
              <li className="collab-feature">✦ {collab.contrnt}</li> 
            </ul>
          </section>
        ))}
      </main>

      <footer className="collab-footer">
        
         {/* 스크랩 버튼 */}
        <button
          className="collab-scrap-btn"
          onClick={() => handleScrap(collabIdeas)}
        >
          스크랩하기
        </button>

      </footer>
    </div>
  );
};

export default Chart_Bot_Collab;