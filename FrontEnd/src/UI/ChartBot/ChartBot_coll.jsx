import React, { useState } from "react";
import axios from "axios";
import close from "../../assets/img/Chart_Bot/close.png";
import handshake from "../../assets/img/Chart_Bot/call.png";
import "../../assets/css/chartbot/coll.css";

export const Chart_Bot_Collab = ({ onClose, keywordData, collabIdeas }) => {
  console.log("콜라보 값 : ",collabIdeas)
  console.log("온클로즈 값 : ",onClose)
  console.log("키워드데이터 값 : ",keywordData)

  const handleScrap = async () => {
    if (!collabIdeas || collabIdeas.length === 0) {
      alert("스크랩할 아이디어가 없습니다.");
      return;
    }
    console.log("==== [콜라보 API 호출됨] ====");

    // 1. AI가 생성한 데이터를 DB 저장용 DTO 형태로 변환합니다.
  const dtoList = collabIdeas.map(idea => ({
    contentTitle: idea.title,
    // contents 배열을 별도의 필드로 변환합니다. (DB 스키마에 맞게)
    // 예시: contentDesc1, contentDesc2, contentDesc3
    contentDesc1: idea.contents[0] || "",
    contentDesc2: idea.contents[1] || "",
    contentDesc3: idea.contents[2] || "",
    // 현재 키워드 정보를 추가해줍니다.
    keywordName: keywordData?.keyword || "",
  }));

  console.log("DB로 전송할 변환된 데이터:", dtoList);

      console.log(localStorage.getItem("jwtToken"));

      const token = localStorage.getItem("jwtToken");
      
      if (!token) {
        console.warn("⚠ Authentication 객체가 null입니다. 로그인 상태를 확인하세요.");
        return;
      }

      try {
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
  
        {collabIdeas?.map((collab, i) => (
          <section key={i} className="collab-section">
          <h2 className="collab-section-title">{i + 1}. {collab.title}</h2>
            <ul className="collab-content">
              {collab.contents?.map((content, j) => (
                <li key={j} className="collab-feature">✦ {content}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="collab-footer">

         {/* 스크랩 버튼 */}
        <button
          className="collab-scrap-btn"
          onClick={handleScrap}
        >
          스크랩하기
        </button>

      </footer>
    </div>
  );
};

export default Chart_Bot_Collab;