import React from "react";
import { UserProvider } from "./contexts/UserContext";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Join from "./components/Join";
import Main from "./components/Main";
import Sub from "./components/Sub";
import MyPage from "./components/MyPage";
import Admin from "./components/Admin_page";
import ServicePage from "./components/ServicePage";
import ProtectedRoute from "./contexts/ProtectedRoute";
import NaverCallback from "./components/NaverCallback";
import NaverLoginSuccess from "./components/NaverLoginSuccess";
import axios from 'axios';

axios.defaults.baseURL = "http://localhost:8095";
axios.defaults.withCredentials = true;

// Sub 페이지 래퍼 컴포넌트 - state 데이터를 받아서 Sub에 전달
function SubWrapper() {
  const location = useLocation();
  const keywordData = location.state?.keywordData;

  return <Sub keywordData={keywordData} />;
}

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route
            path="/main"
            element={
              <ProtectedRoute>
                <Main />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mypage"
            element={
              <ProtectedRoute>
                <MyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sub"
            element={
              <ProtectedRoute>
                <SubWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/servicepage"
            element={
              <ProtectedRoute>
                <ServicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/naver/callback"
            element={
                <NaverCallback />
            }
          />
          <Route
            path="/login/success"
            element={
            <NaverLoginSuccess />
            } 
          /> 
          
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
