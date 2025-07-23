import React from "react";

export const InsightsSection = () => {
  return (
    <section className="absolute w-[563px] h-[116px] top-[191px] left-[307px]">
      <h2 className="absolute top-0 left-0 [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] text-black tracking-[0.50px] whitespace-nowrap">
        쩝쩝박사님이 주목한 키워드
      </h2>

      <p className="absolute top-[82px] left-0 [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] text-black tracking-[0.50px] whitespace-nowrap">
        쩝쩝박사님이 고르신 키워드 EatPICK이 분석해드려요
      </p>
    </section>
  );
};
export default InsightsSection;