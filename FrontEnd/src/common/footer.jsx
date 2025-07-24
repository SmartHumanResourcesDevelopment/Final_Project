// src/components/FooterSection.jsx
import React from "react";
import footerLogo from "../assets/img/common/footer_img.png";

const FooterSection = () => {
  return (
     <footer className="w-full bg-black text-white">
      {/* 세로 중앙 정렬: flex-col + gap */}
      <div className="container mx-auto flex flex-col items-center justify-center gap-1 py-8">
        {/* 로고 */}
        <img
          src={footerLogo}
          alt="EatPick logo"
          className="h-14 md:h-16 lg:h-[68px] w-auto object-contain" // 로고 조금 키움
        />

        {/* 정보 문구 */}
        <p className="text-sm leading-6 text-center">
          박병록 · 김다현 · 차명훈&nbsp;|&nbsp;스마트인재개발원&nbsp;|&nbsp;0507-1379-9917
        </p>

        {/* 카피라이트 */}
        <p className="text-sm leading-6 text-center">© 2025 Eat Pick</p>
      </div>
    </footer>
  );
};

export default FooterSection;
