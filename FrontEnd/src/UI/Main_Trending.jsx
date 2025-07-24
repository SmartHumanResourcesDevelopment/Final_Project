import React, { useState } from "react";
import rectangle1251 from "../assets/img/common/rectangle-125-1.png";
import rectangle1252 from "../assets/img/common/rectangle-125-2.png";
import rectangle1253 from "../assets/img/common/rectangle-125-3-3.png";
import "../assets/css/Main_keyword_card.css";   // 공통 CSS

export default function Main_Trending() {
  const [hovered, setHovered] = useState(null);

  const keywordData = [
    {
      id: 1,
      title: "AI 푸드",
      summary:
        "개인 맞춤형 식단 추천부터 3D 푸드 프린팅까지, 기술이 이끄는 새로운 식사 경험",
      image: rectangle1251,
    },
    {
      id: 2,
      title: "로컬 푸드 다이닝",
      summary:
        "지역 특산물을 활용한 미식 경험과 지속 가능한 소비 지향, '힙'한 로컬 맛집 탐방",
      image: rectangle1252,
    },
    {
      id: 3,
      title: "식물성 육류 퓨전",
      summary:
        "기존 요리에 식물성 대체육을 접목하여 건강과 환경을 모두 잡는 새로운 미식 시도",
      image: rectangle1253,
    },
  ];

  const handleCardClick = (id) => console.log(`심층분석 보러가기 ← card ${id}`);

  return (
    <section className="trending-section" aria-labelledby="keyword-section-title">
      {/* ── 왼쪽 설명 */}
      <header id="keyword-section-title" className="intro-box">
        <h1>
          잠재 키워드<br />TOP&nbsp;3
        </h1>
        <p>
          주목받지 못하고 있지만<br />
          다음 잠재 트렌드! TOP3
        </p>
        <p className="note">※ 심층분석 보러가기 버튼을 눌러보세요</p>
      </header>

      {/* ── 카드 리스트 */}
      <div className="card-list">
        {keywordData.map((k) => (
          <article
            key={k.id}
            className={`keyword-card${hovered === k.id ? " is-hover" : ""}`}
            onMouseEnter={() => setHovered(k.id)}
            onMouseLeave={() => setHovered(null)}
            aria-labelledby={`keyword-title-${k.id}`}
          >
            <img src={k.image} alt={`${k.title} 관련 이미지`} />

            <div className="card-body">
              <h3 id={`keyword-title-${k.id}`}>{k.title}</h3>
              <p className="card-summary">
                ✅요약:<br />
                {k.summary}
              </p>
              <button onClick={() => handleCardClick(k.id)}>
                심층분석 보러가기
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export { Main_Trending };