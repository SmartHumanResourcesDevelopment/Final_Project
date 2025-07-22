import React from "react";
import womanAnalyzingGraphsAndDiagrams from "./woman-analyzing-graphs-and-diagrams.png";

export const TopKeywordsSection = () => {
  return (
    <section className="absolute w-[1446px] h-[618px] top-0 left-0">
      <div className="relative w-[1440px] h-[618px]">
        <div className="absolute w-[1440px] h-[500px] top-[70px] left-0 bg-[#ebfeff]" />

        <h1 className="absolute top-[219px] left-24 [font-family:'Racing_Sans_One-Regular',Helvetica] font-normal text-[130px] text-center leading-10 whitespace-nowrap text-black tracking-[0.50px]">
          EAT PICk
        </h1>

        <p className="absolute top-[335px] left-[95px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-[42px] text-center leading-10 whitespace-nowrap text-black tracking-[0.50px]">
          잘파세대의 핫한 음식 트렌드, 한눈에 Pick!
        </p>

        <a
          href="#service-intro"
          className="absolute top-[418px] left-[95px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-[32px] text-center leading-10 whitespace-nowrap text-black tracking-[0.50px] cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document
                .getElementById("service-intro")
                ?.scrollIntoView({ behavior: "smooth" });
            }
          }}
          onClick={(e) => {
            e.preventDefault();
            document
              .getElementById("service-intro")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          서비스소개 보러가기&gt;
        </a>

        <img
          className="absolute w-[574px] h-[618px] top-0 left-[860px]"
          alt="Woman analyzing graphs and diagrams representing food trend data"
          src={womanAnalyzingGraphsAndDiagrams}
        />
      </div>
    </section>
  );
};
export default TopKeywordsSection;