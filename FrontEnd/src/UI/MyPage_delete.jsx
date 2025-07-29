// src/UI/MyPage_delete.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import fetchWithAuth from "../util/fetchWithAuth";
import { useUser } from "../contexts/UserContext";

const MyPage_delete = ({ onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const handleWithdraw = async () => {
    if (!user) return;

    try {
      const res = await fetchWithAuth(
        `/zal/api/delete?userId=${encodeURIComponent(user.userId)}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }

      alert("탈퇴 처리되었습니다.");

      // 로그아웃 및 Context/Storage 정리
      logout();
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      
      // 모달 닫고 로그인 페이지로 이동
      onClose();
      navigate("/");
    } catch (e) {
      console.error("회원 탈퇴 실패:", e);
      alert("탈퇴 중 오류가 발생했습니다.\n" + e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-10 w-[600px] relative text-center">
        <p className="text-xl font-bold mb-10">
          탈퇴 시 계정 정보가 모두 삭제됩니다.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleWithdraw}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full"
          >
            탈퇴
          </button>
          <button
            onClick={onClose}
            className="bg-black text-white font-bold py-3 px-8 rounded-full"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage_delete;
