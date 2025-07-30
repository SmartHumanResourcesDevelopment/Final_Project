import React from "react";
import { UserProvider } from "./contexts/UserContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Join from "./components/Join";
import Main from "./components/Main";
import Sub from "./components/Sub";
import MyPage from "./components/MyPage";
import Admin from "./components/Admin_page";
import ServicePage from "./components/ServicePage";
import ProtectedRoute from "./contexts/ProtectedRoute";
import NaverCallback from "./components/NaverCallback";
import axios from 'axios';

axios.defaults.baseURL = "http://localhost:8095";
axios.defaults.withCredentials = true;

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
                <Sub />
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
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
