import React from "react";

export const StatisticsSection = () => {
  return (
    <section className="top-[101px] left-44 flex flex-col w-[369px] items-start gap-[17px] absolute">
      <h2 className="relative self-stretch mt-[-1.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] text-black tracking-[0.50px]">
        주목해야할 키워드
        <br />
        TOP 10
      </h2>

      <p className="relative self-stretch [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] text-black tracking-[0.50px]">
        EAT PICK선정 TOP20
        <br />
        같이 핫한 키워드를 찾아봐요
      </p>

      <a
        href="#"
        className="relative self-stretch [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-lg leading-[58px] text-black tracking-[0.50px] hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="전체 키워드 목록 보기"
      >
        전체보기&gt;
      </a>
    </section>
  );
};
export default StatisticsSection;