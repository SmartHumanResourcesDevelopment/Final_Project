// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Join from "./components/Join";
import Main from "./components/Main";
import Sub from "./components/Sub";
import MyPage from "./components/MyPage";
import Sub from "./components/Sub";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/main" element={<Main />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/sub" element={<Sub />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

