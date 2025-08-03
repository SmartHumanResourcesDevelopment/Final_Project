// src/components/NaverLoginSuccess.jsx
import { useEffect, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { UserContext } from "../contexts/UserContext"; 

const NaverLoginSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (!token) {
      alert("토큰이 없습니다. 로그인 페이지로 이동합니다.");
      navigate("/");
      return;
    }

    try {
      // 1️⃣ 토큰 저장
      localStorage.setItem("jwtToken", token);

      // 2️⃣ axios 기본 헤더 설정
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 3️⃣ 토큰 디코딩 → Context 갱신
      const decoded = jwtDecode(token);
      console.log("로그인 성공:", decoded);

      setUser({
        userId: decoded.sub,
        username: decoded.username,
        nickname: decoded.nickname,
        phoneNumber: decoded.phoneNumber,
        role: decoded.role,
        userProfile: decoded.userProfile,
        token: token,
        isLogin: true,
      });

      // 4️⃣ 메인 페이지 이동
      navigate("/main");
    } catch (error) {
      console.error("JWT 처리 중 오류:", error);
      alert("로그인 처리 중 오류가 발생했습니다.");
      navigate("/");
    }
  }, []);

  return <div>로그인 처리 중입니다. 잠시만 기다려 주세요...</div>;
};

export default NaverLoginSuccess;
