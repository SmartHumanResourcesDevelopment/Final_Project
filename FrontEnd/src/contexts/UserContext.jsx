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
    naverId: "",      // 네이버 고유 ID
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
          naverId: decoded.naverId || "",
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
    setUser(initialUser);
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