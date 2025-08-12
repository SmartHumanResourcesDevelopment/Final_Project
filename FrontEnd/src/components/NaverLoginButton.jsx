// NaverLoginButton.jsx
import React from 'react';
import naver_login from '../assets/img/login_join/naver_login.png';

const NaverLoginButton = () => {
  const handleNaverLogin = () => {
    // 백엔드가 redirectUri, state 생성 후 바로 네이버 로그인 페이지로 이동시킴
    window.location.href = "http://localhost:8095/zal/auth/naver/login";
  };

  return (
    <button
      onClick={handleNaverLogin}
      className="hover:opacity-80 transition-opacity"
    >
      <img
        src={naver_login}
        alt="네이버 로그인"
        className="w-auto h-auto max-w-[200px]"
      />
    </button>
  );
};

export default NaverLoginButton;
