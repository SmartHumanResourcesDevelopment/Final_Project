  import React, { useState } from "react";
  import { fetchWithAuth } from "../util/fetchWithAuth";
  import { useUser } from "../contexts/UserContext"; // ← 추가
  import { useNavigate } from "react-router-dom";     // ← 추가

  const MyPage_Personal = ({ onClose }) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [nickname, setNickname] = useState("");
    const { setUser } = useUser();      // ← 추가
    const navigate = useNavigate();     // ← 추가


    
    const handleUpdate = async () => {
      if (password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      try { 
        const user = JSON.parse(localStorage.getItem("user"));
        const user_id = user?.userId;

        const res = await fetchWithAuth("/zal/api/update", {
          method: "POST",
          body: JSON.stringify({
            user_id,
            password,
            username,
            phone_number,
            nickname,
          }),
        });

        if (res.ok) {
          // 1. localStorage와 context에서 토큰/유저 삭제
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("user");
          setUser(null); // ← Context에서 user 상태도 초기화

          // 2. 알림 후 로그인 페이지로 이동
          alert("회원 정보가 변경되어 다시 로그인해야 합니다.");
          navigate("/");
        } else {
          alert("수정에 실패했습니다.");
        }
      } catch (e) {
        alert("서버 오류!");
      }
    };
      return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
        <div className="bg-white rounded-[20px] w-[600px] max-w-full p-8 relative">
          <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold">×</button>
          <h2 className="text-center text-2xl font-bold mb-6">개인정보 수정</h2>
          <div className="space-y-4 mb-6">
            <input
              type="password"
              placeholder="새로운 비밀번호를 입력해주세요"
              className="w-full border rounded-md p-3 text-sm outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="다시 한번 당신의 비밀번호를 입력해주세요"
              className="w-full border rounded-md p-3 text-sm outline-none"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="당신의 이름을 입력해주세요"
              className="w-full border rounded-md p-3 text-sm outline-none"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="text"
              placeholder="당신의 휴대폰번호를 입력해주세요"
              className="w-full border rounded-md p-3 text-sm outline-none"
              value={phone_number}
              onChange={e => setPhoneNumber(e.target.value)}
            />
            <input
              type="text"
              placeholder="닉네임을 입력해주세요"
              className="w-full border rounded-md p-3 text-sm outline-none"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
            />
          </div>
          <button
            onClick={handleUpdate}
            className="w-full bg-black text-white py-4 rounded-full font-bold text-lg"
          >
            수정하기
          </button>
        </div>
      </div>
    );

  };

  export default MyPage_Personal;

