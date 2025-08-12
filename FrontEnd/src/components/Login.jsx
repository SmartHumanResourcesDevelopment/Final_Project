import axios from "axios";
//npm install jwt-decode
import {jwtDecode} from "jwt-decode";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import google_login from "../assets/img/login_join/google_login.png";
import login_join_bg_img from "../assets/img/common/login_join_bg_img.png";
import mint_bg_color from "../assets/img/common/mint_bg_color.png";
import "../assets/css/Login.css"; // 경로 주의
import { useUser } from "../contexts/UserContext";
import NaverLoginButton from "./NaverLoginButton";

// 쿠키 관리 유틸리티 함수
const CookieUtils = {
  setCookie: (name, value, days = 30) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
    console.log("🍪 쿠키 저장:", name, value);
  },

  getCookie: (name) => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
        console.log("🍪 쿠키 읽기:", name, value);
        return value;
      }
    }
    return null;
  },

  deleteCookie: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    console.log("🍪 쿠키 삭제:", name);
  }
};

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useUser();

  // 컴포넌트 마운트 시 저장된 아이디 불러오기
  useEffect(() => {
    const savedId = CookieUtils.getCookie('savedUserId');
    if (savedId) {
      setId(savedId);
      setRememberMe(true);
      console.log("💾 저장된 아이디 불러오기:", savedId);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("🔐 로그인 시도:", { id, rememberMe });

      const data = await login({ id, password });
      if (!data.success) {
        alert(`로그인 실패: ${data.message}`);
        return navigate("/");
      }

      const { token } = data;

      // 로그인 성공 시 아이디 저장 처리
      if (rememberMe) {
        CookieUtils.setCookie('savedUserId', id, 30); // 30일 저장
        console.log("✅ 아이디 저장 완료:", id);
      } else {
        CookieUtils.deleteCookie('savedUserId');
        console.log("🗑️ 저장된 아이디 삭제");
      }

      // 토큰만 저장
      localStorage.setItem("jwtToken", token);

      // axios 기본 헤더 설정
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 토큰에서 유저 정보 디코딩 후 Context에 설정
      const decoded = jwtDecode(token);
      setUser({
        userId: decoded.sub,
        username: decoded.username,
        phoneNumber: decoded.phoneNumber,
        nickname: decoded.nickname,
        role: decoded.role,
        isLogin: true,
        userProfile: decoded.userProfile
      });

      console.log("✅ 로그인 성공, 메인 페이지로 이동");
      // 메인 페이지로 이동
      navigate("/main");
    } catch (error) {
      console.error("❌ 로그인 중 오류:", error);
      alert("서버 오류로 로그인에 실패했습니다.");
      navigate("/");
    }
  };

  // 아이디 저장 체크박스 변경 처리
  const handleRememberMeChange = (e) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    console.log("📋 아이디 저장 체크박스 변경:", checked);

    // 체크 해제 시 즉시 저장된 아이디 삭제
    if (!checked) {
      CookieUtils.deleteCookie('savedUserId');
      console.log("🗑️ 체크 해제로 인한 저장된 아이디 삭제");
    }
  };

  const handleGoToJoin = () => navigate("/join");

  // 비밀번호 찾기 클릭 처리
  const handleForgotPassword = () => {
    alert("준비되지 않은 기능입니다.\n관리자에게 문의하세요.");
    console.log("🔒 비밀번호 찾기 기능 요청 - 미구현");
  };

  return (
    <div className="relative bg-white w-full min-h-screen mx-auto overflow-hidden">
      {/* 우측 배경 + 이미지 */}
      <div className="absolute inset-y-0 right-0 w-1/2 h-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-[#E9FFFF] bg-repeat-x bg-top"
          style={{
            backgroundImage: `url(${mint_bg_color})`,
            backgroundSize: "320px 100%",
          }}
        />
        <img
          src={login_join_bg_img}
          alt="Illustration"
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
                  onClick={handleForgotPassword}
                  className="absolute top-0 right-0 text-[11px] text-action-sec hover:underline"
                >
                  비밀번호를 잊어버리셨나요?
                </button>
              </div>

              {/* 아이디 저장 */}
              <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleRememberMeChange}
                className="w-5 h-5 border border-gray-300 rounded-sm accent-blue-500 cursor-pointer appearance-auto"
                id="rememberMe"
              />
                아이디 저장하기 (30일)
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
                {/* 네이버 로그인 버튼 컴포넌트 */}
                <NaverLoginButton />
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

  );
};

export default Login;