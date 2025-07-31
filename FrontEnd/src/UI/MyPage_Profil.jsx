// src/UI/MyPage_Profil.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithAuth from "../util/fetchWithAuth";
import defaultUser from "../assets/img/user.png";
import { useUser } from "../contexts/UserContext";

const DEFAULT_PROFILE = defaultUser;

const MyPage_Profil = ({ onClose }) => {
  const navigate = useNavigate();
  const { user: contextUser, setUser, logout } = useUser();  // setUser 추가

  useEffect(() => {
    if (!contextUser) navigate("/");
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

  // 서버에 기본 이미지로 리셋 요청
  const handleDefaultProfile = async () => {
    if (!contextUser) return;

    try {
      const res = await fetchWithAuth(
        `/zal/api/resetProfile?user_id=${encodeURIComponent(contextUser.userId)}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Status ${res.status}: ${text}`);
      }

      const { imageUrl } = await res.json();

      // Context, localStorage에 반영
      const updated = { ...contextUser, userProfile: imageUrl };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);

      // 미리보기 URL도 업데이트
      setSelectedFile(null);
      setPreviewUrl(imageUrl);

      alert("기본 프로필로 변경되었습니다.");
    } catch (e) {
      console.error("리셋 실패:", e);
      alert("기본 이미지로 변경 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateProfile = async () => {
    if (!contextUser) return;

    const form = new FormData();
    form.append("user_id", contextUser.userId);
    if (selectedFile) {
      form.append("file", selectedFile);
    } else {
      form.append("userProfile", DEFAULT_PROFILE);
    }

    try {
      const res = await fetchWithAuth("/zal/api/updateProfile", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("프로필 변경 실패:", res.status, text);
        throw new Error(text || `Status ${res.status}`);
      }

      const { imageUrl } = await res.json();
      const updated = { ...contextUser, userProfile: imageUrl };
      localStorage.setItem("user", JSON.stringify(updated));
      setUser(updated);

      onClose();
      alert("프로필이 변경되었습니다.");
    } catch (e) {
      console.error("네트워크 예외:", e);
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
            onError={(e) => {
              e.currentTarget.src = DEFAULT_PROFILE;
            }}
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
          <button
            className="bg-gray-200 py-2 px-4 rounded-md text-center"
            onClick={handleDefaultProfile}
          >
            기본 이미지로 변경
          </button>
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
