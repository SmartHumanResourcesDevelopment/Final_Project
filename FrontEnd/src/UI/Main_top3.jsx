import React from "react";
import "../assets/css/Main_top3.css";               // ★ 새로 만든 전용 CSS
import img1 from "../assets/img/common/rectangle-125-3.png";
import img2 from "../assets/img/common/rectangle-125-4.png";
import img3 from "../assets/img/common/rectangle-125-5.png";

const trendData = [
  {
    id: 1,
    image: img1,
    title: "탕후루",
    desc: "📌 잘파세대 열광 포인트:\n달콤 바삭한 비주얼과 식감으로 SNS를 장악한 길거리 간식!",
  },
  {
    id: 2,
    image: img2,
    title: "마라탕",
    desc: "📌 잘파세대 열광 포인트:\n맵고 얼얼한 중독성, 커스텀의 즐거움으로 MZ세대를 사로잡다",
  },
  {
    id: 3,
    image: img3,
    title: "제로음료",
    desc: "📌 잘파세대 열광 포인트:\n건강과 맛을 동시에, 죄책감 없이 즐기는 음료 트렌드",
  },
];

export default function Main_top3() {
  return (
    <section className="top3">
      {/* ── 왼쪽 소개 영역 ───────────────────────────── */}
      <header className="top3__intro">
        <h2>
          <strong>가장핫한 키워드<br /></strong>
          <strong>TOP&nbsp;3</strong>
        </h2>
        <p>
          EAT&nbsp;PICK 선정&nbsp;TOP3<br />
          심층 분석 해 보러가요.
        </p>
        <p className="top3__note">※ 심층분석 보러가기 버튼을 눌러보세요</p>
      </header>

      {/* ── 오른쪽 카드 영역 ────────────────────────── */}
      <div className="top3__cards">
        {trendData.map(({ id, image, title, desc }, idx) => (
          <article key={id} className={`top3__card ${idx === 0 ? "is-active" : ""}`} >
            <img src={image} alt={`${title} 이미지`} />
            <h3>{title}</h3>

            {desc.split("\n").map((line, i) => (
              <p key={i}>{line}</p>
            ))}

            <button aria-label={`${title} 심층분석 보러가기`}>
              심층분석 보러가기
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export{Main_top3}