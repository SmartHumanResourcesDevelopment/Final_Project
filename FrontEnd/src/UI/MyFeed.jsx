import React from "react";

export const ActivityFeedSection = () => {
  const recentKeywords = [
    "라면",
    "마라탕",
    "솜사탕",
    "민초",
    "하입푸드",
    "멜론킥",
    "비건",
  ];

  const scrapedReports = [
    "냉라면에 관한 보고서",
    "비건에 관한 보고서",
    "하입푸드에 관한 보고서",
    "초코바나나에 관한 보고서",
    "멜론킥에 관한 보고서",
    "민초에 관한 보고서",
    "말차에 관한 보고서",
  ];

  return (
    <section
      className="absolute w-[1334px] h-[350px] top-[521px] left-[50px]"
      aria-labelledby="activity-title"
    >
      <h2
        id="activity-title"
        className="top-0 left-0 [font-family:'Poppins-Medium',Helvetica] whitespace-nowrap absolute font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px]"
      >
        내 활동
      </h2>

      <div className="absolute w-[631px] h-[302px] top-[47px] left-2">
        <div className="relative w-[615px] h-[302px] bg-white shadow-[1px_1px_1px_2px_#0000001a]">
          <h3 className="w-[387px] top-6 left-[46px] [font-family:'Noto_Sans_KR-Medium',Helvetica] absolute font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px]">
            내가 최근에 검색한 키워드
          </h3>

          <ul className="list-none">
            {recentKeywords.map((keyword, index) => (
              <li
                key={keyword}
                className={`absolute left-[46px] [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px]`}
                style={{ top: `${56 + index * 32}px` }}
              >
                # {keyword}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="absolute w-[667px] h-[302px] top-12 left-[665px]">
        <div className="w-[683px] h-[302px]">
          <div className="relative w-[667px] h-[302px] bg-white shadow-[1px_1px_1px_2px_#0000001a]">
            <h3 className="w-[268px] top-6 left-[50px] [font-family:'Noto_Sans_KR-Medium',Helvetica] absolute font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px]">
              내가 스크랩한 정보
            </h3>

            <ul className="list-none">
              {scrapedReports.map((report, index) => (
                <li
                  key={report}
                  className={`absolute left-[50px] [font-family:'Noto_Sans_KR-Medium',Helvetica] font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px] ${index === 0 ? "whitespace-nowrap" : ""}`}
                  style={{ top: `${56 + index * 32}px` }}
                >
                  {report}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ActivityFeedSection;