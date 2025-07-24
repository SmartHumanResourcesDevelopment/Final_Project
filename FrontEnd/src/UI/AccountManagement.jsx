import React from "react";
import close from "../assets/img/common/close.png";
import line47 from "../assets/img/common/line-47.png";
import line48 from "../assets/img/common/line-48.png";
import settings from "../assets/img/common/settings.png";
import user from "../assets/img/common/user.png";

export const AccountManagementSection = () => {
  const accountOptions = [
    {
      id: 1,
      title: "프로필 수정",
      icon: user,
      iconAlt: "User",
      leftPosition: "172px",
      textLeftPosition: "168px",
    },
    {
      id: 2,
      title: "개인정보 수정",
      icon: settings,
      iconAlt: "Settings",
      leftPosition: "644px",
      textLeftPosition: "638px",
    },
    {
      id: 3,
      title: "회원 탈퇴",
      icon: close,
      iconAlt: "Close",
      leftPosition: "1116px",
      textLeftPosition: "1125px",
    },
  ];

  const dividerLines = [
    {
      id: 1,
      src: line47,
      leftPosition: "451px",
    },
    {
      id: 2,
      src: line48,
      leftPosition: "936px",
    },
  ];

  return (
    <section
      className="absolute w-[1396px] h-[302px] top-0 left-0"
      role="region"
      aria-labelledby="account-management-title"
    >
      <div className="relative w-[1388px] h-[302px] bg-white shadow-[1px_1px_1px_2px_#0000001a]">
        <h2
          id="account-management-title"
          className="top-[23px] [font-family:'Poppins-Medium',Helvetica] font-medium text-[#1f384c] text-lg leading-[23px] absolute left-6 tracking-[0.50px] whitespace-nowrap"
        >
          계정관리
        </h2>

        {accountOptions.map((option) => (
          <div key={option.id} className="group cursor-pointer">
            <button
              className="top-[229px] [font-family:'Noto_Sans_KR-Medium',Helvetica] whitespace-nowrap absolute font-medium text-[#1f384c] text-lg tracking-[0.50px] leading-[23px] hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              style={{ left: option.textLeftPosition }}
              aria-label={option.title}
            >
              {option.title}
            </button>

            <img
              className="absolute w-[90px] h-[90px] top-[94px] group-hover:scale-105 transition-transform duration-200"
              style={{ left: option.leftPosition }}
              alt={option.iconAlt}
              src={option.icon}
            />
          </div>
        ))}

        {dividerLines.map((line) => (
          <img
            key={line.id}
            className="absolute w-px h-[253px] top-[27px] object-cover"
            style={{ left: line.leftPosition }}
            alt="Divider line"
            src={line.src}
          />
        ))}
      </div>
    </section>
  );
};

export default AccountManagementSection;
