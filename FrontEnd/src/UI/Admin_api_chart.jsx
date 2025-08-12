import React, { useState, useEffect } from "react";

export const Admin_api_chart = () => {
  const [apiStatuses, setApiStatuses] = useState({
    crawling: "🔴 중지됨",
    openai: "🟡 확인중...",
    db: "🟢 운영중"
  });

  const today = new Date();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  // OpenAI API 상태 체크 함수
  const checkOpenAIStatus = async () => {
    try {
      console.log("🔍 OpenAI API 상태 체크 시작");

      // 백엔드의 OpenAI 테스트 엔드포인트 호출
      const response = await fetch('/zal/api/admin/openai-status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ OpenAI API 상태 체크 성공:", result);

        setApiStatuses(prev => ({
          ...prev,
          openai: result.status === 'success' ? "🟢 운영중" : "🔴 중지됨"
        }));
      } else {
        console.error("❌ OpenAI API 상태 체크 실패:", response.status);
        setApiStatuses(prev => ({
          ...prev,
          openai: "🔴 중지됨"
        }));
      }
    } catch (error) {
      console.error("❌ OpenAI API 상태 체크 오류:", error);
      setApiStatuses(prev => ({
        ...prev,
        openai: "🔴 중지됨"
      }));
    }
  };

  // 컴포넌트 마운트 시 OpenAI 상태 체크
  useEffect(() => {
    checkOpenAIStatus();

    // 5분마다 상태 체크
    const interval = setInterval(checkOpenAIStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const apiStatusData = [
    { type: "크롤링", status: apiStatuses.crawling, date: formatDate(today) },
    { type: "Open AI", status: apiStatuses.openai, date: formatDate(today)},
    { type: "DB", status: apiStatuses.db, date: formatDate(today)},
  ];

  return (
    
    <div className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="[font-family:'Noto_Sans_KR-blod',Helvetica] font-bold text-[#1f384c] text-lg tracking-[0.50px] leading-[23px] whitespace-nowrap">
          API 가동 현황
        </h2>
        <button
          onClick={checkOpenAIStatus}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={apiStatuses.openai === "🟡 확인중..."}
        >
          {apiStatuses.openai === "🟡 확인중..." ? "확인중..." : "상태 새로고침"}
        </button>
      </div>
      <table
        className="w-full bg-white rounded overflow-hidden border border-solid border-[#b9b9b9]"
        role="table"
        aria-label="API 상태 테이블"
      >
        <thead>
          <tr className="bg-[#0000000f]">
            <th className="px-3 py-2.5 border-t border-l border-[#b9b9b9] font-semibold text-black text-xl text-center tracking-[0] leading-[26.0px]">
              종류
            </th>
            <th className="px-3 py-2.5 border-t border-l border-[#b9b9b9] font-semibold text-black text-xl text-center tracking-[0] leading-[26.0px]">
              상태
            </th>
            <th className="px-3 py-2.5 border-t border-l border-[#b9b9b9] font-semibold text-black text-xl text-center tracking-[0] leading-[26.0px]">
              날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {apiStatusData.map((item, index) => (
            <tr key={index} className="bg-[#ffffff01]">
              <td className="px-3 py-2.5 border-t border-l border-[#b9b9b9] font-normal text-black text-xl text-center tracking-[0] leading-[26.0px]">
                {item.type}
              </td>
              <td className="px-3 py-2.5 border-t border-l border-[#b9b9b9] font-normal text-black text-xl text-center tracking-[0] leading-[26.0px]">
                {item.status}
              </td>
              <td className="w-[438.67px] px-3 py-2.5 border-t border-l border-[#b9b9b9] font-normal text-black text-xl text-center tracking-[0] leading-[26.0px]">
                {item.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default Admin_api_chart; // default export도 컴포넌트 이름과 동일하게