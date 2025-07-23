import React from "react";

export const FeaturedKeywordsSection = () => {
  const keywordData = {
    keyword: "말차",
    ranking: "20등",
    emotionLabels: ["즐거움", "건강", "~", "~", "~", "~"],
    description: "맛있는 건강'을 추구하는 잘파세대의 새로운 일상",
  };

  return (
    <section
      className="absolute w-[616px] h-56 top-[371px] left-[307px]"
      role="region"
      aria-labelledby="featured-keyword"
    >
      <h1
        id="featured-keyword"
        className="absolute top-0 left-0 [font-family:'Noto_Sans_KR-Black',Helvetica] font-black text-[50px] leading-[34px] text-black tracking-[0.50px] whitespace-nowrap"
      >
        {keywordData.keyword}
      </h1>

      <div className="absolute top-[70px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-3xl leading-[34px] text-black tracking-[0.50px] whitespace-nowrap">
        현재 순의 :{keywordData.ranking}
      </div>

      <p className="absolute top-[130px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-3xl leading-[34px] text-black tracking-[0.50px] whitespace-nowrap">
        감정 라벨링 TOP 5 : {keywordData.emotionLabels.join(", ")}
      </p>

      <p className="absolute top-[190px] left-0 [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-3xl leading-[34px] text-black tracking-[0.50px] whitespace-nowrap">
        {keywordData.description}
      </p>
    </section>
  );
};
export default FeaturedKeywordsSection;