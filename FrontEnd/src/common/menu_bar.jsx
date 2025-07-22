import React, { useState } from "react";
import ChevronDown from "../assets/img/common/chevron_down.png";
import notifIcon from "../assets/img/common/notif-icon.png";
// import notifsigin from "../assets/img/common/notif-sigin.png";

export const NavigationSection = () => {
  const [activeMenu, setActiveMenu] = useState("메인페이지");

  const navigationItems = [
    { label: "메인페이지", position: "left-[391px]", active: true },
    { label: "심층분석페이지", position: "left-[590px]", active: false },
    { label: "서비스소개", position: "left-[819px]", active: false },
    { label: "마이페이지", position: "left-[1018px]", active: false },
  ];

  const handleMenuClick = (menuLabel) => {
    setActiveMenu(menuLabel);
  };

  return (
    <nav
      className="absolute w-[1440px] h-[77px] top-0 left-0 bg-white"
      role="navigation"
      aria-label="Main navigation"
    >
      {navigationItems.map((item, index) => (
        <button
          key={index}
          className={`${item.position} absolute top-[21px] text-black text-base tracking-[0] leading-[30px] whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${
            item.label === activeMenu
              ? "[font-family:'Noto_Sans_KR-Black',Helvetica] font-black"
              : "[font-family:'Noto_Sans_KR-Regular',Helvetica] font-normal"
          }`}
          onClick={() => handleMenuClick(item.label)}
          aria-current={item.label === activeMenu ? "page" : undefined}
        >
          {item.label}
        </button>
      ))}

      <div className="absolute w-[222px] h-8 top-5 left-[1182px]">
        <div className="absolute w-8 h-8 top-0 left-0 bg-[#ffe6cc] rounded-2xl">
          <div className="absolute top-[9px] left-2 [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-base tracking-[0.50px] leading-[13px] whitespace-nowrap">
            🍔
          </div>
        </div>

        <div className="absolute top-2.5 left-11 [font-family:'Poppins-Regular',Helvetica] font-normal text-[#1f384c] text-xs tracking-[0.50px] leading-[13px] whitespace-nowrap">
          쩝쩝박사선생님
        </div>

        <button
          className="absolute top-2 left-[152px] cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="User menu dropdown"
        >
          <img src={ChevronDown}      /* ← 방금 import 한 변수 */ alt="▼"                /* 스크린리더용 대체 텍스트 */ className="absolute w-5 h-5 top-0 left-0"/>
        </button>

        <button
          className="absolute w-[15px] h-[18px] top-1.5 left-[204px] cursor-pointer hover:opacity-80 transition-opacity"
          aria-label="Notifications"
        >
          <img
            className="absolute w-[13px] h-4 top-0.5 left-0"
            alt="Notification icon"
            src={notifIcon}
          />
          <div
            className="absolute w-2 h-2 top-0 left-[7px] bg-[#eb5151] rounded-[4.2px] border-[1.2px] border-solid border-white"
            aria-label="New notifications available"
          />
        </button>
      </div>

      <h1 className="absolute top-[18px] left-[54px] font-['Racing_Sans_One',Helvetica] font-normal text-black text-[28px] text-center tracking-[0.50px] leading-10 whitespace-nowrap">
        EAT PICk
      </h1>
    </nav>
  );
};
export default NavigationSection;