import React from "react";
import { useNavigate } from "react-router-dom";
import login_join_bg_img from "../assets/img/common/login_join_bg_img.png";
import mint_bg_color from "../assets/img/common/mint_bg_color.png";

export const LoginSuccess = () => {
  const navigate = useNavigate();
  const handleLoginClick = () => navigate("/");

  return (
    /* ① 오버레이 : 뷰포트 100% 덮고 정확히 중앙 정렬 */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      {/* ② 모달 박스 : 500×450px, 둥근 모서리 + 그림자 */}
      <div className="w-[500px] h-[450px] bg-[#fbffff] rounded-[20px] shadow-[4px_4px_20px_8px_#00000030] flex flex-col items-center py-10 px-8 gap-6">
        
        {/* ③ 타이틀 */}
        <h1 className="text-[32px] font-semibold text-center">
          회원가입 완료 <span role="img" aria-label="축하">👏👏</span>
        </h1>

        {/* ④ 일러스트(가로 80%) */}
        <img
          src={login_join_bg_img}
          alt="Woman with graph chart"
          className="w-4/5 max-w-[350px] h-auto object-contain"
        />

        {/* ⑤ 로그인 버튼 */}
        <button
          onClick={handleLoginClick}
          className="w-3/4 h-9 bg-[#5969cf] rounded-[10px] text-white font-bold hover:bg-[#4a5bb8] transition-colors"
        >
          로그인 하러 가기
        </button>
      </div>
    </div>
  );
};

export default LoginSuccess;
