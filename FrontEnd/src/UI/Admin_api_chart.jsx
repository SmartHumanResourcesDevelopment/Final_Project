import React from "react";

export const ApiStatusTableSection = () => {
  const apiStatusData = [
    {
      type: "크롤링",
      status: "🟢 운영중",
      date: "2025.07.11",
    },
    {
      type: "Open AI",
      status: "🔴 중지",
      date: "2025.07.11",
    },
    {
      type: "DB",
      status: "🟢 운영중",
      date: "2025.07.11",
    },
  ];

  return (
    <div className="flex-col w-[1200px] absolute top-[172px] left-[185px] flex items-start">
      <table
        className="w-full bg-white rounded overflow-hidden border border-solid border-[#b9b9b9]"
        role="table"
        aria-label="API 상태 테이블"
      >
        <thead>
          <tr className="bg-[#0000000f]">
            <th
              className="px-3 py-2.5 border-t [border-top-style:solid] border-l [border-left-style:solid] border-[#b9b9b9] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-black text-xl text-center tracking-[0] leading-[26.0px]"
              scope="col"
            >
              종류
            </th>
            <th
              className="px-3 py-2.5 border-t [border-top-style:solid] border-l [border-left-style:solid] border-[#b9b9b9] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-black text-xl text-center tracking-[0] leading-[26.0px]"
              scope="col"
            >
              상태
            </th>
            <th
              className="w-[438.67px] px-3 py-2.5 border-t [border-top-style:solid] border-l [border-left-style:solid] border-[#b9b9b9] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-black text-xl text-center tracking-[0] leading-[26.0px]"
              scope="col"
            >
              날짜
            </th>
          </tr>
        </thead>
        <tbody>
          {apiStatusData.map((item, index) => (
            <tr key={index} className="bg-[#ffffff01]">
              <td className="px-3 py-2.5 border-t [border-top-style:solid] border-l [border-left-style:solid] border-[#b9b9b9] [font-family:'Inter-Regular',Helvetica] font-normal text-black text-xl text-center tracking-[0] leading-[26.0px]">
                {item.type}
              </td>
              <td className="px-3 py-2.5 border-t [border-top-style:solid] border-l [border-left-style:solid] border-[#b9b9b9] [font-family:'Inter-Regular',Helvetica] font-normal text-black text-xl text-center tracking-[0] leading-[26.0px]">
                {item.status}
              </td>
              <td className="w-[438.67px] px-3 py-2.5 border-t [border-top-style:solid] border-l [border-left-style:solid] border-[#b9b9b9] [font-family:'Inter-Regular',Helvetica] font-normal text-black text-xl text-center tracking-[0] leading-[26.0px]">
                {item.date}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default ApiStatusTableSection;