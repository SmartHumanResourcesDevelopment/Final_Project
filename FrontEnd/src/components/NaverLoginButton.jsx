// NaverLoginButton.jsx
import React from 'react';

const NaverLoginButton = () => {
  const handleNaverLogin = () => {
    // 백엔드가 redirectUri, state 생성 후 바로 네이버 로그인 페이지로 이동시킴
    window.location.href = "http://localhost:8095/zal/auth/naver/login";
  };

  return (
    <button
      onClick={handleNaverLogin}
      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
    >
      네이버 로그인
    </button>
  );
};

export default NaverLoginButton;
