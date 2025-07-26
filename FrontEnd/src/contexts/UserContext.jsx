// src/contexts/UserContext.jsx
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id : "null", // 임시 설정값
    nickname : "null", // 임시 설정값
    email : "null",  // 임시 설정값
    profileImage : "null", // 임시 설정값
    isLogin : "false" // 로그인 상태
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 훅 바로 사용하게 export 함
export const useUser = () => useContext(UserContext);
