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

        // 네이버 고유 ID 우선
        const naverId = user.naverId || user.id || "";

        // 1. 사용자 정보 + 토큰 저장 (Context)
        setUser({
          id: user.naverId || "", // 네이버 고유 ID, 핵심 식별자
          naverId,
          nickname: user.nickname || "",
          profileImage: user.profileImage || "", // 없으면 기본 이미지
          phoneNumber: user.mobile || "",
          isLogin: true,
          token: token, // 토큰 저장
        });

        // 2. 토큰 저장 + 인증 헤더 설정
        if (token) {
          localStorage.setItem("jwtToken", token);
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        // 3. 기존 회원 여부 확인 (네이버 고유번호 기준)
        const loginRes = await axios.post("/api/naver-login", {
          naverId
        });

        if (loginRes.data.registered) {
          navigate("/main"); // 기존 회원
        } else {
          navigate("/join", { state: { user:
            { ...user, naverId}} }); // 신규 회원
        }
      } catch (error) {
        console.error("네이버 로그인 처리 중 오류:", error);
        alert("네이버 로그인에 실패했습니다.");
        navigate("/");
      }
    };

    if (code && state) getNaverUser();
  }, []);

  return (
  <div style={{ textAlign: "center", marginTop: "100px" }}>
    <p>로그인 처리 중입니다...</p>
    <img src="/loading_spinner.gif" alt="로딩중" width="50" />
  </div>);
};

export default NaverCallback;
