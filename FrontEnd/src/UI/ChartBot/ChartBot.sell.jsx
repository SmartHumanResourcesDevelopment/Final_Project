import React, { useState, useEffect } from "react";
import close from "../../assets/img/Chart_Bot/close.png";
import flag from "../../assets/img/Chart_Bot/sell.png";
import LoadingMessage from "../../components/LoadingMessage";
import "../../assets/css/chartbot/sell.css";

// 부모로부터 keywordData를 props로 받도록 추가합니다.
export const Chart_Bot_Sell = ({ onClose, keywordData }) => {
  // 1. 더미 데이터 대신, API 응답을 저장할 state를 만듭니다.
  const [slogans, setSlogans] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 2. 컴포넌트가 렌더링될 때 AI 슬로건을 요청하는 로직을 추가합니다.
  useEffect(() => {
    const fetchSlogansFromAI = async () => {
      if (!keywordData?.keyword) return;

      setIsLoading(true);
      console.log(`'${keywordData.keyword}'로 AI 슬로건을 요청합니다.`);

      try {
        // 백엔드의 슬로건 생성 API를 호출합니다.
        const response = await fetch("http://localhost:8095/zal/api/chatbot/slogan/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keyword: keywordData.keyword }),
        });

        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`);
        }

        const generatedSlogans = await response.json();
        setSlogans(generatedSlogans);
        console.log("✅ AI 슬로건 수신:", generatedSlogans);

      } catch (error) {
        console.error("❌ 슬로건 요청 실패:", error);
        setSlogans([
          { title: "오류 발생!", contents: ["슬로건을 불러오는 데 실패했습니다.", error.message] }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlogansFromAI();
  }, [keywordData]);

  const handleScrap = async () => {
    if (!slogans || slogans.length === 0) {
      alert("스크랩할 슬로건이 없습니다.");
      return;
    }

    // 3. 스크랩 시 keywordName을 포함하도록 수정합니다.
    const dtoList = slogans.map(slogan => ({
      contentTitle: slogan.title,
      contentDesc1: slogan.contents[0] || "",
      contentDesc2: slogan.contents[1] || "",
      contentDesc3: slogan.contents[2] || "",
      keywordName: keywordData?.keyword || "", // 키워드 정보 추가
    }));

    console.log("DB로 전송할 슬로건 데이터:", dtoList);

    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8095/zal/api/chatbot/slogan", {
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
    <div className="sell-container">
      <button className="sell-close" onClick={onClose} aria-label="닫기">
        <img src={close} alt="닫기" />
      </button>

      <header className="sell-header">
        <h1 className="sell-title">슬로건/마케팅문구</h1>
        <img className="sell-icon" src={flag} alt="Flag" />
      </header>

      <main className="sell-main">
        {/* 4. 로딩 중일 때와 데이터가 있을 때를 구분하여 표시합니다. */}
        {isLoading ? (
          <div style={{ color: '#ffffff' }}>
            <LoadingMessage
              message="AI가 마케팅 문구를 작성 중입니다"
              type="pulse"
              showIcon={true}
              textColor="#ffffff"
            />
          </div>
        ) : (
          slogans?.map((slogan, i) => (
            <section key={i} className="sell-section">
              <h2 className="sell-section-title">{i + 1}. {slogan.title}</h2>
              <ul className="sell-content">
                {slogan.contents?.map((content, j) => (
                  <li key={j} className="sell-feature">✦ {content}</li>
                ))}
              </ul>
            </section>
          ))
        )}
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
