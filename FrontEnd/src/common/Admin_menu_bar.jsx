import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChevronDown from "../assets/img/common/chevron_down.png";
import notifIcon from "../assets/img/common/notif-icon.png";
import { useUser } from "../contexts/UserContext";
import { AnimatePresence, motion } from "framer-motion";

export const AdminNavigationBarSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();

  const [activeMenu, setActiveMenu] = useState("메인페이지");
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 현재 경로에 맞는 메뉴 이름으로 activeMenu 업데이트
  useEffect(() => {
    const pathToMenu = {
      "/main": "메인페이지",
      "/sub": "심층분석페이지",
      "/servicepage": "서비스소개",
      "/admin": "관리자 페이지",
    };
    const currentMenu = pathToMenu[location.pathname] || "메인페이지";
    setActiveMenu(currentMenu);
  }, [location.pathname]);

  // 드롭다운 밖 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open]);

  const navigationItems = [
    "메인페이지",
    "심층분석페이지",
    "서비스소개",
    "관리자 페이지",
  ];

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 w-full z-50 bg-white shadow"
    >
      <div className="container mx-auto flex items-center justify-between h-[77px] px-12">
        {/* 로고 클릭 시 메인페이지 이동 */}
        <h1
          onClick={() => navigate("/main")}
          className="font-['Racing_Sans_One',Helvetica] text-[28px] cursor-pointer select-none"
        >
          EAT PICk
        </h1>

        {/* 메뉴 리스트 */}
        <ul className="flex space-x-14">
          {navigationItems.map((label) => (
            <li key={label}>
              <button
                onClick={() => {
                  setActiveMenu(label);
                  if (label === "메인페이지") navigate("/main");
                  else if (label === "심층분석페이지") navigate("/sub");
                  else if (label === "서비스소개") navigate("/servicepage");
                  else if (label === "관리자 페이지") navigate("/admin");
                }}
                aria-current={label === activeMenu ? "page" : undefined}
                className={`text-base leading-[30px] hover:opacity-80 transition ${
                  label === activeMenu ? "font-black" : "font-normal"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* 우측 유저 영역 */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {/* 프로필 이미지 (관리자용으로 user.userProfile 또는 기본이미지 넣어주세요) */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
            <img
              src={user?.profileImage || "/img/default/admin.png"}
              alt="Admin profile"
              className="w-full h-full object-cover"
            />
          </div>

          {/* 닉네임 */}
          <span className="text-xs text-[#1f384c]">{user?.nickname || "관리자"}</span>

          {/* 드롭다운 버튼 */}
          <button
            aria-label="User menu dropdown"
            className="w-5 h-5 hover:opacity-80 transition"
            onClick={() => setOpen((v) => !v)}
            tabIndex={0}
          >
            <img src={ChevronDown} alt="" />
          </button>

          {/* 드롭다운 박스 */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.17 }}
                className="absolute right-0 top-12 w-40 rounded-2xl shadow-lg bg-white ring-1 ring-black/5 z-50 py-2"
              >
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={logout}
                >
                  로그아웃
                </button>
              </motion.div>
            )}
          </AnimatePresence>

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

export default AdminNavigationBarSection;