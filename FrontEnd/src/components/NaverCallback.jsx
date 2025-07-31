// src/components/NaverCallback.jsx
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
        const res = await axios.get("/zal/auth/naver/callback", {
          params: { code, state },
        });

        const data = res.data;
        const { token, user } = data;

        // 1. 사용자 정보 + 토큰 저장 (Context)
        setUser({
          id: user.id || "", // 없으면 빈 문자열
          nickname: user.nickname || "",
          profileImage: user.profileImage || "", // 없으면 기본 이미지
          phoneNumber: user.mobile || "", // 핵심 식별자
          isLogin: true,
          token: token, // 토큰 저장
        });

        // 2. 토큰 저장 + 인증 헤더 설정
        localStorage.setItem("jwtToken", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // 3. 기존 회원 여부 확인 (전화번호 기준)
        const loginRes = await axios.post("/api/naver-login", {
          mobile: user.mobile,
        });

        if (loginRes.data.registered) {
          navigate("/main"); // 기존 회원
        } else {
          navigate("/join", { state: { user } }); // 신규 회원
        }
      } catch (error) {
        console.error("네이버 로그인 처리 중 오류:", error);
        alert("네이버 로그인에 실패했습니다.");
        navigate("/");
      }
    };

    if (code && state) {
      getNaverUser();
    }
  }, []);

  return <div>로그인 처리 중입니다...</div>;
};

export default NaverCallback;
