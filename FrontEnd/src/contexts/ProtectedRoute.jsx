// src/contexts/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, initialized } = useUser();

  // 아직 초기화 중이면  null 반환
  if (!initialized) {
    return null; // or <LoadingSpinner />
  }

  // 기화 끝났는데 user가 없으면 로그인 페이지로
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // user가 있으면 원래 경로 렌더
  return children;
};

export default ProtectedRoute;
