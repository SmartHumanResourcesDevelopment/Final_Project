import React from "react";
import { NavigationSection } from "../common/menu_bar";
import { AdminNavigationBarSection } from "../common/Admin_menu_bar";

import { useUser } from "../contexts/UserContext";

import FooterSection from "../common/footer";
import ServiceIntroSection from "../UI/ServiceIntroSection"; 

export const ServicePage = () => {

  
    const { user } = useUser();
    const isAdmin = user.role === "관리자";


  return (
    <div className="flex flex-col min-h-screen bg-white">
       {isAdmin ? <AdminNavigationBarSection /> : <NavigationSection />}
    <div className="my-20">
      <ServiceIntroSection /> 
    </div>

      <FooterSection />
    </div>
  );
};

export default ServicePage;