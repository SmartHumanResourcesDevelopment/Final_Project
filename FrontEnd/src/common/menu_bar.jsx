import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ChevronDown from "../assets/img/common/chevron_down.png";
import notifIcon from "../assets/img/common/notif-icon.png";
import { useUser } from "../contexts/UserContext";
import { AnimatePresence, motion } from "framer-motion";
import { buildProfileUrl } from "../util/buildProfileUrl";
import { mainApiService } from "../api/mainApi";



export const NavigationSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUser();


  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);


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
    "마이페이지",
  ];

  const pathToMenu = {
    "/main": "메인페이지",
    "/sub": "심층분석페이지",
    "/servicepage": "서비스소개",
    "/mypage": "마이페이지",
  };
  const currentMenu = pathToMenu[location.pathname] || "메인페이지";

  // 랜덤 키워드로 심층분석 페이지 이동
  const handleRandomAnalysis = async () => {
    try {
      setIsLoadingRandom(true);
      console.log("🎲 랜덤 키워드로 심층분석 페이지 이동 시작");

      const randomKeywordData = await mainApiService.getRandomKeyword();

      if (randomKeywordData && randomKeywordData.keyword) {
        console.log("✅ 랜덤 키워드 조회 성공:", randomKeywordData.keyword);

        // 랜덤 키워드도 최근 검색 키워드에 추가
        if (window.addRecentKeyword) {
          window.addRecentKeyword(randomKeywordData.keyword);
          console.log("💾 랜덤 키워드를 최근 검색에 추가:", randomKeywordData.keyword);
        }

        // Sub 페이지로 이동하면서 키워드 데이터 전달
        navigate('/sub', {
          state: {
            keywordData: {
              keyword: randomKeywordData.keyword,
              ranking: randomKeywordData.ranking ?
                       (typeof randomKeywordData.ranking === 'number' ?
                        `${randomKeywordData.ranking}위` : randomKeywordData.ranking) :
                       "순위 정보 없음",
              emotionLabels: randomKeywordData.emotionLabels || ["감정", "분석", "정보", "없음", "~"],
              description: randomKeywordData.description || "랜덤으로 선택된 키워드입니다.",
              trendExplanation: randomKeywordData.trendExplanation || "트렌드 분석 정보를 로딩 중입니다.",
              similarityInfo: randomKeywordData.similarityInfo || {},
              similarKeywords: randomKeywordData.similarKeywords || [],
              sentimentAnalysis: randomKeywordData.sentimentAnalysis,
              positiveComments: randomKeywordData.positiveComments || [],
              negativeComments: randomKeywordData.negativeComments || []
            }
          }
        });
      } else {
        console.error("❌ 랜덤 키워드 데이터가 없습니다.");
        // 데이터가 없어도 기본 Sub 페이지로 이동
        navigate("/sub");
      }
    } catch (error) {
      console.error("❌ 랜덤 키워드 조회 실패:", error);
      // 에러 시에도 기본 Sub 페이지로 이동
      navigate("/sub");
    } finally {
      setIsLoadingRandom(false);
    }
  };

  return (
    
    <nav
      role="navigation"
      aria-label="Main navigation"
      className="fixed top-0 left-0 w-full z-50 bg-white shadow"
    >
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
                onClick={() => {
                  if (label === "메인페이지") navigate("/main");
                  if (label === "심층분석페이지") handleRandomAnalysis();
                  if (label === "서비스소개") navigate("/servicepage");
                  if (label === "마이페이지") navigate("/mypage");
                }}
                aria-current={label === currentMenu ? "page" : undefined}
                className={`text-base leading-[30px] hover:opacity-80 transition ${
                  label === currentMenu ? "font-black" : "font-normal"
                } ${label === "심층분석페이지" && isLoadingRandom ? "opacity-50" : ""}`}
                disabled={label === "심층분석페이지" && isLoadingRandom}
              >
                {label === "심층분석페이지" && isLoadingRandom ? "🎲 키워드 선택 중..." : label}
              </button>
            </li>
          ))}
        </ul>

        {/* 우측 유저 영역 */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>
          {/* 프로필 이미지 */}
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-100">
            <img
                src={buildProfileUrl(user?.userProfile)}
                alt="User profile"
                className="w-full h-full object-cover"
                // onError={(e) => {
                //   e.currentTarget.onerror = null;
                //   e.currentTarget.src = buildProfileUrl(); // 기본 이미지 URL
                // }}
              />
          </div>

          {/* 닉네임 */}
          <span className="text-xs text-[#1f384c]">{user?.nickname}</span>

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

export default NavigationSection;
