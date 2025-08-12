import React from "react";
import  ApiStatusTableSection  from "../UI/Admin_api_chart";
import  DataVisualizationSection  from "../UI/Admin_bar_chart";

import { NavigationSection } from "../common/menu_bar";
import { AdminNavigationBarSection } from "../common/Admin_menu_bar";

import {useUser} from "../contexts/UserContext";

import FooterSection from "../common/footer";



export const Admin_page = () => {

  
    const { user } = useUser();
    const isAdmin = user.role === "관리자";

  return (

  
    <div>
        {isAdmin ? <AdminNavigationBarSection /> : <NavigationSection />}

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