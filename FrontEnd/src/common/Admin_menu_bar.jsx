import React from "react";
import { ChevronDown } from "./ChevronDown";
import notifIcon from "./notif-icon.svg";

export const NavigationBarSection = () => {
  const navigationItems = [
    {
      text: "메인페이지",
      position: "left-[391px]",
      fontWeight: "font-normal",
      fontFamily: "[font-family:'Noto_Sans_KR-Regular',Helvetica]",
    },
    {
      text: "심층분석페이지",
      position: "left-[590px]",
      fontWeight: "font-normal",
      fontFamily: "[font-family:'Noto_Sans_KR-Regular',Helvetica]",
    },
    {
      text: "서비스소개",
      position: "left-[819px]",
      fontWeight: "font-normal",
      fontFamily: "[font-family:'Noto_Sans_KR-Regular',Helvetica]",
    },
    {
      text: "관리자페이지",
      position: "left-[1018px]",
      fontWeight: "font-black",
      fontFamily: "[font-family:'Noto_Sans_KR-Black',Helvetica]",
    },
  ];

  return (
    <nav
      className="absolute w-[1440px] h-[77px] top-0 left-0 bg-white"
      role="navigation"
      aria-label="Main navigation"
    >
      {navigationItems.map((item, index) => (
        <button
          key={index}
          className={`${item.position} absolute top-[21px] ${item.fontFamily} ${item.fontWeight} text-black text-base tracking-[0] leading-[30px] whitespace-nowrap hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          type="button"
          aria-label={`Navigate to ${item.text}`}
        >
          {item.text}
        </button>
      ))}

      <div className="absolute w-[222px] h-8 top-5 left-[1182px]">
        <div className="absolute w-8 h-8 top-0 left-0 bg-[#ffe6cc] rounded-2xl">
          <div className="absolute top-[9px] left-2 [font-family:'Poppins-Regular',Helvetica] font-normal text-white text-base tracking-[0.50px] leading-[13px] whitespace-nowrap">
            🍔
          </div>
        </div>

        <div className="absolute top-2.5 left-11 [font-family:'Poppins-Regular',Helvetica] font-normal text-[#1f384c] text-xs tracking-[0.50px] leading-[13px] whitespace-nowrap">
          Admin
        </div>

        <ChevronDown className="!absolute !w-5 !h-5 !top-2 !left-[152px]" />

        <button
          className="absolute w-[15px] h-[18px] top-1.5 left-[204px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          type="button"
          aria-label="View notifications"
        >
          <img
            className="absolute w-[13px] h-4 top-0.5 left-0"
            alt="Notification icon"
            src={notifIcon}
          />

          <div
            className="absolute w-2 h-2 top-0 left-[7px] bg-[#eb5151] rounded-[4.2px] border-[1.2px] border-solid border-white"
            aria-label="New notification indicator"
          />
        </button>
      </div>

      <h1 className="top-[18px] left-[54px] [font-family:'Racing_Sans_One-Regular',Helvetica] font-normal text-[28px] text-center tracking-[0.50px] leading-10 absolute text-black whitespace-nowrap">
        EAT PICk
      </h1>
    </nav>
  );
};

export default NavigationBarSection;