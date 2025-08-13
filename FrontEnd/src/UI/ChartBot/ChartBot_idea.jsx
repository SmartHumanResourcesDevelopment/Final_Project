import React, { useState, useEffect } from "react";
import close from "../../assets/img/Chart_Bot/close.png";
import lightOn from "../../assets/img/Chart_Bot/idea_icon.png";
import "../../assets/css/chartbot/idea.css";

// 부모로부터 keywordData를 props로 받도록 추가합니다.
export const Chart_Bot_idea = ({ onClose, keywordData }) => {
  // 1. 더미 데이터 대신, API 응답을 저장할 state를 만듭니다.
  const [productIdeas, setProductIdeas] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. 컴포넌트가 렌더링될 때 AI 아이디어를 요청하는 로직을 추가합니다.
  useEffect(() => {
    const fetchProductIdeasFromAI = async () => {
      // keywordData가 없으면 실행하지 않습니다.
      if (!keywordData?.keyword) return;

      setIsLoading(true);
      console.log(`'${keywordData.keyword}'로 AI 제품 아이디어를 요청합니다.`);

      try {
        // 백엔드의 제품 아이디어 생성 API를 호출합니다.
        const response = await fetch("http://localhost:8095/zal/api/chatbot/product/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: keywordData.keyword }),
        });

        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`);
        }

        const generatedIdeas = await response.json();
        setProductIdeas(generatedIdeas);
        console.log("✅ AI 제품 아이디어 수신:", generatedIdeas);

      } catch (error) {
        console.error("❌ 제품 아이디어 요청 실패:", error);
        setProductIdeas([
          { title: "오류 발생!", contents: ["아이디어를 불러오는 데 실패했습니다.", error.message] }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductIdeasFromAI();
  }, [keywordData]); // keywordData가 변경될 때마다 다시 실행됩니다.

  const handleScrap = async () => {
    if (!productIdeas || productIdeas.length === 0) {
      alert("스크랩할 아이디어가 없습니다.");
      return;
    }

    // 3. 스크랩 시 keywordName을 포함하도록 수정합니다.
    const dtoList = productIdeas.map(idea => ({
      contentTitle: idea.title,
      contentDesc1: idea.contents[0] || "",
      contentDesc2: idea.contents[1] || "",
      contentDesc3: idea.contents[2] || "",
      keywordName: keywordData?.keyword || "", // 키워드 정보 추가
    }));

    console.log("DB로 전송할 제품 아이디어 데이터:", dtoList);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8095/zal/api/chatbot/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dtoList)
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
        {/* 4. 로딩 중일 때와 데이터가 있을 때를 구분하여 표시합니다. */}
        {isLoading ? (
          <div className="loading-message">AI가 제품 아이디어를 구상 중입니다...</div>
        ) : (
          productIdeas?.map((idea, i) => (
            <section key={i} className="idea-section">
              <h2 className="idea-section-title">{i + 1}. {idea.title}</h2>
              <ul className="idea-content">
                {idea.contents?.map((content, j) => (
                  <li key={j} className="idea-feature">✦ {content}</li>
                ))}
              </ul>
            </section>
          ))
        )}
      </main>

      <footer className="idea-footer">
        <button className="idea-scrap-btn" onClick={handleScrap}>
          스크랩하기
        </button>
      </footer>
    </div>
  );
};

export default Chart_Bot_idea;
