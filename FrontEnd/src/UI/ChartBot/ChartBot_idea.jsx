import React, { useState } from "react";
import axios from "axios";
import close from "../../assets/img/Chart_Bot/close.png";
import lightOn from "../../assets/img/Chart_Bot/idea_icon.png";
import "../../assets/css/chartbot/idea.css";

export const Chart_Bot_idea = ({ onClose }) => {
  const [productIdeas] = useState([
    {
      id: 1,
      title: "말차츄 츄잇바 (MALCHU CHEW)",
      content: [
        "씹고 풀면 집중력 + 힐링",
        '공부방에서 꺼내면 "오~ 그거 뭐야?" 소리 들을템',
        '포장에 "차분한데 중독됨" 문구 붙이면 완벽',
      ],
    },
    {
      id: 2,
      title: "말차×떡볶이 디핑소스",
      content: [
        '"맵찔이 전용 구원템"',
        "크림 떡볶이+말차 조합 = 뉴트로 폭발",
        "편의점 밀키트 한정판용으로 딱",
      ],
    },
    {
      id: 3,
      title: "말차폼 탑재 보틀라떼",
      content: [
        "쉐이크하면 쫀쫀폼이 올라오는 텀블러형 말차",
        "SNS에 영상 올리기 좋은 ASMR 푸드",
        '"폼 미쳤다" 해시태그로 바이럴 유도',
      ],
    },
  ]);

  const handleScrap = async (ideas) => {

    try {

      const token = localStorage.getItem("jwtToken");

      if (!token) {
        alert("로그인 후 사용 가능합니다.");
        return;
      }

      const dtoList = ideas.map(idea => ({
        ideaId: idea.id,
        title: idea.title,
        contentTitle: idea.title,
        contentDesc1: idea.content[0],
        contentDesc2: idea.content[1],
        contentDesc3: idea.content[2],
      }));

        const response = await fetch("http://localhost:8095/zal/api/chatbot/product", {
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
    <div className="idea-container">
      <button className="idea-close" onClick={onClose} aria-label="닫기">
        <img src={close} alt="닫기" />
      </button>

      <header className="idea-header">
        <h1 className="idea-title">제품아이디어</h1>
        <img className="idea-icon" src={lightOn} alt="아이디어 아이콘" />
      </header>

      <main className="idea-main">
        {productIdeas.map((idea, i) => (
          <section key={idea.id} className="idea-section">
            <h2 className="idea-section-title">{i + 1}. {idea.title}</h2>
            <ul className="idea-content">
              {idea.content.map((f, j) => (
                <li key={j} className="idea-feature">✦ {f}</li>
              ))}
            </ul>
          </section>
        ))}
      </main>

      <footer className="idea-footer">

        {/* 스크랩 버튼 */}
        <button
          className="idea-scrap-btn"
          onClick={() => handleScrap(productIdeas)}
        >
          스크랩하기
        </button>


      </footer>
    </div>
  );
};
export default Chart_Bot_idea
