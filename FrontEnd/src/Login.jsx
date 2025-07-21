import React, { useState } from "react";
import frame60 from "./assets/img/google_button.png";
import frame62 from "./assets/img/apple_button.png";
import line2 from "./assets/img/Line_2.png";
import analystsStrategizingWithGraphsAndMetrics from "./assets/img/login.png";



export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { email, password, rememberMe });
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup attempt");
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1440px] h-[960px] relative">
        <main className="absolute w-[417px] h-[583px] top-[202px] left-[165px]">
          <div
            className="absolute w-[400px] h-3.5 top-[370px] left-0"
            role="separator"
            aria-label="또는"
          >
            <div className="relative h-3.5" >
              <img
                className="absolute w-[500px] h-0.5 top-[7px] left-0"
                alt=""
                src={line2}
                style={{ paddingLeft: "20px" }}
              />

              <div className="flex w-5 items-center justify-center gap-2.5 px-[3px] py-0 absolute top-0 left-[191px] bg-white"style={{ background: "white" }}>
                <div className="relative w-fit mt-[2.50px] [font-family:'Poppins-Medium',Helvetica] font-medium text-black text-[9px] tracking-[0] leading-[normal] bg-white">
                  Or
                </div>
              </div>
            </div>
          </div>

          <div className="absolute w-[408px] h-[583px] top-0 left-[9px]">
            <header className="inline-flex h-[53px] items-start gap-2.5 absolute top-0 left-[60px]">
              <h1 className="relative w-fit mt-[-1.00px] text-black text-[32px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                만나서 반가워요!🫨
              </h1>
            </header>

            <p className="absolute w-[372px] top-[62px] left-0 text-black text-base [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
              당신의 이메일 주소를 입력해주세요
            </p>

            <form onSubmit={handleLogin}>
              <div className="top-[139px] flex flex-col w-[404px] h-[59px] items-start absolute left-0">
                <label className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
                  <span className="text-black text-sm relative w-fit mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                    아이디
                  </span>
                </label>

                <div className="flex items-center gap-2.5 pl-2.5 pr-0 py-2.5 rounded-[10px] overflow-hidden border border-solid border-[#d9d9d9] w-[404px] h-8 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일을 입력해주세요."
                    className="text-muted text-[10px] relative w-full mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted focus:text-black"
                    required
                    aria-label="이메일 주소"
                  />
                </div>
              </div>

              <div className="absolute w-[404px] h-[59px] top-[218px] left-0">
                <div className="top-0 flex flex-col w-[404px] h-[59px] items-start absolute left-0">
                  <label className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
                    <span className="text-black text-sm relative w-fit mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                      비밀번호
                    </span>
                  </label>

                  <div className="w-[404px] h-8 relative flex items-center gap-2.5 pl-2.5 pr-0 py-2.5 rounded-[10px] overflow-hidden border border-solid border-[#d9d9d9]">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="비밀번호를 입력해주세요."
                      className="text-muted text-[10px] relative w-full mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted focus:text-black"
                      required
                      aria-label="비밀번호"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className="absolute top-0 left-[263px] text-action-sec text-[10px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal] hover:underline focus:underline"
                  aria-label="비밀번호 찾기"
                >
                  비밀번호를 잊어버리셨나요?
                </button>
              </div>

              <div className="absolute w-[121px] h-[15px] top-[296px] left-0">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="absolute w-[9px] h-2.5 top-0.5 left-0 rounded-sm border border-solid border-black appearance-none checked:bg-black checked:border-black focus:ring-2 focus:ring-blue-500"
                    aria-label="30일동안 아이디 저장하기"
                  />
                  <span className="absolute w-[104px] top-0 left-[15px] text-black text-[9px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                    30일동안 아이디 저장하기
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="absolute w-[404px] h-[35px] top-[332px] left-0 group"
                aria-label="로그인"
              >
                <div className="relative h-8">
                  <div className="flex flex-col w-[404px] items-start absolute top-0 left-0">
                    <div className="flex w-[404px] h-8 items-center gap-2.5 pl-2.5 pr-0 py-2.5 relative bg-[#5969cf] rounded-[10px] overflow-hidden border border-solid hover:bg-[#4a5bb8] focus:bg-[#4a5bb8] transition-colors">
                      <div className="inline-flex items-start justify-center gap-2.5 relative flex-[0_0_auto] mt-[-1.50px] mb-[-1.50px]" />
                    </div>
                  </div>

                  <span className="absolute top-[5px] left-[185px] [font-family:'Poppins-Bold',Helvetica] font-bold text-white text-[13px] tracking-[0] leading-[normal]">
                    로그인
                  </span>
                </div>
              </button>
            </form>

            <div className="absolute w-[231px] h-[23px] top-[560px] left-[93px]">
              <p className="absolute w-[229px] top-0 left-0 text-sm [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                <span className="text-black">
                  아이디가 없으신가요?&nbsp;&nbsp;{" "}
                </span>

                <button
                  type="button"
                  className="text-[#0f3cde] hover:underline focus:underline"
                  aria-label="회원가입 페이지로 이동"
                >
                  회원가입
                </button>
              </p>
            </div>

            <div className="inline-flex items-center gap-[23px] absolute top-[505px] left-0">
              <button
                type="button"
                className="relative flex-[0_0_auto] hover:opacity-80 focus:opacity-80 transition-opacity"
                aria-label="Google로 로그인"
              >
                <img
                  className="relative flex-[0_0_auto]"
                  alt="Google 로그인"
                  src={frame60}
                />
              </button>

              <button
                type="button"
                className="relative w-[190px] hover:opacity-80 focus:opacity-80 transition-opacity"
                aria-label="Apple로 로그인"
              >
                <img
                  className="relative w-[190px]"
                  alt="Apple 로그인"
                  src={frame62}
                />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignup}
            className="absolute w-[404px] h-[35px] top-[394px] left-[9px] bg-edf-2f-7 group"
            aria-label="회원가입"
          >
            <div className="relative h-8">
              <div className="flex flex-col w-[404px] items-start absolute top-0 left-0">
                <div className="flex w-[404px] h-8 items-center gap-2.5 pl-2.5 pr-0 py-2.5 relative bg-[#5969cf] rounded-[10px] overflow-hidden border border-solid hover:bg-[#4a5bb8] focus:bg-[#4a5bb8] transition-colors">
                  <div className="inline-flex items-start justify-center gap-2.5 relative flex-[0_0_auto] mt-[-1.50px] mb-[-1.50px]" />
                </div>
              </div>

              <span className="absolute top-[5px] left-[185px] [font-family:'Poppins-Bold',Helvetica] font-bold text-white text-[13px] tracking-[0] leading-[normal]">
                회원가입
              </span>
            </div>
          </button>
        </main>

        <aside
          className="absolute w-[760px] h-[960px] top-0 left-[720px] bg-[url(./assets/img/background/Rectangle_9.png)] bg-[100%_100%]"
          aria-label="배경 이미지"
        >
          <img
            className="absolute w-[704px] h-[736px] top-[185px] left-4"
            alt="그래프와 메트릭을 분석하는 분석가들"
            src={analystsStrategizingWithGraphsAndMetrics}
          />
        </aside>
      </div>
    </div>
  );
};

export default Login;
