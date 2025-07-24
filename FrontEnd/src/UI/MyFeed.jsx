import React from "react";

export const ActivityFeedSection = () => {
  const recentKeywords = [
    "라면", "마라탕", "솜사탕", "민초", "하입푸드", "멜론킥", "비건",
  ];

  const scrapedReports = [
    "냉라면에 관한 보고서", "비건에 관한 보고서", "하입푸드에 관한 보고서",
    "초코바나나에 관한 보고서", "멜론킥에 관한 보고서", "민초에 관한 보고서",
    "말차에 관한 보고서",
  ];

  return (
    <section className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-20">
      <h2 className="text-lg font-bold mb-6">내 활동</h2>
      {/* 💥 변경 부분: 이 div에 divide-x와 divide-색상 클래스를 추가하세요. 💥 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-x divide-gray-300">
        {/* div에 border-r 클래스는 제거해야 합니다. divide-x와 중복됩니다. */}
        <div className="pr-3"> {/* 선과 내용 사이에 여백을 줍니다. */}
          <h3 className="mb-2">최근 키워드</h3>
          <ul className="list-disc list-inside">
            {recentKeywords.map(keyword => (
              <li key={keyword}># {keyword}</li>
            ))}
          </ul>
        </div>
        <div className="pl-3"> {/* 선과 내용 사이에 여백을 줍니다. */}
          <h3 className="mb-2">스크랩 정보</h3>
          <ul className="list-disc list-inside">
            {scrapedReports.map(report => (
              <li key={report}>{report}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ActivityFeedSection;