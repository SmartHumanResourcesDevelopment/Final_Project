// src/pages/NaverCallback.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import axios from "axios";

const NaverCallback = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    const getNaverUser = async () => {
      try {
        const res = await axios.get("http://localhost:8095/auth/naver/callback", {
          params: { code, state },
          withCredentials: true, // 쿠키 필요
        });

        const data = res.data;
        setUser({
          id: data.id,
          nickname: data.nickname,
          email: data.email,
          profileImage: data.profileImage,
          isLogin: true,
        });

        navigate("/main"); // 로그인 완료 후 이동할 페이지
      } catch (error) {
        console.error("네이버 로그인 실패:", error);
      }
    };

    if (code && state) {
      getNaverUser();
    }
  }, []);

  return <div>로그인 처리 중입니다...</div>;
};

export default NaverCallback;
