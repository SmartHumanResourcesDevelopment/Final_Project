import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login_join_bg_img from "../assets/img/common/login_join_bg_img.png";
import mint_bg_color from "../assets/img/common/mint_bg_color.png";
import google_login from "../assets/img/login_join/google_login.png";
import apple_login from "../assets/img/login_join/apple_login.png";

// CSS 파일 임포트
import "../assets/css/Login.css";

const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login attempt:", { id, password, rememberMe });
    // 여기에 실제 로그인 로직 (API 호출 등)을 추가합니다.
    // 성공 시 navigate("/dashboard"); 등으로 이동.
  };

  const handleGoToJoin = () => navigate("/join");
  const handleForgotPassword = () => alert("비밀번호 재설정 페이지로 이동");
  const handleGoogleLogin = () => console.log("Google login initiated");
  const handleAppleLogin = () => console.log("Apple login initiated");


  return (
    <div className="login-full-screen-container">
      <div className="login-canvas">
        {/* 우측 영역 */}
        <div className="login-right-panel">
          {/* 배경색 + 타일 반복 */}
          <div
            className="login-bg-pattern"
            style={{ backgroundImage: `url(${mint_bg_color})` }}
          />
          {/* 중앙 일러스트 */}
          <img
            src={login_join_bg_img}
            alt="Analysts"
            className="login-main-illustration"
          />
        </div>

        {/* 좌측 정보 영역 */}
        <div className="login-left-panel">
          <div className="login-form-container">
            {/* 타이틀 */}
            <div className="login-title-group">
              <h1 className="login-main-title">만나서 반가워요!🫨</h1>
              <p className="login-sub-title">당신의 아이디를 입력해주세요</p>
            </div>

            {/* 폼 */}
            <form onSubmit={handleLogin} className="login-form">
              {/* 아이디 */}
              <div className="form-group">
                <label htmlFor="id" className="form-label">아이디</label>
                <div className="input-wrapper">
                  <input
                    id="id"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="아이디를 입력해주세요."
                    className="form-input"
                    required
                  />
                </div>
              </div>

              {/* 비밀번호 */}
              <div className="form-group password-group">
                <label htmlFor="password" className="form-label">비밀번호</label>
                <div className="input-wrapper">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요."
                    className="form-input"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="forgot-password-link"
                >
                  비밀번호를 잊어버리셨나요?
                </button>
              </div>

              {/* 30일 저장 */}
              <label htmlFor="rememberMe" className="remember-me-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="custom-checkbox"
                  id="rememberMe"
                />
                30일동안 아이디 저장하기
              </label>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                className="login-button"
              >
                로그인
              </button>
            </form>

            {/* 로그인 ↔ Or ↔ 회원가입 */}
            <div className="login-or-signup-section">
              {/* Or */}
              <div className="divider">
                <span className="divider-line" />
                <span className="divider-text">Or</span>
                <span className="divider-line" />
              </div>

              {/* 회원가입 버튼 */}
              <button
                type="button"
                onClick={handleGoToJoin}
                className="signup-button"
              >
                회원가입
              </button>
            </div>

            {/* SNS 로그인 */}
            <div className="sns-login-buttons">
              <button className="sns-button" onClick={handleGoogleLogin}>
                <img src={google_login} alt="Sign in with Google" />
              </button>
              <button className="sns-button" onClick={handleAppleLogin}>
                <img src={apple_login} alt="Sign in with Apple" />
              </button>
            </div>

            {/* 하단 문구 */}
            <p className="bottom-text">
              아이디가 없으신가요?{" "}
              <button className="signup-link" onClick={handleGoToJoin}>
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