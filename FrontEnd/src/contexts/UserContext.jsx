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
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // 앱 마운트 시: 로컬스토리지에서 토큰 꺼내 복원
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      // Axios 기본 헤더에 토큰 설정
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        // 토큰 디코딩
        const decoded = jwtDecode(token);
        // 디코딩된 클레임에서 필요한 필드 꺼내기
        const {
          userId,
          username,
          phoneNumber,
          nickname,
          role,
          userProfile,    // 토큰에 담긴 프로필 경로
        } = decoded;

        // Context 에 저장 (userProfile 기본값 방어)
        setUser({
          userId,
          username,
          phoneNumber,
          nickname,
          role,
          userProfile: userProfile || "/img/user.png",
        });
      } catch (e) {
        console.error("Invalid token:", e);
        // 토큰이 유효하지 않으면 초기화
        localStorage.removeItem("jwtToken");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
      }
    }
    setInitialized(true);
  }, []);

  // 로그아웃: 토큰/헤더/Context 초기화
  const logout = () => {
    localStorage.removeItem("jwtToken");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
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
