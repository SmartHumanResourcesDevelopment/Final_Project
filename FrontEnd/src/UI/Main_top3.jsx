import React from "react";
import rectangle1253 from "./rectangle-125-3.svg";
import rectangle1254 from "./rectangle-125-4.svg";
import rectangle1255 from "./rectangle-125-5.svg";

export const ChartSection = () => {
  const trendData = [
    {
      id: 1,
      image: rectangle1253,
      title: "탕후루",
      description:
        "📌 잘파세대 열광 포인트: \n달콤 바삭한 비주얼과 식감으로 SNS를 장악한 길거리 간식!",
      titlePosition: "left-[106px]",
    },
    {
      id: 2,
      image: rectangle1254,
      title: "마라탕",
      description:
        "📌 잘파세대 열광 포인트: \n맵고 얼얼한 중독성, 커스텀의 즐거움으로 MZ세대를 사로잡다",
      titlePosition: "left-[106px]",
    },
    {
      id: 3,
      image: rectangle1255,
      title: "제로음료",
      description:
        "📌 잘파세대 열광 포인트: \n건강과 맛을 동시에, 죄책감 없이 즐기는 음료 트렌드",
      titlePosition: "left-24",
    },
  ];

  return (
    <section className="absolute w-[1250px] h-[500px] top-[94px] left-[171px]">
      <div className="absolute w-[872px] h-[500px] top-0 left-[378px]">
        {trendData.map((trend, index) => (
          <article
            key={trend.id}
            className={`flex flex-col w-[300px] h-[500px] items-center gap-2.5 absolute top-0 bg-white rounded-[20px] shadow-[4px_4px_10px_2px_#00000040] ${
              index === 0
                ? "left-0"
                : index === 1
                  ? "left-[286px]"
                  : "left-[572px]"
            }`}
          >
            <img
              className="relative w-[300px] h-[200px] object-cover"
              alt={`${trend.title} 이미지`}
              src={trend.image}
            />

            <div className="relative w-[279px] h-[257px]">
              <h3
                className={`absolute top-0 ${trend.titlePosition} [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-black text-[22px] text-center tracking-[0.50px] leading-10 whitespace-nowrap`}
              >
                {trend.title}
              </h3>

              <p className="w-[275px] top-[68px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black tracking-[0.50px] leading-8 absolute left-0 text-lg text-center">
                {trend.description.split("\n").map((line, lineIndex) => (
                  <React.Fragment key={lineIndex}>
                    {line}
                    {lineIndex < trend.description.split("\n").length - 1 && (
                      <br />
                    )}
                  </React.Fragment>
                ))}
              </p>

              <div className="absolute w-[254px] h-[50px] top-[207px] left-3">
                <button
                  className="relative w-[252px] h-[50px] rounded-[100px] border border-solid border-black hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  aria-label={`${trend.title} 심층분석 보러가기`}
                >
                  <span className="absolute top-1 left-[55px] [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-black text-lg text-center tracking-[0.50px] leading-10 whitespace-nowrap">
                    심층분석 보러가기
                  </span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <header className="top-0 left-0 flex flex-col w-[369px] items-start gap-[17px] absolute">
        <h1 className="relative self-stretch mt-[-1.00px] [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-5xl leading-[58px] text-black tracking-[0.50px]">
          가장핫한 키워드
          <br />
          TOP 3
        </h1>

        <p className="relative self-stretch [font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal text-2xl leading-[34px] text-black tracking-[0.50px]">
          EAT PICK선정 TOP3
          <br />
          심층 분석 해 보러가요.
        </p>

        <p className="relative self-stretch [font-family:'Noto_Sans_KR-Bold',Helvetica] font-bold text-lg leading-[58px] text-black tracking-[0.50px]">
          ※ 심층분석 보러가기 버튼을 눌러보세요
        </p>
      </header>
    </section>
  );
};
export default ChartSection;