import React from "react";
import image from "./image.svg";
import line2 from "./line-2.svg";
import line3 from "./line-3.svg";
import line4 from "./line-4.svg";
import line5 from "./line-5.svg";
import line6 from "./line-6.svg";
import line7 from "./line-7.svg";
import line8 from "./line-8.svg";
import line from "./line.svg";
import rectangle62 from "./rectangle-6-2.svg";
import rectangle6 from "./rectangle-6.svg";
import rectangle7 from "./rectangle-7.svg";
import rectangle105 from "./rectangle-105.svg";
import rectangle106 from "./rectangle-106.svg";
import rectangle107 from "./rectangle-107.svg";

export const KeywordHighlightSection = () => {
  const positiveData = [
    { label: "기쁨", height: 186, rectangle: rectangle6 },
    { label: "즐거움", height: 156, rectangle: rectangle62 },
    { label: "감동", height: 240, rectangle: rectangle7 },
  ];

  const negativeData = [
    { label: "분노", height: 175, rectangle: rectangle105 },
    { label: "재미없음", height: 257, rectangle: rectangle106 },
    { label: "불안", height: 275, rectangle: rectangle107 },
  ];

  const positiveComments = [
    "🗨 너무 감동적인 맛...",
    "🗨 구하기 힘든걸 구해다준 친구 너무 감동...🥹",
    "🗨 말차 한잔과 즐거운 분위기 굿",
  ];

  const negativeComments = [
    "🗨 그냥 말차임... 뭐이리 유난들인지",
    "🗨 그냥 말차인데 호들갑떠는듯 노잼임",
    "🗨 건강음료인데... 당이 22g 오바임~",
  ];

  const gridLines = [
    { src: line2, top: 0, left: 2 },
    { src: line7, top: 40, left: 2 },
    { src: line4, top: 70, left: 1 },
    { src: image, top: 110, left: 1 },
    { src: line6, top: 150, left: 1 },
    { src: line3, top: 184, left: 0 },
    { src: line, top: 224, left: 0 },
    { src: line5, top: 264, left: 0 },
    { src: line8, top: 294, left: 0 },
  ];

  return (
    <section className="absolute w-[1260px] h-[713px] top-[2129px] left-[90px] bg-white rounded-[30px] shadow-[0px_4px_10px_2px_#00000040]">
      <div className="absolute w-[1200px] h-[605px] top-9 left-[30px]">
        <div
          className="absolute w-[1200px] h-[295px] top-[71px] left-0"
          role="img"
          aria-label="Chart grid lines"
        >
          {gridLines.map((line, index) => (
            <img
              key={index}
              className={`absolute w-[1198px] h-px object-cover`}
              style={{ top: `${line.top}px`, left: `${line.left}px` }}
              alt=""
              src={line.src}
              role="presentation"
            />
          ))}
        </div>

        <div className="absolute w-[432px] h-[605px] top-0 left-20">
          <div
            className="absolute w-[245px] h-[301px] top-[126px] left-[51px]"
            role="img"
            aria-label="긍정 감정 차트"
          >
            <div className="relative h-[303px] -top-px left-px">
              <div className="absolute w-[248px] h-[42px] top-[158px] left-[-7px] -rotate-90">
                <div className="top-4 -left-3 absolute rotate-90 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap">
                  기쁨
                </div>
                <img
                  className="absolute w-[42px] h-[186px] top-[-72px] left-[132px] rotate-90"
                  alt=""
                  src={rectangle6}
                  role="presentation"
                />
              </div>

              <div className="absolute w-[218px] h-[52px] top-[168px] left-[110px] -rotate-90">
                <div className="top-[21px] -left-5 absolute rotate-90 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap">
                  즐거움
                </div>
                <img
                  className="absolute w-[42px] h-[156px] top-[-52px] left-[117px] rotate-90"
                  alt=""
                  src={rectangle62}
                  role="presentation"
                />
              </div>

              <div className="absolute w-[302px] h-[41px] top-[130px] left-[-130px] -rotate-90">
                <img
                  className="absolute w-[41px] h-60 top-[-100px] left-40 rotate-90"
                  alt=""
                  src={rectangle7}
                  role="presentation"
                />
                <div className="absolute top-4 -left-3 rotate-90 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap">
                  감동
                </div>
              </div>
            </div>
          </div>

          <h2 className="left-[101px] absolute top-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-[32px] tracking-[0.50px] leading-10 whitespace-nowrap">
            긍정 TOP3
          </h2>

          <div className="absolute w-[436px] h-[140px] top-[465px] left-0">
            {positiveComments.map((comment, index) => (
              <p
                key={index}
                className={`absolute top-[${index * 50}px] left-0 [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-[22px] tracking-[0.50px] leading-10 whitespace-nowrap`}
              >
                {comment}
              </p>
            ))}
          </div>
        </div>

        <div className="absolute w-[355px] h-[592px] top-[13px] left-[772px]">
          <div className="absolute w-[255px] h-[413px] top-0 left-[54px]">
            <div
              className="absolute w-[253px] h-[335px] top-[78px] left-0 rotate-180"
              role="img"
              aria-label="부정 감정 차트"
            >
              <div className="relative h-[337px] -top-px left-px">
                <div className="absolute w-[237px] h-[249px] -top-1.5 left-1.5 rotate-[-270deg]">
                  <div className="absolute top-[227px] -left-3 rotate-[90.00deg] [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap">
                    분노
                  </div>
                  <img
                    className="absolute w-[41px] h-[175px] top-[141px] left-[127px] rotate-[90.00deg]"
                    alt=""
                    src={rectangle105}
                    role="presentation"
                  />
                </div>

                <div className="absolute w-[319px] h-[69px] top-[125px] left-[-33px] rotate-[-270deg]">
                  <div className="absolute top-[29px] left-[-29px] rotate-[90.00deg] [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap">
                    재미없음
                  </div>
                  <img
                    className="absolute w-[42px] h-[257px] top-[-94px] left-[168px] rotate-[90.00deg]"
                    alt=""
                    src={rectangle106}
                    role="presentation"
                  />
                </div>

                <div className="absolute w-[337px] h-[250px] top-[43px] -left-10 rotate-[-270deg]">
                  <div className="absolute top-3 -left-3 rotate-[90.00deg] [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-lg text-center tracking-[0.50px] leading-[11px] whitespace-nowrap">
                    불안
                  </div>
                  <img
                    className="absolute w-[42px] h-[275px] top-[-116px] left-44 rotate-[90.00deg]"
                    alt=""
                    src={rectangle107}
                    role="presentation"
                  />
                </div>
              </div>
            </div>

            <h2 className="left-[51px] absolute top-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-[32px] tracking-[0.50px] leading-10 whitespace-nowrap">
              부정 TOP3
            </h2>
          </div>

          <div className="absolute w-[361px] h-[140px] top-[452px] left-0">
            {negativeComments.map((comment, index) => (
              <p
                key={index}
                className={`absolute top-[${index * 50}px] left-0 [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-[22px] tracking-[0.50px] leading-10 whitespace-nowrap`}
              >
                {comment}
              </p>
            ))}
          </div>
        </div>
      </div>

      <p className="absolute top-[658px] left-[504px] opacity-70 [font-family:'Noto_Sans_KR-DemiLight',Helvetica] font-light text-black text-lg tracking-[0.50px] leading-10 whitespace-nowrap">
        1500개 댓글 분석 기준 상위 감정
      </p>
    </section>
  );
};
export default KeywordHighlightSection;