// src/contexts/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  // 1) 앱 마운트 시에: 토큰을 axios 헤더에 세팅하고, 저장된 유저 정보 읽기
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // 2) user 상태가 바뀔 때마다 localStorage와 axios 헤더 동기화
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else {
      localStorage.removeItem("user");
      localStorage.removeItem("jwtToken");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
