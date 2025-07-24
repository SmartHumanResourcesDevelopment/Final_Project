import React from "react";
import { ApiStatusTableSection } from "../UI/Admin_api_chart";
import { DataVisualizationSection } from "../UI/Admin_bar_chart";
import { AdminNavigationBarSection } from "../common/Admin_menu_bar";
// import image from "../assets/imgs/image.svg";
import line2 from "../assets/img/admin/line.png";
import line3 from "../assets/img/admin/line.png";
import line4 from "../assets/img/admin/line.png";
import line5 from "../assets/img/admin/line.png";
import line6 from "../assets/img/admin/line.png";
import line7 from "../assets/img/admin/line.png";
import line from "../assets/img/admin/line.png";

export const Admin = () => {
  const chartDataPoints = [
    { value: "15,000건", top: "598px", left: "148px" },
    { value: "17,000건", top: "520px", left: "293px" },
    { value: "17,200건", top: "500px", left: "439px" },
    { value: "15,000건", top: "532px", left: "746px" },
    { value: "18, 500건", top: "448px", left: "1034px" },
    { value: "13,000건", top: "617px", left: "588px" },
    { value: "12,050건", top: "655px", left: "893px" },
    { value: "11,050건", top: "656px", left: "1192px" },
  ];

  const lineImages = [
    { src: line, top: "726px", left: "122px" },
    { src: line, top: "610px", left: "123px" },
    { src: line2, top: "500px", left: "124px" },
    { src: line3, top: "686px", left: "122px" },
    { src: line4, top: "570px", left: "123px" },
    { src: line5, top: "766px", left: "122px" },
    { src: line6, top: "650px", left: "123px" },
    { src: line7, top: "540px", left: "124px" },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1440px] h-[960px]">
        <div className="relative h-[912px]">
          <div className="top-[283px] [font-family:'Poppins-Black',Helvetica] font-black text-black text-2xl leading-[22px] absolute left-[50px] tracking-[0.50px] whitespace-nowrap">
            {""}
          </div>

          <div className="absolute w-[1388px] h-[507px] top-[405px] left-[26px] bg-white shadow-[1px_1px_1px_2px_#0000001a]" />

          <p className="top-[428px] [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-[#1f384c] text-lg leading-[23px] absolute left-[50px] tracking-[0.50px] whitespace-nowrap">
            최근 크롤링 된 키워드 현황
          </p>

          <p className="top-[428px] left-[1187px] [font-family:'Poppins-Medium',Helvetica] absolute font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px] whitespace-nowrap">
            집계 기간: 최근 1주일 자료
          </p>

          <div className="absolute w-[1388px] h-[226px] top-[148px] left-[26px] bg-white shadow-[1px_1px_1px_2px_#0000001a]" />

          <div className="top-[171px] left-[50px] [font-family:'Noto_Sans_KR-Medium',Helvetica] absolute font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px] whitespace-nowrap">
            API 가동 현황
          </div>

          <ApiStatusTableSection />

          {lineImages.map((lineImg, index) => (
            <img
              key={index}
              className={`absolute w-[1198px] h-px object-cover`}
              style={{ top: lineImg.top, left: lineImg.left }}
              alt="Line"
              src={lineImg.src}
            />
          ))}

          <DataVisualizationSection />

          {chartDataPoints.map((dataPoint, index) => (
            <div
              key={index}
              className="absolute [font-family:'Poppins-Regular',Helvetica] font-normal text-[#737b8b] text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap"
              style={{ top: dataPoint.top, left: dataPoint.left }}
            >
              {dataPoint.value}
            </div>
          ))}

          <AdminNavigationBarSection />
        </div>
      </div>
    </div>
  );
};
export default Admin;