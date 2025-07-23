import React from "react";
import line8 from "../assets/im/admin/line-8.svg";
import rectangle6 from "../assets/im/admin/rectangle-6.svg";
import rectangle7 from "../assets/im/admin/rectangle-7.svg";
import rectangle8 from "../assets/im/admin/rectangle-8.svg";
import rectangle9 from "../assets/im/admin/rectangle-9.svg";
import rectangle10 from "../assets/im/admin/rectangle-10.svg";
import rectangle105 from "../assets/im/admin/rectangle-105.svg";
import rectangle106 from "../assets/im/admin/rectangle-106.svg";
import rectangle107 from "../assets/im/admin/rectangle-107.svg";

export const DataVisualizationSection = () => {
  const chartData = [
    {
      date: "7/4",
      width: 237,
      height: 41,
      top: 42,
      textTop: 15,
      textLeft: -2.5,
      rectWidth: 41,
      rectHeight: 175,
      rectTop: -67,
      rectLeft: 127,
      image: rectangle105,
    },
    {
      date: "7/5",
      width: 319,
      height: 42,
      top: 188,
      textTop: 15,
      textLeft: -2.5,
      rectWidth: 42,
      rectHeight: 257,
      rectTop: -108,
      rectLeft: 168,
      image: rectangle106,
    },
    {
      date: "7/6",
      width: 337,
      height: 42,
      top: 333,
      textTop: 16,
      textLeft: -2.5,
      rectWidth: 42,
      rectHeight: 275,
      rectTop: -116,
      rectLeft: 176,
      image: rectangle107,
    },
    {
      date: "7/7",
      width: 218,
      height: 42,
      top: 479,
      textTop: 16,
      textLeft: -2.5,
      rectWidth: 42,
      rectHeight: 156,
      rectTop: -57,
      rectLeft: 117,
      image: rectangle6,
    },
    {
      date: "7/8",
      width: 302,
      height: 41,
      top: 641,
      textTop: 16,
      textLeft: -2.5,
      rectWidth: 41,
      rectHeight: 240,
      rectTop: -100,
      rectLeft: 160,
      image: rectangle7,
    },
    {
      date: "7/9",
      width: 184,
      height: 41,
      top: 787,
      textTop: 16,
      textLeft: -2.5,
      rectWidth: 41,
      rectHeight: 122,
      rectTop: -40,
      rectLeft: 100,
      image: rectangle8,
    },
    {
      date: "7/10",
      width: 389,
      height: 42,
      top: 932,
      textTop: 16,
      textLeft: -13,
      rectWidth: 42,
      rectHeight: 327,
      rectTop: -142,
      rectLeft: 202,
      image: rectangle9,
    },
    {
      date: "7/11",
      width: 184,
      height: 42,
      top: 1078,
      textTop: 15,
      textLeft: -2.5,
      rectWidth: 42,
      rectHeight: 122,
      rectTop: -40,
      rectLeft: 100,
      image: rectangle10,
    },
  ];

  return (
    <div className="absolute w-[387px] h-[1198px] top-16 left-[528px] -rotate-90">
      <img
        className="top-[598px] left-[-539px] rotate-90 absolute w-[1198px] h-px"
        alt="Line"
        src={line8}
      />

      {chartData.map((item, index) => (
        <div
          key={index}
          className="absolute"
          style={{
            width: `${item.width}px`,
            height: `${item.height}px`,
            top: `${item.top}px`,
            left: "0px",
          }}
        >
          <div
            className="absolute rotate-90 [font-family:'Poppins-Regular',Helvetica] font-normal text-[#737b8b] text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap"
            style={{
              top: `${item.textTop}px`,
              left: `${item.textLeft}px`,
            }}
          >
            {item.date}
          </div>

          <img
            className="absolute rotate-90"
            style={{
              width: `${item.rectWidth}px`,
              height: `${item.rectHeight}px`,
              top: `${item.rectTop}px`,
              left: `${item.rectLeft}px`,
            }}
            alt="Rectangle"
            src={item.image}
          />
        </div>
      ))}
    </div>
  );
};
export default DataVisualizationSection;