import React from "react";
import { NavigationSection } from "../common/menu_bar";
import FooterSection from "../common/footer";
import ServiceIntroSection from "../UI/ServiceIntroSection"; 

export const ServicePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavigationSection />
    <div className="my-20">
      <ServiceIntroSection /> 
    </div>

      <FooterSection />
    </div>
  );
};

export default ServicePage;