import React from "react";

// 컴포넌트 이름과 파일 이름을 Admin_api_chart로 맞추는 것이 좋습니다.
// 만약 파일 이름이 ApiStatusTableSection.jsx 라면 export const ApiStatusTableSection = () => { ... }; 로 유지하세요.
export const Admin_api_chart = () => { // 컴포넌트 이름을 Admin_api_chart로 변경 (선택 사항, 파일명과 맞추는 게 좋음)


  const today = new Date();

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };



  const apiStatusData = [
    { type: "크롤링", status: "🟢 운영중", date: formatDate(today) },
    { type: "Open AI", status: "🔴 중지", date: formatDate(today)},
    { type: "DB", status: "🟢 운영중", date: formatDate(today)},
  ];

  return (
    
    <div className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-10">
      <h2 className="[font-family:'Noto_Sans_KR-blod',Helvetica] font-bold text-[#1f384c] text-lg tracking-[0.50px] leading-[23px] whitespace-nowrap mb-4">
        API 가동 현황
      </h2>
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