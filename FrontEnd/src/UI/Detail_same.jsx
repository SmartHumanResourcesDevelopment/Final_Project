import React from "react";
import ellipse172 from "./ellipse-17-2.svg";
import ellipse173 from "./ellipse-17-3.svg";
import ellipse174 from "./ellipse-17-4.svg";
import ellipse175 from "./ellipse-17-5.svg";
import ellipse17 from "./ellipse-17.svg";

export const TrendAnalysisSection = () => {
  const trendData = [
    {
      id: 1,
      percentage: "92%",
      label: "쑥",
      color: "#f89c2f",
      size: "large",
      position: { top: "67px", left: "141px" },
      dimensions: { width: "221px", height: "224px" },
      circleSize: { width: "211px", height: "211px" },
      textPosition: {
        percentageTop: "79px",
        percentageLeft: "75px",
        labelTop: "131px",
        labelLeft: "97px",
      },
      fontSize: { percentage: "33.7px", label: "24px" },
      fontWeight: { percentage: "font-normal", label: "font-bold" },
      image: ellipse173,
    },
    {
      id: 2,
      percentage: "55%",
      label: "흑임자",
      color: "#2fbede",
      size: "medium",
      position: { top: "147px", left: "0px" },
      dimensions: { width: "162px", height: "162px" },
      circleSize: { width: "153px", height: "153px" },
      textPosition: {
        percentageTop: "54px",
        percentageLeft: "54px",
        labelTop: "94px",
        labelLeft: "62px",
      },
      fontSize: { percentage: "24px", label: "12px" },
      fontWeight: { percentage: "font-normal", label: "font-bold" },
      image: ellipse174,
    },
    {
      id: 3,
      percentage: "25%",
      label: "약과",
      color: "#6463d6",
      size: "small",
      position: { top: "19px", left: "23px" },
      dimensions: { width: "138px", height: "138px" },
      circleSize: { width: "130px", height: "130px" },
      textPosition: {
        percentageTop: "47px",
        percentageLeft: "46px",
        labelTop: "83px",
        labelLeft: "50px",
      },
      fontSize: { percentage: "20.8px", label: "12px" },
      fontWeight: { percentage: "font-normal", label: "font-normal" },
      image: ellipse175,
    },
    {
      id: 4,
      percentage: "15%",
      label: "그래놀라",
      color: "#f85a5c",
      size: "small",
      position: { top: "263px", left: "119px" },
      dimensions: { width: "101px", height: "105px" },
      circleSize: { width: "98px", height: "98px" },
      textPosition: {
        percentageTop: "28px",
        percentageLeft: "30px",
        labelTop: "64px",
        labelLeft: "28px",
      },
      fontSize: { percentage: "20.8px", label: "12px" },
      fontWeight: { percentage: "font-normal", label: "font-normal" },
      image: ellipse17,
    },
    {
      id: 5,
      percentage: "13%",
      label: "젤라또",
      color: "#4ad443",
      size: "small",
      position: { top: "0px", left: "154px" },
      dimensions: { width: "93px", height: "96px" },
      circleSize: { width: "90px", height: "90px" },
      textPosition: {
        percentageTop: "27px",
        percentageLeft: "28px",
        labelTop: "60px",
        labelLeft: "25px",
      },
      fontSize: { percentage: "20.8px", label: "12px" },
      fontWeight: { percentage: "font-normal", label: "font-normal" },
      image: ellipse172,
    },
  ];

  return (
    <section
      className="absolute w-[1260px] h-[556px] top-[3176px] left-[100px] bg-white rounded-[30px] shadow-[0px_4px_10px_2px_#00000040]"
      role="region"
      aria-labelledby="trend-analysis-title"
    >
      <h2 id="trend-analysis-title" className="sr-only">
        트렌드 분석 섹션
      </h2>

      <p className="absolute w-[649px] top-[200px] left-[542px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-[22px] tracking-[0.50px] leading-10">
        말차를 좋아하는 잘파세대는 &#39;쑥, 흑임자, 약과, 그래놀라&#39; 등
        전통적이면서도 건강한 이미지를 가진 재료에도 관심을 보입니다. 이들
        키워드를 활용하여 확장된 마케팅 전략을 고려해볼 수 있습니다.
      </p>

      <div
        className="absolute w-[358px] h-[368px] top-32 left-[106px]"
        role="img"
        aria-label="트렌드 분석 버블 차트"
      >
        <div className="relative w-[362px] h-[368px]">
          {trendData.map((item) => (
            <div
              key={item.id}
              className="absolute"
              style={{
                width: item.dimensions.width,
                height: item.dimensions.height,
                top: item.position.top,
                left: item.position.left,
              }}
              role="img"
              aria-label={`${item.label} ${item.percentage}`}
            >
              <div className="relative w-full h-full">
                <div
                  className="absolute rounded-full opacity-80"
                  style={{
                    width: item.circleSize.width,
                    height: item.circleSize.height,
                    backgroundColor: item.color,
                    top:
                      item.id === 2
                        ? "6px"
                        : item.id === 3
                          ? "4px"
                          : item.id === 4
                            ? "4px"
                            : item.id === 5
                              ? "4px"
                              : "8px",
                    left:
                      item.id === 2
                        ? "0px"
                        : item.id === 3
                          ? "0px"
                          : item.id === 4
                            ? "0px"
                            : item.id === 5
                              ? "0px"
                              : "0px",
                  }}
                />

                <div
                  className={`absolute [font-family:'Poppins-Regular',Helvetica] ${item.fontWeight.percentage} text-white whitespace-nowrap`}
                  style={{
                    fontSize: item.fontSize.percentage,
                    top: item.textPosition.percentageTop,
                    left: item.textPosition.percentageLeft,
                    lineHeight: item.fontSize.percentage,
                    letterSpacing:
                      item.id === 1
                        ? "0.53px"
                        : item.id === 2
                          ? "0.38px"
                          : "0.32px",
                  }}
                >
                  {item.percentage}
                </div>

                <div
                  className={`absolute [font-family:'Poppins-${item.fontWeight.label === "font-bold" ? "Bold" : "Regular"}',Helvetica] ${item.fontWeight.label} text-white whitespace-nowrap`}
                  style={{
                    fontSize: item.fontSize.label,
                    top: item.textPosition.labelTop,
                    left: item.textPosition.labelLeft,
                    lineHeight:
                      item.id === 1
                        ? "12.7px"
                        : item.id === 2
                          ? "12px"
                          : "7.8px",
                    letterSpacing:
                      item.id === 1
                        ? "0.53px"
                        : item.id === 2
                          ? "0.38px"
                          : "0.32px",
                  }}
                >
                  {item.label}
                </div>

                <img
                  className="absolute top-0"
                  style={{
                    width:
                      item.id === 1
                        ? "212px"
                        : item.id === 2
                          ? "154px"
                          : item.id === 3
                            ? "130px"
                            : item.id === 4
                              ? "99px"
                              : "91px",
                    height:
                      item.id === 1
                        ? "226px"
                        : item.id === 2
                          ? "164px"
                          : item.id === 3
                            ? "139px"
                            : item.id === 4
                              ? "106px"
                              : "98px",
                    left:
                      item.id === 1
                        ? "6px"
                        : item.id === 2
                          ? "20px"
                          : item.id === 3
                            ? "4px"
                            : item.id === 4
                              ? "3px"
                              : "2px",
                  }}
                  alt=""
                  src={item.image}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default TrendAnalysisSection;