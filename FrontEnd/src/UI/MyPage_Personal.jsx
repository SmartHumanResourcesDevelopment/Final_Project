// src/UI/MyPage_Profil.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithAuth from "../util/fetchWithAuth";
import defaultUser from "../assets/img/user.png";
import { useUser } from "../contexts/UserContext";

const DEFAULT_PROFILE = "/img/user.png"; // 실제 서버 기본 이미지 경로

const MyPage_Profil = ({ onClose }) => {
  const navigate = useNavigate();
  const { user: contextUser, logout } = useUser();  // ← user를 contextUser로 받음

  useEffect(() => {
    if (!contextUser) navigate("/login");
  }, [contextUser, navigate]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    contextUser?.userProfile || DEFAULT_PROFILE
  );

  const handleProfileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    // 1) 로그인된 유저 없으면 종료
    if (!contextUser) return;

    // 2) 파일이 없으면 모달 닫기만
    if (!selectedFile) {
      onClose();
      return;
    }

    // 3) FormData에 user_id와 file만 담기
    const form = new FormData();
    form.append("user_id", contextUser.userId);  // ← 여기에 실제 userId를 붙여야 합니다
    form.append("file", selectedFile);

    try {
      const res = await fetchWithAuth("/zal/api/updateProfile", {
        method: "POST",
        body: form, // Content-Type 헤더는 fetchWithAuth가 자동 처리
      });

      if (res.ok) {
        const { imageUrl } = await res.json();
        // 4) 컨텍스트와 로컬스토리지 갱신
        const updatedUser = { ...contextUser, userProfile: imageUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        logout();     // 기존 로그인 초기화
        setTimeout(() => { 
          // 다시 로그인 흐름 타서 사용자 정보 갱신
          // 혹은 contextUser를 직접 setUser(updatedUser)로 업데이트
        }, 0);
        onClose();
        navigate("/");
      } else {
        alert("프로필 변경 실패: " + res.status);
      }
    } catch (e) {
      alert("서버 오류 발생: " + e.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl"
        >
          ×
        </button>
        <h2 className="text-center text-2xl mb-6">프로필 사진 변경</h2>
        <div className="w-40 h-40 rounded-full mx-auto mb-6 overflow-hidden border">
          <img
            src={previewUrl}
            alt="프로필 미리보기"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = DEFAULT_PROFILE; }}
          />
        </div>
        <div className="flex flex-col gap-2 mb-6">
          <label className="cursor-pointer bg-gray-100 py-2 px-4 rounded-md text-center">
            사진 선택
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
              className="hidden"
            />
          </label>
        </div>
        <button
          onClick={handleUpdateProfile}
          className="w-full bg-black text-white py-3 rounded-full font-bold"
        >
          수정하기
        </button>
      </div>
    </div>
  );
};

export default MyPage_Profil;
