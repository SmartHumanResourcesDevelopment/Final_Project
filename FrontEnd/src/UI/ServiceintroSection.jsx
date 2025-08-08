import React from "react";
import heroImage1 from "../assets/img/common/hero1.png";
import heroImage2 from "../assets/img/common/hero2.png";
import ideaImage from "../assets/img/common/idea.png";
import { useNavigate } from "react-router-dom"; 


export const ServiceIntroSection = () => {

   const navigate = useNavigate();


  return (
    <main className="flex flex-col items-center bg-white">
      {/* 섹션 1: 텍스트 왼쪽, 이미지 오른쪽 */}
      <section className="max-w-[1200px] w-full py-16 px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed">
            바쁜 마케터 여러분, 시장조사로 지치셨죠?<br />
            이제 이 잘파세대의 식문화 트렌드를<br />
           한눈에 정리해드립니다.
          </h2>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <img src={heroImage1} alt="리서치 문서" className="max-w-[400px] w-full" />
        </div>
      </section>

      {/* 섹션 2: 이미지 왼쪽, 텍스트 오른쪽 */}
      <section className="max-w-[1200px] w-full py-16 px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 flex justify-center order-1 md:order-none">
          <img src={heroImage2} alt="트렌드 박스" className="max-w-[300px] w-full" />
        </div>
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed">
            <span className="keywordHighlight">지금 떠오르는 트렌드</span>는 물론,<br />
            다가오는 잠재 트렌드까지 한 번에 파악!
          </h2>
        </div>
      </section>

      {/* 섹션 3: 텍스트 왼쪽, 이미지 오른쪽 */}
      <section className="max-w-[1200px] w-full py-16 px-4 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-2xl md:text-3xl font-semibold leading-relaxed">
            키워드별로 유행 배경, 감성 라벨링, 마케팅 <br/>
            제안 등 아이디어를 바로 활용할 수 있는 간편 기능도 함께 제공합니다.
          </h2>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <img src={ideaImage} alt="아이디어 이미지" className="max-w-[300px] w-full" />
        </div>
      </section>

      {/* CTA 버튼 영역 */}
      <section className="w-full max-w-[1200px] py-16 text-center px-4">
        <h3 className="text-3xl font-bold mb-6">
          <span>
          이제, <span className="italic font-black">EAT PICK</span> 과 함께<br />
          잘파세대 식문화 트렌드를 빠르게 파악해보세요!
        </span>  
        </h3>
        <button className="bg-black text-white text-lg px-8 py-4 rounded-full hover:bg-gray-800 transition"
        onClick={() => navigate("/main")}>
          트렌드 찾으러 가기
        </button>
      </section>
    </main>
  );
};

export default ServiceIntroSection;