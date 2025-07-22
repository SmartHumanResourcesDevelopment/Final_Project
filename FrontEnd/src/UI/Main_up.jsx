import React, { useState } from "react";
// import image from "./image.svg";
import rectangle1251 from "../assets/img/common/rectangle-125-1.png";
import rectangle1252 from "../assets/img/common/rectangle-125-2.png";
import rectangle1253 from "../assets/img/common/rectangle-125-3-3.png";

export const KeywordSection = () => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const keywordData = [
    {
      id: 1,
      title: "AI 푸드",
      summary:
        "개 인 맞춤형 식단 추천부터 3D 푸드 프린팅까지, 기술이 이끄는 새로운 식사 경험",
      image: rectangle1251,
      titlePosition: "left-[104px]",
    },
    {
      id: 2,
      title: "로컬 푸드 다이닝",
      summary:
        "지역 특산물을 활용한 미식 경험과 지속 가능한 소비 지향, '힙'한 로컬 맛집 탐방",
      image: rectangle1252,
      titlePosition: "left-[60px]",
    },
    {
      id: 3,
      title: "식물성 육류 퓨전",
      summary:
        "기존 요리에 식물성 대체육을 접목하여 건강과 환경을 모두 잡는 새로운 미식 시도",
      image: rectangle1253,
      titlePosition: "left-[60px]",
    },
  ];

  const handleCardClick = (id) => {
    console.log(`심층분석 보러가기 clicked for card ${id}`);
  };

  return (
    <section
      className="absolute w-[1250px] h-[500px] top-[94px] left-44"
      role="main"
      aria-labelledby="keyword-section-title"
    >
      <div className="absolute w-[853px] h-[500px] top-0 left-[488px]">
        {keywordData.map((keyword, index) => (
          <article
            key={keyword.id}
            className={`flex flex-col w-[300px] h-[500px] items-center gap-2.5 absolute top-0 ${
              index === 0
                ? "left-0"
                : index === 1
                  ? "left-[277px]"
                  : "left-[553px]"
            } bg-white rounded-[20px] shadow-[4px_4px_10px_2px_#00000040] transition-transform duration-200 ${
              hoveredCard === keyword.id ? "transform scale-105" : ""
            }`}
            onMouseEnter={() => setHoveredCard(keyword.id)}
            onMouseLeave={() => setHoveredCard(null)}
            aria-labelledby={`keyword-title-${keyword.id}`}
          >
            <img
              className="relative w-[300px] h-[200px] object-cover"
              alt={`${keyword.title} 관련 이미지`}
              src={keyword.image}
            />

            <div className="relative w-[279px] h-[257px]">
              <h3
                id={`keyword-title-${keyword.id}`}
                className={`${keyword.titlePosition} absolute top-0 [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-black text-[22px] text-center tracking-[0.50px] leading-10 whitespace-nowrap`}
              >
                {keyword.title}
              </h3>

              <p className="w-[275px] top-[68px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black tracking-[0.50px] leading-8 absolute left-0 text-lg text-center">
                ✅요약:
                <br />
                {keyword.summary}
              </p>

              <div className="absolute w-[254px] h-[50px] top-[207px] left-3">
                <button
                  className="relative w-[252px] h-[50px] rounded-[100px] border border-solid border-black hover:bg-black hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  onClick={() => handleCardClick(keyword.id)}
                  aria-label={`${keyword.title} 심층분석 보러가기`}
                >
                  <span className="absolute top-1 left-[55px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-lg text-center tracking-[0.50px] leading-10 whitespace-nowrap">
                    심층분석 보러가기
                  </span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <header className="flex flex-col w-[369px] items-start gap-[17px] absolute top-0.5 left-0">
        <h1
          id="keyword-section-title"
          className="relative self-stretch mt-[-1.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] text-black tracking-[0.50px]"
        >
          잠재 키워드
          <br />
          TOP 3
        </h1>

        <p className="relative self-stretch [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] text-black tracking-[0.50px]">
          주목받지 못하고 있지만
          <br />
          다음 잠재 트렌드! TOP3
        </p>

        <p className="relative self-stretch [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-lg leading-[58px] text-black tracking-[0.50px]">
          ※ 심층분석 보러가기 버튼을 눌러보세요
        </p>
      </header>
    </section>
  );
};
export default KeywordSection;