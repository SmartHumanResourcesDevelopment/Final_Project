import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { id, password, rememberMe });
  };

   const navigate = useNavigate();
    const handleGoToJoin = (e) => {
      e.preventDefault();
      navigate("/join");
    };

  return (
    <div
      className="bg-white flex flex-row justify-center w-full"
      data-model-id="318:669"
    >
      <div className="bg-white w-[1440px] h-[960px] relative">
        <div className="absolute w-[418px] h-3.5 top-[572px] left-[165px]">
          <div className="relative w-[401px] h-3.5 left-2">
            <img
              className="absolute w-[401px] h-0.5 top-2 left-0"
              alt="Line"
              src="/img/line-2.png"
            />

            <div className="flex w-5 items-center justify-center gap-2.5 px-[3px] py-0 absolute top-0 left-[191px] bg-white">
              <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-black text-[12px] tracking-[0] leading-[normal]">
                Or
              </div>
            </div>
          </div>
        </div>

        <div className="absolute w-[720px] h-[960px] top-0 left-[720px] bg-[url(/img/rectangle-9.png)] bg-[100%_100%]">
          <img
            className="absolute w-[704px] h-[736px] top-[185px] left-4"
            alt="Analysts"
            src="/img/analysts-strategizing-with-graphs-and-metrics.png"
          />
        </div>

        <header className="inline-flex h-[53px] items-start gap-2.5 absolute top-[202px] left-[234px]">
          <h1 className="relative w-fit mt-[-1.00px] text-black text-[32px] [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal]">
            만나서 반가워요!🫨
          </h1>
        </header>

        <p className="absolute w-[372px] top-[263px] left-[174px] text-black text-base [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal]">
          당신의 아이디를 입력해주세요
        </p>

        <form onSubmit={handleLogin}>
          <div className="top-[341px] left-[174px] flex flex-col w-[404px] h-[59px] items-start absolute">
            <label className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
              <span className="text-black text-sm relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal]">
                아이디
              </span>
            </label>

            <div className="flex items-center gap-2.5 pl-2.5 pr-0 py-2.5 rounded-[10px] overflow-hidden border border-solid border-[#d9d9d9] w-[404px] h-12 relative">
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="아이디를 입력해주세요."
                className="text-black text-[14px] relative w-full mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted"
                required
              />
            </div>
          </div>

          <div className="absolute w-[404px] h-[60px] top-[419px] left-[174px]">
            <div className="top-px left-0 flex flex-col w-[404px] h-[59px] items-start absolute">
              <label className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
                <span className="text-black text-sm relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal]">
                  비밀번호
                </span>
              </label>

              <div className="flex items-center gap-2.5 pl-2.5 pr-0 py-2.5 rounded-[10px] overflow-hidden border border-solid border-[#d9d9d9] w-[404px] h-12 relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력해주세요."
                  className="text-black text-[14px] relative w-full mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              className="absolute top-0 left-[275px] text-action-sec text-[11px] [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal] hover:underline"
            >
              비밀번호를 잊어버리셨나요?
            </button>
          </div>

          <div className="absolute w-[200px] h-[20px] top-[498px] left-[174px]">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-5 h-5 border border-gray-300 rounded-sm accent-blue-500 cursor-pointer appearance-auto"
                id="rememberMe"
              />

              <span className="absolute w-[140px] top-0.8 left-[25px] text-black text-[12px] [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal]">
                30일동안 아이디 저장하기
              </span>
            </label>
          </div>


          <button
            type="submit"
            className="absolute w-[404px] h-[35px] top-[534px] left-[174px]"
          >
            <div className="relative h-8">
              <div className="flex flex-col w-[404px] items-start absolute top-0 left-0">
                <div className="flex w-[404px] h-8 items-center gap-2.5 pl-2.5 pr-0 py-2.5 relative bg-[#5969cf] rounded-[10px] overflow-hidden  hover:bg-[#4a5bb8] transition-colors">
                  <div className="inline-flex items-start justify-center gap-2.5 relative flex-[0_0_auto] mt-[-1.50px] mb-[-1.50px]" />
                </div>
              </div>

              <span className="left-[184px] absolute top-[7px] [font-family:'Poppins',Helvetica] font-bold text-white text-[13px] tracking-[0] leading-[normal]">
                로그인
              </span>
            </div>
          </button>
        </form>

        <div className="absolute w-[231px] h-[23px] top-[762px] left-[267px]">
          <p className="absolute w-[229px] top-0 left-0 text-transparent text-sm [font-family:'Poppins',Helvetica] font-medium tracking-[0] leading-[normal]">
            <span className="text-black">
              아이디가 없으신가요?&nbsp;&nbsp;{" "}
            </span>

            <button
              type="button"
              className="text-[#0f3cde] hover:underline"
              onClick={() => handleGoToJoin()}
            >
              회원가입
            </button>
          </p>
        </div>

       <div className="inline-flex items-center gap-[23px] absolute top-[707px] left-[174px]">
        <button
          type="button"
          className="relative w-[190px] hover:opacity-80 transition-opacity"
          onClick={() => console.log("Google login")}
        >
          <img
            alt="Sign in with Google"
            src="/img/frame-60.png"
            className="w-full"
          />
        </button>

        <button
          type="button"
          className="relative w-[190px] hover:opacity-80 transition-opacity"
          onClick={() => console.log("Apple login")}
        >
          <img
            alt="Sign in with Apple"
            src="/img/frame-62.png"
            className="w-full"
          />
        </button>
      </div>


        <button
          type="button"
          onClick={handleGoToJoin}
          className="absolute w-[404px] h-[35px] top-[596px] left-[174px] bg-edf-2f-7"
        >
          <div className="relative h-8">
            <div className="flex flex-col w-[404px] items-start absolute top-0 left-0">
              <div className="flex w-[404px] h-8 items-center gap-2.5 pl-2.5 pr-0 py-2.5 relative bg-[#5969cf] rounded-[10px] overflow-hidden  hover:bg-[#4a5bb8] transition-colors">
                <div className="inline-flex items-start justify-center gap-2.5 relative flex-[0_0_auto] mt-[-1.50px] mb-[-1.50px]" />
              </div>
            </div>

            <span
              className="left-[178px] absolute top-[7px] [font-family:'Poppins',Helvetica] font-bold text-white text-[13px] tracking-[0] leading-[normal] cursor-pointer"
            >
              회원가입
            </span>

          </div>
        </button>
      </div>
    </div>
  );
};

export default Login;