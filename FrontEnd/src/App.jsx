// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Join from "./components/Join";
import Main from "./components/Main";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/join" element={<Join />} />
        <Route path="/main" element={<Main />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

