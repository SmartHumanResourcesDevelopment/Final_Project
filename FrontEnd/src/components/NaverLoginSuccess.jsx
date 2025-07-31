import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const NaverLoginSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      // 1. 저장
      localStorage.setItem("jwtToken", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // 2. 디코딩하여 context 저장
      try {
        const decoded = jwtDecode(token);
        setUser({
          userId: decoded.sub,
          username: decoded.username,
          phoneNumber: decoded.phoneNumber,
          nickname: decoded.nickname,
          role: decoded.role,
          userProfile: decoded.userProfile,
          token: token,
          isLogin: true,
        });
      } catch (err) {
        console.error("JWT 디코딩 실패:", err);
        localStorage.removeItem("jwtToken");
      }

      // 3. 메인 페이지로 이동
      navigate("/main");
    } else {
      alert("JWT 토큰이 전달되지 않았습니다.");
      navigate("/");
    }
  }, [location]);

  return <div>로그인 처리 중입니다...</div>;
};

export default NaverLoginSuccess;
