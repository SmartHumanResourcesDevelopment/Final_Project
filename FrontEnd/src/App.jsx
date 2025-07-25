// App.jsx
import React from "react";
import NavigationSection from "./common/menu_bar";
import { UserProvider }  from "./contexts/UserContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Join from "./components/Join";
import Main from "./components/Main";
import Sub from "./components/Sub";
import MyPage from "./components/MyPage";
import Admin from "./components/Admin_page";
import ServicePage from "./components/ServicePage";


function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/main" element={<Main />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/sub" element={<Sub />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/servicepage" element={<ServicePage />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;