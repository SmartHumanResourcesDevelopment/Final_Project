import React from "react";
import { AccountManagementSection } from "../UI/AccountManagement";
import { ActivityFeedSection } from "../UI/MyFeed";
import { NavigationSection } from "../common/menu_bar";

export const MyPage = () => {
  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1440px] h-[960px] relative">
        <NavigationSection />

        <div className="absolute w-[1396px] h-[302px] top-[164px] left-[26px]">
          <div className="top-[119px] [font-family:'Poppins-Black',Helvetica] font-black text-black text-2xl leading-[22px] absolute left-6 tracking-[0.50px] whitespace-nowrap">
            {""}
          </div>
          <AccountManagementSection />
        </div>

        <ActivityFeedSection />
      </div>
    </div>
  );
};

export default MyPage;
