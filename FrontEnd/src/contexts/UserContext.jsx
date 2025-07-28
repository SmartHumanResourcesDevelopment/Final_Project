// src/contexts/UserContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialized, setInitialized] = useState(false); // ← 추가

  // 1) 앱 마운트 시: 토큰 복원 & user 설정
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);
        setUser({
          userId: decoded.sub,
          username: decoded.username,
          phoneNumber: decoded.phoneNumber,
          nickname: decoded.nickname,
          role: decoded.role,
        });
      } catch {
        localStorage.removeItem("jwtToken");
      }
    }
    setInitialized(true); // ← 복원 로직 끝나면 초기화 완료
  }, []);

  // 로그아웃 토큰 지워버러기
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
