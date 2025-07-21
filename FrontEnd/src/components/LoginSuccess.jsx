import React from "react";
import { useNavigate } from "react-router-dom";


export const LoginSuccess = () => {
  const navigate = useNavigate();
      const handleLoginClick = (e) => {
        e.preventDefault();
        navigate("/");
      };
  return (
    <div className="relative w-[662px] h-[706px]">
      <div className="fixed w-[662px] h-[706px] top-0 left-0 bg-[#fbffff] rounded-[20px] shadow-[4px_4px_20px_10px_#00000040]">
        <img
          className="absolute w-[474px] h-[285px] top-[210px] left-[94px]"
          alt="Woman with graph chart illustration"
          src="/img/woman-with-graph-chart.png"
        />

        <header className="inline-flex h-[53px] items-start gap-2.5 absolute top-[105px] left-[137px]">
          <h1 className="relative w-fit mt-[-1.00px] mb-[-21.47px] [font-family:'Poppins-Medium',Helvetica] font-medium text-black text-[50px] tracking-[0] leading-[normal]">
            회원가입 완료👏👏
          </h1>
        </header>

        <div className="absolute w-[404px] h-[35px] top-[581px] left-[129px]">
          <div className="relative h-8">
            <button
              onClick={handleLoginClick}
              className="flex w-[404px] h-8 items-center justify-center gap-2.5 pl-2.5 pr-0 py-2.5 relative bg-[#5969cf] rounded-[10px] overflow-hidden border border-solid cursor-pointer hover:bg-[#4a5bb8] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#5969cf] focus:ring-offset-2"
              aria-label="로그인 페이지로 이동"
            >
              <span className="[font-family:'Poppins-Bold',Helvetica] font-bold text-white text-[13px] text-center tracking-[0] leading-[normal]">
                로그인 하러 가기
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSuccess; 
