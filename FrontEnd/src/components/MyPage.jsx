
import React from "react";
import { AccountManagementSection } from "../UI/AccountManagement";
import { ActivityFeedSection } from "../UI/MyFeed";
import { NavigationSection } from "../common/menu_bar";
import FooterSection from "../common/footer";
import "../assets/css/MyPage.css"

export const MyPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavigationSection />

      {/* main 태그에 mt-[200px]를 추가하여 상단에서 200px만큼 더 떨어지게 합니다. */}
      {/* pt-[90px]는 내비게이션과의 겹침 방지용으로 유지합니다. */}
      {/* px-4 py-10은 main 내부 콘텐츠의 좌우/상하 패딩입니다. */}
      <main className="flex-grow w-full mt-[25px] pt-[90px] px-4 py-10">
        <div className="max-w-[1200px] mx-auto space-y-10">
          <AccountManagementSection />
          <ActivityFeedSection />
        </div>
      </main>

      <FooterSection />
    </div>
  );
};

export default MyPage;