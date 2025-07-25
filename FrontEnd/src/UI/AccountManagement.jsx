import React, { useState } from "react";
import close from "../assets/img/common/close.png";
import settings from "../assets/img/common/settings.png";
import user from "../assets/img/common/user.png";

import MyPage_Profil from "../UI/MyPage_Profil";
import MyPage_Personal from "../UI/MyPage_Personal";
import MyPage_delete from "../UI/MyPage_delete";

export const AccountManagement = () => {
  const [activeModal, setActiveModal] = useState(null); // "profile" | "personal" | "withdrawal"

  const openModal = (type) => {
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const accountOptions = [
    { id: 1, title: "프로필 수정", icon: user, iconAlt: "User", type: "profile" },
    { id: 2, title: "개인정보 수정", icon: settings, iconAlt: "Settings", type: "personal" },
    { id: 3, title: "회원 탈퇴", icon: close, iconAlt: "Close", type: "delete" },
  ];

  return (
    <section className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-10">
      <h2 className="text-lg font-bold mb-6">계정관리</h2>
      <div className="flex justify-around items-center">
        {accountOptions.map((option, index) => (
          <React.Fragment key={option.id}>
            {/* 첫 번째 제외하고 앞에 선 추가 */}
            {index !== 0 && (
              <div className="w-px h-[80px] bg-gray-300 mx-4" />
            )}

            <div
              className="flex flex-col items-center text-center p-4 flex-1 cursor-pointer"
              onClick={() => openModal(option.type)}
            >
              <img
                src={option.icon}
                className="w-[90px] h-[90px] mb-2"
                alt={option.iconAlt}
              />
              <button
                className="text-[#1f384c] font-medium hover:text-blue-600"
                onClick={() => openModal(option.type)}
              >
                {option.title}
              </button>
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* 팝업 모달 조건부 렌더링 */}
      {activeModal === "profile" && <MyPage_Profil onClose={closeModal} />}
      {activeModal === "personal" && <MyPage_Personal onClose={closeModal} />}
      {activeModal === "delete" && <MyPage_delete onClose={closeModal} />}
    </section>
  );
};

export default AccountManagement;