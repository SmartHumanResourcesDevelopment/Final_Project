import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChevronDown from "../assets/img/common/chevron_down.png";
import notifIcon from "../assets/img/common/notif-icon.png";
import { useUser } from "../contexts/UserContext";

export const NavigationSection = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("메인페이지");
  const { user } = useUser();

  const navigationItems = [
    "메인페이지",
    "심층분석페이지",
    "서비스소개",
    "마이페이지",
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 w-full z-50 bg-white shadow"  // ← 항상 상단 고정
    >
      {/* 가운데 정렬용 래퍼 */}
      <div className="container mx-auto flex items-center justify-between h-[77px] px-12">
        {/* 로고 */}
         <h1
          onClick={() => navigate("/main")}
          className="font-['Racing_Sans_One',Helvetica] text-[28px] cursor-pointer select-none"
        >
          EAT PICk
        </h1>

        {/* 메뉴 */}
        <ul className="flex space-x-14">
          {navigationItems.map((label) => (
            <li key={label}>
              <button
                onClick={() => setActiveMenu(label)}
                aria-current={label === activeMenu ? "page" : undefined}
                className={`text-base leading-[30px] hover:opacity-80 transition
                  ${
                    label === activeMenu
                      ? "font-black"
                      : "font-normal"
                  }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* 우측 유저 영역 */}
        <div className="flex items-center gap-4">
          {/* 이모지 아바타 */}
          <div className="w-8 h-8 rounded-2xl bg-[#ffe6cc] grid place-content-center text-white text-base">
            🍔
          </div>

          {/* 닉네임 */}
          <span className="text-xs text-[#1f384c]">{ user.nickname }</span>

          {/* 드롭다운 버튼 */}
          <button
            aria-label="User menu dropdown"
            className="w-5 h-5 hover:opacity-80 transition"
          >
            <img src={ChevronDown} alt="" />
          </button>

          {/* 알림 버튼 */}
          <button
            aria-label="Notifications"
            className="relative w-4 h-4 hover:opacity-80 transition"
          >
            <img src={notifIcon} alt="Notification icon" />
            {/* 빨간 점 */}
            <span className="absolute -top-[2px] -right-[2px] w-2 h-2 bg-[#eb5151] rounded-full border border-white" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavigationSection;
