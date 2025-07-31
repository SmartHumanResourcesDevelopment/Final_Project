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

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);

        // ② sub → userId 로 매핑
        const userId      = decoded.sub;
        const username    = decoded.username;    // 커스텀 클레임으로 넣으셨다면
        const phoneNumber = decoded.phoneNumber; // 마찬가지
        const nickname    = decoded.nickname;
        const role        = decoded.role;
        const userProfile = decoded.userProfile; // "/uploads/..."

        setUser({
          userId,
          username,
          phoneNumber,
          nickname,
          role,
          userProfile,
        });
      } catch (e) {
        console.error("Invalid token:", e);
        localStorage.removeItem("jwtToken");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
      }
    }
    setInitialized(true);
  }, []);

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