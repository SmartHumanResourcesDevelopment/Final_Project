import React, { useState } from "react";
import "../assets/css/Main_rank.css"; // 메인 페이지 스타일
  /* ---------- 더미 데이터 ---------- */
  /* ---------- 더미 데이터 ---------- */
const rankingData = [
  { rank: 1, name: "탕후루",      trend: "⬆", color: "#e60000", count: 1020 },
  { rank: 2, name: "마라탕",      trend: "↔", color: "#000000", count: 980  },
  { rank: 3, name: "제로음료",    trend: "⬇", color: "#0044ff", count: 903  },
  { rank: 4, name: "포케",        trend: "↔", color: "#000000", count: 892  },
  { rank: 5, name: "인절미 토스트", trend: "↔", color: "#000000", count: 810  },
  { rank: 6, name: "트러플 감자튀김", trend: "⬆", color: "#e60000", count: 759 },
  { rank: 7, name: "뿌링클 치킨",  trend: "↔", color: "#000000", count: 739  },
  { rank: 8, name: "아이스크림+식빵조합", trend: "⬆", color: "#e60000", count: 689 },
  { rank: 9, name: "로제 떡볶이",  trend: "⬇", color: "#0044ff", count: 599  },
  { rank:10, name: "샌이머스켓 디저트", trend: "⬆", color: "#e60000", count: 201 },
];
const maxCnt = Math.max(...rankingData.map(d => d.count));
const timePeriods = ["1일", "1주", "1달", "1년"];

export default function Main_rank() {
  const [activePeriod, setActivePeriod] = useState("1일");

  return (
    <section className="stats">
      {/* ----- 왼쪽 소개 카드 ----- */}
      <div className="stats__card">
        <h2>
          주목해야할 키워드<br />TOP&nbsp;10
        </h2>
        <p>
          EAT&nbsp;PICK선정&nbsp;TOP20<br />
          같이 핫한 키워드를 찾아봐요
        </p>
        <a href="#" aria-label="전체 키워드 보기">
          전체보기&nbsp;&gt;
        </a>
      </div>

      {/* ----- 오른쪽 랭킹 그래프 ----- */}
      <div className="stats__chart">
        {/* 기간 선택 탭 */}
        <div className="stats__tabs">
          {timePeriods.map((t) => (
            <button
              key={t}
              className={t === activePeriod ? "is-active" : ""}
              onClick={() => setActivePeriod(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 랭킹 리스트 */}
        <ol className="ranking-list">
          {rankingData.map(({ rank, name, trend, color, count }) => (
            <li key={rank} className="ranking-item">
              <span className="ranking-item__label">
                {rank}위 {name}
                <span style={{ color }}>{` (${trend})`}</span>
              </span>

              <div
                className="ranking-item__bar"
                style={{ width: `${(count / 10)+40}px` }} /* 간단 비율 */
              />

              <span className="ranking-item__count">
                {count.toLocaleString()}건
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
export {Main_rank}