import React from "react";
import close from "../assets/img/common/close.png";
import settings from "../assets/img/common/settings.png";
import user from "../assets/img/common/user.png";

export const AccountManagementSection = () => {
  const accountOptions = [
    { id: 1, title: "프로필 수정", icon: user, iconAlt: "User" },
    { id: 2, title: "개인정보 수정", icon: settings, iconAlt: "Settings" },
    { id: 3, title: "회원 탈퇴", icon: close, iconAlt: "Close" },
  ];

  return (
    <section className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-10">
      <h2 className="text-lg font-bold mb-6">계정관리</h2>
      {/* 바로 여기! 이 div 태그에 divide-x 클래스가 이미 있습니다. */}
      <div className="flex justify-around items-center divide-x divide-gray-300">
        {accountOptions.map((option, index) => (
          <div
            key={option.id}
            className="flex flex-col items-center text-center p-4 flex-1"
          >
            <img src={option.icon} className="w-[90px] h-[90px] mb-2" alt={option.iconAlt} />
            <button className="text-[#1f384c] font-medium hover:text-blue-600">
              {option.title}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AccountManagementSection;