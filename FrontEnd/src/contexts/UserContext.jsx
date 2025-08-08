// src/contexts/UserContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";  
export const UserContext = createContext();

export function UserProvider({ children }) {
  const initialUser = {
    id: "",           // 사용자 ID
    naverlogincheck: "",      // 네이버 고유 ID
    username: "",     // 이름
    nickname: "",     // 닉네임
    phoneNumber: "",  // 전화번호
    email: "",        // 이메일
    profileImage: "", // 프로필 경로
    role: "",         // 역할
    isLogin: false,
    token: "",        // 토큰
  };
  const [user, setUser] = useState(initialUser);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);

        // ② sub → userId 로 매핑
        const userData = {
          id: decoded.sub || "",
          naverlogincheck: decoded.naverlogincheck || "",
          username: decoded.username || "",
          nickname: decoded.nickname || "",
          phoneNumber: decoded.phoneNumber || "",
          email: decoded.email || "",
          profileImage: decoded.userProfile || "",
          role: decoded.role || "",
          isLogin: true,
          token: token,
        };

        setUser(userData);

      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem("jwtToken");
        delete axios.defaults.headers.common["Authorization"];
        setUser(initialUser);
      }
    }
    setInitialized(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("jwtToken");
    delete axios.defaults.headers.common["Authorization"];

    // 사용자 정보 완전 초기화 (새 객체로 생성)
    setUser(() => ({
      id: "",
      naverlogincheck: "",
      username: "",
      nickname: "",
      phoneNumber: "",
      email: "",
      profileImage: "",
      role: "",
      isLogin: false,
      token: "",
    }));

    // 추가 정리 작업
    sessionStorage.clear(); // 세션 스토리지도 정리

    console.log("로그아웃 완료 - 사용자 정보 초기화됨");
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, initialized, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}