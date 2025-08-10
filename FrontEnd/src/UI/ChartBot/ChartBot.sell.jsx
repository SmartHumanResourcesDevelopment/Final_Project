import React, { useState } from "react";
import close from "../../assets/img/Chart_Bot/close.png";
import flag from "../../assets/img/Chart_Bot/sell.png";
import "../../assets/css/chartbot/sell.css";

export const Chart_Bot_Sell = ({ onClose }) => {
  const [slogans] = useState( [
    {
      id: 1,
      title: '"말차니까, 말 안해도 알지"',
      concepts: [
        "나를 알아주는 브랜드처럼 다가가는 컨셉",
        "이모지 💚나 말풍선으로 감성 살리면 굿",
        "임시 작성1 글입니다."
      ],
    },
    {
      id: 2,
      title: '"찐-초록의 힐링각"',
      concepts: [
        '"찐" + 감성 + 줄임말 = Z세대 언어 완성',
        "유튜브 썸네일형 배너에도 어울림",
        "임시 작성2 글입니다."
      ],
    },
    {
      id: 3,
      title: '"오늘 좀 말차고 싶은 날이야"',
      concepts: [
        "감정 공감 → 소비로 이어지는 연결고리",
        '"카페 대신 말차" 느낌',
        "임시 작성3 글입니다."
      ],
    },
  ]);

   const handleScrap = async (slogans) => {
    console.log("==== [마케팅 슬로건 API 호출됨] ====");
    console.log("마케팅 슬로건:", slogans);

    try {

      console.log(localStorage.getItem("jwtToken"));

      const token = localStorage.getItem("jwtToken");
      
      if (!token) {
        console.warn("⚠ Authentication 객체가 null입니다. 로그인 상태를 확인하세요.");
        return;
      }

      const dtoList = slogans.map(slogan => ({
        sloganId: slogan.id,
        title: slogan.title,
        contentTitle: slogan.title,
        contentDesc1: slogan.concepts[0],
        contentDesc2: slogan.concepts[1],
        contentDesc3: slogan.concepts[2],
      }));

        const response = await fetch("http://localhost:8095/zal/api/chatbot/slogan", {
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
    <div className="sell-container">
      <button className="sell-close" onClick={onClose} aria-label="닫기">
        <img src={close} alt="닫기" />
      </button>

      <header className="sell-header">
        <h1 className="sell-title">슬로건/마케팅문구</h1>
        <img className="sell-icon" src={flag} alt="Flag" />
      </header>

      <main className="sell-main">
        {slogans.map((sell, i) => (
          <section key={sell.id} className="sell-section">
            <h2 className="sell-section-title">{i + 1}. {sell.title}</h2>
            <ul className="sell-content">
              {sell.concepts.map((f, j) => ( 
                <li key={j} className="sell-feature">✦ {f}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="sell-footer">
        <button className="sell-scrap-btn" onClick={() => handleScrap(slogans)}>
          스크랩하기
        </button>


      </footer>
    </div>
  );
};


export default Chart_Bot_Sell;