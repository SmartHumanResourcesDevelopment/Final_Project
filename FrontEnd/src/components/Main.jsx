import React from "react";
import { ChartSection } from "../UI/Main_top3";
import { InsightsSection } from "../UI/Main_insigth";
import { KeywordSection } from "../UI/Main_up";
import { NavigationSection } from "../common/menu_bar";
import { RecommendationsSection } from "../common/Main_search";
import { StatisticsSection } from "../UI/Main_title1";
import { TopKeywordsSection } from "../UI/Main_title2";

import footer from "../assets/img/common/footer_img.png";
// import maskGroup from "./mask-group.png";

export const Main = () => {
  // Data for ranking items
  const rankingData = [
    {
      rank: 1,
      name: "탕후루",
      trend: "⬆",
      trendColor: "#ff0000",
      count: "1020건",
      barWidth: "298px",
    },
    {
      rank: 2,
      name: "마라탕",
      trend: "↔",
      trendColor: "black",
      count: "980건",
      barWidth: "251px",
    },
    {
      rank: 3,
      name: "제로음료",
      trend: "⬇",
      trendColor: "#0c00ff",
      count: "903건",
      barWidth: "233px",
    },
    {
      rank: 4,
      name: "포케",
      trend: "↔",
      trendColor: "black",
      count: "892건",
      barWidth: "200px",
    },
    {
      rank: 5,
      name: "인절미 토스트",
      trend: "↔",
      trendColor: "black",
      count: "810건",
      barWidth: "176px",
    },
    {
      rank: 6,
      name: "트러플 감자튀김",
      trend: "⬆",
      trendColor: "#0c00ff",
      count: "759건",
      barWidth: "153px",
    },
    {
      rank: 7,
      name: "뿌링클 치킨",
      trend: "↔",
      trendColor: "black",
      count: "739건",
      barWidth: "142px",
    },
    {
      rank: 8,
      name: "아이스크림+식빵조합",
      trend: "⬆",
      trendColor: "#0c00ff",
      count: "689건",
      barWidth: "129px",
    },
    {
      rank: 9,
      name: "로제 떡볶이",
      trend: "⬇",
      trendColor: "black",
      count: "599건",
      barWidth: "111px",
    },
    {
      rank: 10,
      name: "샤인머스켓 디저트",
      trend: "⬆",
      trendColor: "#ff0000",
      count: "201건",
      barWidth: "47px",
    },
  ];

  // Data for time period buttons
  const timePeriods = [
    { label: "1일", active: false },
    { label: "1주", active: false },
    { label: "1달", active: false },
    { label: "1년", active: false },
  ];

  const timePeriods2 = [
    { label: "1일", active: false },
    { label: "1주", active: true },
    { label: "1달", active: false },
    { label: "1년", active: false },
  ];

  const timePeriods3 = [
    { label: "1일", active: false },
    { label: "1주", active: true },
    { label: "1달", active: false },
    { label: "1년", active: false },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-[1560px] h-[5341px] relative">
        <div className="absolute w-[273px] h-[165px] top-[1670px] left-[-1053px] bg-[#6ff8a8] rounded-[136.63px/82.32px] rotate-[22.65deg]" />

        <div className="absolute w-[1560px] h-[200px] top-[5141px] left-0 bg-black">
          <div className="relative w-[493px] h-[145px] top-[11px] left-[474px]">
            <img
              className="absolute w-[257px] h-[136px] top-0 left-[118px]"
              alt="footer"
              src={footer}
            />

            <p className="top-[101px] [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-white tracking-[0] leading-[normal] absolute left-0 text-lg text-center">
              박병록 · 김다현 · 차명훈&nbsp;&nbsp;|
              스마트인재개발원&nbsp;&nbsp;| 0507-1379-9917 <br /> © 2025 Eat
              Pick
            </p>
          </div>
        </div>

        <div className="absolute w-[1446px] h-[618px] top-0 left-0">
          <NavigationSection />
          <img
            className="absolute w-[736px] h-[500px] top-12 left-[662px]"
            alt="Mask group"
            src={footer}
          />

          <TopKeywordsSection />
        </div>

        <RecommendationsSection />
        <div className="absolute w-[545px] h-[377px] top-[913px] left-[-76px]">
          <div className="absolute w-[400px] h-[241px] top-12 left-6 bg-[#ffe0e2] rounded-[200px/120.5px] rotate-[-15.00deg]" />

          <StatisticsSection />
        </div>

        <div className="absolute w-[1421px] h-[594px] top-[1671px] left-[-76px]">
          <div className="absolute w-[400px] h-[241px] top-12 left-6 bg-[#e0faff] rounded-[200px/120.5px] rotate-[-15.00deg]" />

          <ChartSection />
        
        </div>

        <div className="absolute w-[1426px] h-[594px] top-[3438px] left-[-76px]">
          <div className="absolute w-[400px] h-[241px] top-12 left-6 bg-[#fffbe0] rounded-[200px/120.5px] rotate-[-15.00deg]" />

          <KeywordSection />
        </div>

        {/* Ranking List */}
        {rankingData.map((item, index) => (
          <div
            key={index}
            className="absolute w-[823px] h-10 left-[640px]"
            style={{ top: `${1055 + index * 50}px` }}
          >
            {item.trend === "↔" ? (
              <div className="absolute top-0 left-0 [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-black text-3xl tracking-[0.50px] leading-10 whitespace-nowrap">
                {item.rank}위 {item.name}({item.trend})
              </div>
            ) : (
              <p className="absolute top-0 left-0 [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-transparent text-3xl tracking-[0.50px] leading-10 whitespace-nowrap">
                <span className="text-black tracking-[0.15px]">
                  {item.rank}위 {item.name}(
                </span>
                <span
                  style={{ color: item.trendColor }}
                  className="tracking-[0.15px]"
                >
                  {item.trend}
                </span>
                <span className="text-black tracking-[0.15px]">)</span>
              </p>
            )}

            <div className="absolute top-0 left-[718px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-black text-3xl tracking-[0.50px] leading-10 whitespace-nowrap">
              {item.count}
            </div>

            <div
              className="absolute h-10 top-0 left-[393px] bg-[#5969cf]"
              style={{ width: item.barWidth }}
            />
          </div>
        ))}

        <div className="absolute w-[552px] h-[109px] top-[2365px] left-[105px]">
          <div className="absolute w-[552px] h-[29px] top-[26px] left-0 bg-[#e0faff]" />

          <div className="top-0 left-0 flex flex-col w-[369px] items-start gap-[17px] absolute">
            <div className="relative w-fit mt-[-1.00px] mr-[-128.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] whitespace-nowrap text-black tracking-[0.50px]">
              핫한 이유, 숫자가 말해요
            </div>

            <p className="relative w-fit mr-[-185.00px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] whitespace-nowrap text-black tracking-[0.50px]">
              일주일간 언급량 변화를 통해 인기 상승세를 확인하세요
            </p>
          </div>
        </div>

       

        <div className="absolute w-[1260px] h-[718px] top-[2519px] left-[124px]">
          <div className="absolute w-[1260px] h-[713px] top-[5px] left-0 bg-white rounded-[30px] shadow-[0px_4px_10px_2px_#00000040]">
            <p className="absolute w-[1148px] top-[558px] left-[54px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-[22px] tracking-[0.50px] leading-10">
              탕후루는 비주얼 중심 SNS 유행과 함께 급상승, 마라탕은 여전히
              MZ세대의 꾸준한 선택, 제로음료는 건강함을 중시하는 흐름 속 점진적
              성장 중입니다.
            </p>
          </div>

          <InsightsSection />
          <div className="absolute w-[86px] h-4 top-[218px] left-[1149px]">
            <div className="absolute w-4 h-4 top-0 left-0 bg-[#1500ff] rounded-[7.89px]" />

            <div className="absolute w-[55px] top-0 left-[30px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-[#121212] text-xs tracking-[0.50px] leading-3 whitespace-nowrap">
              제로음료
            </div>
          </div>

          <div className="absolute w-[73px] h-4 top-[162px] left-[1149px]">
            <div className="absolute w-4 h-4 top-0 left-0 bg-[#ff00e1] rounded-[7.89px]" />

            <div className="absolute w-[42px] top-0 left-[30px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-[#121212] text-xs tracking-[0.50px] leading-3 whitespace-nowrap">
              마라탕
            </div>
          </div>
        </div>


         <div className="absolute w-[655px] h-[109px] top-[4132px] left-[120px]">
          <div className="absolute w-[655px] h-[29px] top-[26px] left-0 bg-[#fffbe1]" />

          <div className="top-0 left-0 flex flex-col w-[369px] items-start gap-[17px] absolute">
            <p className="relative w-fit mt-[-1.00px] mr-[-231.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] whitespace-nowrap text-black tracking-[0.50px]">
              급상승 중! 놓치면 늦는 키워드
            </p>

            <p className="relative w-fit mr-[-237.00px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] whitespace-nowrap text-black tracking-[0.50px]">
              갑작스러운 검색량 증가는 새로운 트렌드의 신호일 수 있어요
            </p>
          </div>
          
        </div>
        


        <div className="absolute w-[1260px] h-[713px] top-[4291px] left-[124px] bg-white rounded-[30px] shadow-[0px_4px_10px_2px_#00000040]">
            <InsightsSection />
          <p className="absolute w-[1148px] top-[518px] left-[54px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-[22px] tracking-[0.50px] leading-10">
            AI 푸드는 개인 맞춤형 식단 추천과 3D 푸드 프린팅 기술 발전이
            인플루언서들을 통해 언급되며 새로운 식사 경험으로 주목받고 있습니다.
            로열 푸드 다이닝은 지역 특산물 활용 미식 경험과 지속 가능한 소비
            트렌드가 미디어와 기사를 통해 부각되며 인기를 얻고 있습니다. 또한,
            식물성 육류 퓨전은 건강과 환경을 모두 고려하는 새로운 미식 시도로,
            언론의 집중 조명과 함께 기존 육류 소비의 대안으로 급부상하고
            있습니다.
          </p>
        </div>

        {/* Time Period Buttons - First Set */}
        <div className="absolute w-[383px] h-11 top-[980px] left-[974px]">
          <div className="absolute top-[3px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-[32px] tracking-[0.50px] leading-10 whitespace-nowrap">
            📅
          </div>

          {timePeriods.map((period, index) => (
            <div
              key={index}
              className={`inline-flex items-start gap-2.5 px-5 py-1.5 absolute top-0 rounded-lg ${
                index === 0
                  ? "left-14 bg-[#ffe2e4]"
                  : index === 1
                    ? "left-[140px]"
                    : index === 2
                      ? "left-56"
                      : "left-[308px]"
              }`}
            >
              <div
                className={`relative w-fit mt-[-1.00px] text-black text-[22px] tracking-[0] leading-[31.9px] whitespace-nowrap ${
                  index === 0
                    ? "[font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold"
                    : "[font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium"
                }`}
              >
                {period.label}
              </div>
            </div>
          ))}
        </div>

        {/* Time Period Buttons - Second Set */}
        <div className="absolute w-[383px] h-11 top-[2428px] left-[969px]">
          <div className="absolute top-[3px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-[32px] tracking-[0.50px] leading-10 whitespace-nowrap">
            📅
          </div>

          {timePeriods2.map((period, index) => (
            <div
              key={index}
              className={`inline-flex items-start gap-2.5 px-5 py-1.5 absolute top-0 rounded-lg ${
                index === 0
                  ? "left-14"
                  : index === 1
                    ? "left-[140px] bg-[#e0faff]"
                    : index === 2
                      ? "left-56"
                      : "left-[308px]"
              }`}
            >
              <div
                className={`relative w-fit mt-[-1.00px] text-black text-[22px] tracking-[0] leading-[31.9px] whitespace-nowrap ${
                  period.active
                    ? "[font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold"
                    : "[font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium"
                }`}
              >
                {period.label}
              </div>
            </div>
          ))}
        </div>

        {/* Time Period Buttons - Third Set */}
        <div className="absolute w-[383px] h-11 top-[4197px] left-[969px]">
          <div className="absolute top-[3px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-[32px] tracking-[0.50px] leading-10 whitespace-nowrap">
            📅
          </div>

          {timePeriods3.map((period, index) => (
            <div
              key={index}
              className={`inline-flex items-start gap-2.5 px-5 py-1.5 absolute top-0 rounded-lg ${
                index === 0
                  ? "left-14"
                  : index === 1
                    ? "left-[140px] bg-[#fffbe1]"
                    : index === 2
                      ? "left-56"
                      : "left-[308px]"
              }`}
            >
              <div
                className={`relative w-fit mt-[-1.00px] text-black text-[22px] tracking-[0] leading-[31.9px] whitespace-nowrap ${
                  period.active
                    ? "[font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold"
                    : "[font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium"
                }`}
              >
                {period.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Main;
