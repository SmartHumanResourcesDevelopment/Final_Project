// src/contexts/UserContext.jsx
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    nickname: "null" // 임시 설정값으로
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// 훅 바로 사용하게 export 함
export const useUser = () => useContext(UserContext);
