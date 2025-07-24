import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi"; 
import login_join_bg_img from "../assets/img/common/login_join_bg_img.png";
import mint_bg_color from "../assets/img/common/mint_bg_color.png"
import google_login from "../assets/img/login_join/google_login.png" // Assuming you have an image for the background
import apple_login from "../assets/img/login_join/apple_login.png" // Assuming you have an image for the background

export const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login({ id, password });
      if (response.success) {
        console.log("로그인 성공:", response.user);
        alert("로그인 성공!");
        navigate("/main"); // 홈 또는 마이페이지 이동
      } else {
        alert(`로그인 실패: ${response.message}`);
      }
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      alert("서버 오류로 로그인에 실패했습니다.");
    }
  };
  const handleGoToJoin = () => navigate("/join");

  return (
    /* ① 전체 화면 세로 중앙 */
    <div className="bg-white flex flex-col items-center justify-center min-h-screen w-full font-poppins">
      {/* ② 1440×720(2:1) 캔버스 */}
      <div className="relative bg-white
            w-full  h-[650px] lg:h-[692px] mx-auto overflow-hidden">
       {/* ───── 우측 영역 ───── */}
        <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-center overflow-hidden">

          {/* 1) 배경색 + 타일 반복 */}
          <div
            className="absolute inset-0 bg-[#E9FFFF] bg-repeat-x bg-top"   /* 파스텔 배경·가로 반복·상단 정렬 */
            style={{
              backgroundImage: `url(${mint_bg_color})`,  // React 변수를 사용해야 빌드 시 경로가 정확히 매핑됩니다
              backgroundSize : "320px 100%",          // 가로 320 px, 세로 100 %
            }}
          />

          {/* 2) 중앙 일러스트 */}
          <img
            src={login_join_bg_img}
            alt="Analysts"
            className="relative z-10 w-[85%] max-w-[640px] h-auto object-contain"
          />
        </div>

        {/* ─── 좌측 정보 영역 ─── */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 flex justify-center">
          <div className="w-[540px] flex flex-col items-start gap-1">

            {/* 타이틀 */}
            <div className="space-y-4">
              <h1 className="text-[32px] font-semibold">만나서 반가워요!🫨</h1>
              <p className="text-[15px] font-medium ">당신의 아이디를 입력해주세요</p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleLogin} className="w-full space-y-4 mt-5">
              {/* 아이디 */}
              <div>
                <label className="block mb-1 text-sm font-medium">아이디</label>
                <div className="flex items-center h-12 pl-3 rounded-lg border border-solid border-gray-300 bg-white focus-within:border-[#5969cf]">
                  <input
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="아이디를 입력해주세요."
                    className="w-full text-[14px] placeholder:text-gray-400 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="relative">
                <label className="block mb-1 text-sm font-medium">비밀번호</label>
                <div className="flex items-center h-12 pl-3 rounded-lg border border-solid border-gray-300 bg-white focus-within:border-[#5969cf]">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요."
                    className="w-full text-[14px] placeholder:text-gray-400 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="button"
                  className="absolute top-0 right-0 text-[11px] text-action-sec hover:underline"
                >
                  비밀번호를 잊어버리셨나요?
                </button>
              </div>

              {/* 30일 저장 */}
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 border border-gray-300 rounded-sm accent-blue-500 cursor-pointer appearance-auto"
                id="rememberMe"
              />
                30일동안 아이디 저장하기
              </label>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                className="h-9 w-full rounded-md bg-[#5969cf] font-semibold text-white hover:bg-[#4a5bb8] transition-colors mb-0"
              >
                로그인
              </button>
            </form>

            {/* 로그인 ↔ Or ↔ 회원가입 (간격 4 px) */}
            <div className="w-full flex flex-col gap-1">
              {/* Or */}
              <div className="flex items-center">
                <span className="flex-1 h-px bg-gray-300" />
                <span className="px-2 text-[13px] font-medium bg-white">Or</span>
                <span className="flex-1 h-px bg-gray-300" />
              </div>

              {/* 회원가입 버튼 */}
              <button
                type="button"
                onClick={handleGoToJoin}
                className="h-9 w-full rounded-md bg-[#5969cf] font-semibold text-white hover:bg-[#4a5bb8] transition-colors"
              >
                회원가입
              </button>
            </div>

            {/* SNS 로그인 */}
              <div className="flex justify-center gap-6 w-full mt-10">
                <button className="w-[190px] hover:opacity-80" onClick={() => console.log("Google login")}>
                  <img src={google_login} alt="Sign in with Google" />
                </button>
                <button className="w-[190px] hover:opacity-80" onClick={() => console.log("Apple login")}>
                  <img src={apple_login} alt="Sign in with Apple" />
                </button>
              </div>

            {/* 하단 문구 */}
            <p className="w-full text-[13px] font-medium mt-4 text-center">
              아이디가 없으신가요?{" "}
              <button className="text-[#0f3cde] hover:underline" onClick={handleGoToJoin}>
                회원가입
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
