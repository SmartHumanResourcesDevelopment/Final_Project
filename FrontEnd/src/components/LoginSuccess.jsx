import React from "react";
import { useNavigate } from "react-router-dom";
import loginJoinImg from "../assets/img/login_join/login_success.png";

export const LoginSuccess = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => navigate("/");

  return (
    // ① 오버레이: fixed → flex 중앙 정렬
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      {/* ② 모달 박스: 너비만 고정, 높이는 컨텐츠에 맞게 */}
      <div
        className="
          w-[500px]             /* 가로 고정 */
          max-h-[90vh]          /* 화면 높이 90% 내에서 */
          bg-[#fbffff] 
          rounded-[20px] 
          shadow-[4px_4px_20px_8px_#00000030]
          overflow-hidden       /* 내부만 스크롤 */
          flex flex-col
        "
      >
        {/* ③ 내부 패딩 + 스크롤 영역 */}
        <div
          className="
            px-8 py-10 flex flex-col items-center gap-6
            overflow-y-auto      /* 내용이 길어지면 스크롤 */
            scrollbar-thin       /* (선택) 스크롤바 얇게 */
          "
        >
          {/* 타이틀 */}
          <h1 className="text-[32px] font-semibold text-center">
            회원가입 완료 <span role="img" aria-label="축하">👏👏</span>
          </h1>

          {/* 일러스트 */}
          <img
            src={loginJoinImg}
            alt="가입 축하 일러스트"
            className="w-4/5 max-w-[350px] h-auto object-contain"
          />

          {/* 로그인 버튼 */}
          <button
            onClick={handleLoginClick}
            className="
              w-full           /* px-8 상단 패딩을 감안해 꽉 채움 */
              h-9 
              bg-[#5969cf] 
              rounded-[10px]
              text-white 
              font-bold 
              hover:bg-[#4a5bb8] 
              transition-colors
            "
          >
            로그인 하러 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess;
