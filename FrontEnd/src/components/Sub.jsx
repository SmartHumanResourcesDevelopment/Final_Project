import React from "react";
import { FeaturedKeywordsSection } from "../UI/Detail_keyword";
import { InsightsSection } from "../UI/Detail_title";
import { KeywordHighlightSection } from "../UI/Detail_kote";
import { NavigationSection }  from "../common/menu_bar";
import { TrendAnalysisSection } from "../UI/Detail_same";
import chatgptImage20257160255421 from "../assets/img/common/footer_img.png";
import group410 from "../assets/img/common/Group 410.png";
import messageBot from "../assets/img/common/Message Bot.png";
// import oval from "./oval.svg";
// import path14 from "./path-14.svg";
// import rectangle112 from "./rectangle-112.png";

export const Sub = () => {
  const timeFilterOptions = [
    { label: "1일", active: false },
    { label: "1주", active: true },
    { label: "1달", active: false },
    { label: "1년", active: false },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-[1440px] h-[4247px] relative">
        <div className="absolute w-[373px] h-[109px] top-[1970px] left-[100px]">
          <div className="absolute w-[373px] h-[29px] top-[26px] left-0 bg-[#e0faff]" />

          <div className="flex flex-col w-[369px] items-start gap-[17px] absolute top-0 left-0">
            <h2 className="relative w-fit mt-[-1.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] text-black tracking-[0.50px] whitespace-nowrap">
              KOTE 감성분석
            </h2>

            <p className="relative w-fit mr-[-237.00px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] text-black tracking-[0.50px] whitespace-nowrap">
              내가 주목한 키워드가 어떤 감성을 가지고 있는지 알아보아요
            </p>
          </div>
        </div>

        <div className="absolute w-[473px] h-[109px] top-[3012px] left-[100px]">
          <div className="absolute w-[469px] h-[29px] top-[26px] left-1 bg-[#fff6bf]" />

          <div className="flex flex-col w-[369px] items-start gap-[17px] absolute top-0 left-0">
            <h2 className="relative w-fit mt-[-1.00px] mr-[-49.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] text-black tracking-[0.50px] whitespace-nowrap">
              비슷한 키워드 TOP5
            </h2>

            <p className="relative w-fit mr-[-205.00px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] text-black tracking-[0.50px] whitespace-nowrap">
              쩝쩝박사님이 고르신 키워드로 EatPICK이&nbsp;&nbsp;만들어드려요
            </p>
          </div>
        </div>

        <header className="absolute w-[1647px] h-[723px] top-0 left-[-207px]">
          <div className="absolute w-[1647px] h-[658px] top-0 left-0">
            <NavigationSection />
            <div className="absolute w-[923px] h-[595px] top-[63px] left-0">
              <div className="absolute w-[687px] h-[414px] top-[82px] left-[42px] bg-[#fffbe0] rounded-[343.48px/206.94px] rotate-[-15.00deg]" />

              <FeaturedKeywordsSection />
              <InsightsSection />
            </div>
          </div>

          <img
            className="absolute w-[558px] h-[558px] top-[165px] left-[1020px]"
            alt="Rectangle"
            //src={rectangle112}
          />

          <button
            className="absolute w-[90px] h-[50px] top-[88px] left-[1514px] bg-black rounded-[200px]"
            aria-label="검색"
          >
            <span className="absolute top-[17px] left-[22px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-white text-xs tracking-[0.50px] leading-[13px] whitespace-nowrap">
              검색
            </span>

            <div className="absolute w-3 h-3 top-[19px] left-[62px]">
              <div className="relative w-[13px] h-[13px] -top-px -left-px">
                <img
                  className="absolute w-[11px] h-[11px] top-0 left-0"
                  alt=""
                  //src={oval}
                />

                <img
                  className="absolute w-[5px] h-[5px] top-[9px] left-[9px]"
                  alt=""
                  //src={path14}
                />
              </div>
            </div>
          </button>
        </header>

        <section className="absolute w-[1260px] h-[713px] top-[1087px] left-[90px] bg-white rounded-[30px] shadow-[0px_4px_10px_2px_#00000040]">
          <p className="absolute w-[1148px] top-[564px] left-14 [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-[22px] tracking-[0.50px] leading-10">
            말차는 20XX년 XX월경 특정 인플루언서의 챌린지를 시작으로
            급부상했으며, &#39;맛있는 건강&#39;을 추구하는 잘파세대의 취향과
            &#39;인증샷 문화&#39;에 부합하며 빠르게 확산되었습니다. 특히, 기존의
            커피 위주 음료 시장에 대한 대안이자 새로운 미식 경험으로 인식되며
            인기를 얻었습니다.&#34;
          </p>

          <img
            className="absolute w-[1087px] h-[442px] top-[61px] left-[77px]"
            alt="Group"
            src={group410}
          />
        </section>

        <KeywordHighlightSection />
        <TrendAnalysisSection />

        <div className="absolute w-[491px] h-[109px] top-[928px] left-[100px]">
          <div className="absolute w-[491px] h-[29px] top-[29px] left-0 bg-[#ffe0e2]" />

          <div className="flex flex-col w-[369px] items-start gap-[17px] absolute top-0 left-0">
            <h2 className="relative w-fit mt-[-1.00px] mr-[-67.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] text-black tracking-[0.50px] whitespace-nowrap">
              말차 트렌드 확산 배경
            </h2>

            <p className="relative w-fit [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] text-black tracking-[0.50px] whitespace-nowrap">
              EAT PICK이 분석해드려요
            </p>
          </div>
        </div>

        <aside className="absolute w-[239px] h-[188px] top-[763px] left-[1162px]">
          <button
            className="absolute w-[120px] h-[120px] top-[68px] left-[68px] bg-white rounded-[200px] shadow-[1px_1px_10px_1px_#00000040]"
            aria-label="아이디어 도움말"
          >
            <img
              className="absolute w-[90px] h-[90px] top-[15px] left-[15px]"
              alt="Message bot"
              src={messageBot}
            />
          </button>

          <div className="absolute w-[239px] h-[58px] top-0 left-0">
            <div className="w-[241px] h-[58px]">
              <div className="relative w-[239px] h-[58px] bg-[url(/rectangle-23.svg)] bg-[100%_100%]">
                <span className="absolute top-[23px] left-5 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-white text-lg tracking-[0.30px] leading-[13.0px] whitespace-nowrap">
                  아이디어가 필요하신가요?
                </span>
              </div>
            </div>
          </div>
        </aside>

        <footer className="absolute w-[1440px] h-[200px] top-[4047px] left-0.5 bg-black">
          <div className="relative w-[493px] h-[145px] top-[11px] left-[474px]">
            <img
              className="absolute w-[257px] h-[136px] top-0 left-[118px]"
              alt="Chatgpt image"
              src={chatgptImage20257160255421}
            />

            <p className="absolute top-[101px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-white text-lg text-center tracking-[0] leading-[normal]">
              박병록 · 김다현 · 차명훈&nbsp;&nbsp;|
              스마트인재개발원&nbsp;&nbsp;| 0507-1379-9917 <br /> © 2025 Eat
              Pick
            </p>
          </div>
        </footer>

        <nav
          className="absolute w-[383px] h-11 top-[991px] left-[974px]"
          role="tablist"
          aria-label="시간 필터"
        >
          <span
            className="absolute top-[3px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-black text-[32px] tracking-[0.50px] leading-10 whitespace-nowrap"
            aria-hidden="true"
          >
            📅
          </span>

          {timeFilterOptions.map((option, index) => {
            const positions = [
              "left-14",
              "left-[140px]",
              "left-56",
              "left-[308px]",
            ];
            return (
              <button
                key={option.label}
                className={`${positions[index]} ${option.active ? "bg-[#ffe2e4]" : ""} inline-flex items-start gap-2.5 px-5 py-1.5 absolute top-0 rounded-lg`}
                role="tab"
                aria-selected={option.active}
              >
                <span
                  className={`${option.active ? "[font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold" : "[font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium"} relative w-fit mt-[-1.00px] text-black text-[22px] tracking-[0] leading-[31.9px] whitespace-nowrap`}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
export default Sub;