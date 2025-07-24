// src/UI/TopKeywordsSection.jsx
import React from "react";
import bannerImg from "../assets/img/common/banner_img.png";
import "../assets/css/Main_servise_banner.css";    // 스타일 분리

export default function Main_servise_banner() {
  return (
    /* ─ 네비게이션(fixed 77px) 바로 다음에 렌더링 ─ */
    <section className="hero">
      <div className="hero__inner">
        {/* ───── 왼쪽 : 텍스트 ───── */}
        <div className="hero__text">
          <h1 className="hero__title">EAT PICk</h1>
          <p className="hero__subtitle">
            잘파세대의 핫한 음식 트렌드, 한눈에 Pick!
          </p>
          <a
            href="#service-intro"
            className="hero__link"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("service-intro")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            서비스소개 보러가기&nbsp;&gt;
          </a>
        </div>

        {/* ───── 오른쪽 : 배너 이미지 ───── */}
        <img src={bannerImg} alt="" className="hero__img" />
      </div>
    </section>
  );
}
export { Main_servise_banner };