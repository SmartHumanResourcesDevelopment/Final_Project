import React from "react";
import group494 from "./group-494.png";

export const InsightsSection = () => {
  const dateLabels = [
    { text: "07/11", left: 0, width: 65 },
    { text: "07/12", left: 151, width: 55 },
    { text: "07/13", left: 292, width: 57 },
    { text: "07/14", left: 435, width: 63 },
    { text: "06/26", left: 585, width: 65 },
    { text: "06/26", left: 736, width: 65 },
    { text: "06/27", left: 887, width: 63 },
  ];

  return (
    <section
      className="absolute w-[1161px] h-[523px] top-0 left-[59px]"
      role="region"
      aria-label="Insights Chart"
    >
      <div className="absolute w-[1014px] h-[523px] top-0 left-0">
        <div
          className="absolute w-[964px] h-[19px] top-[479px] left-[46px]"
          role="group"
          aria-label="Chart date labels"
        >
          {dateLabels.map((date, index) => (
            <div
              key={index}
              className={`absolute top-0 [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-[11px] text-center tracking-[0.50px] leading-[11px]`}
              style={{
                width: `${date.width}px`,
                left: `${date.left}px`,
              }}
            >
              {date.text}
            </div>
          ))}
        </div>

        <img
          className="absolute w-[1014px] h-[523px] top-0 left-0"
          alt="Analytics chart showing data trends over time"
          src={group494}
        />
      </div>

      <div
        className="absolute w-[73px] h-4 top-[106px] left-[1090px]"
        role="group"
        aria-label="Chart legend"
      >
        <div
          className="absolute w-4 h-4 top-0 left-0 bg-[#ff0000] rounded-[7.89px]"
          role="img"
          aria-label="Red indicator"
        />

        <div className="absolute w-[42px] top-px left-[30px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-[#121212] text-xs tracking-[0.50px] leading-3 whitespace-nowrap">
          탕후루
        </div>
      </div>
    </section>
  );
};
export default InsightsSection;