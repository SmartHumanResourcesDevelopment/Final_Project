import React from "react";
import { ApiStatusTableSection } from "../UI/Admin_api_chart";
import { DataVisualizationSection } from "../UI/Admin_bar_chart";
import { AdminNavigationBarSection } from "../common/Admin_menu_bar";
// import image from "../assets/imgs/image.svg";
import line2 from "../assets/img/admin/line.png";
import line3 from "../assets/img/admin/line.png";
import line4 from "../assets/img/admin/line.png";
import line5 from "../assets/img/admin/line.png";
import line6 from "../assets/img/admin/line.png";
import line7 from "../assets/img/admin/line.png";
import line from "../assets/img/admin/line.png";



export const Admin_page = () => {

  return (

  
    <div>
        <NavigationSection />

         <main className="flex-grow w-full mt-[25px] pt-[90px] px-4 py-10">
        <div className="max-w-[1200px] mx-auto space-y-10">
        <ApiStatusTableSection />
        <DataVisualizationSection />
        </div>
        </main>
        <FooterSection />

    </div>
  );
};
export default Admin_page;