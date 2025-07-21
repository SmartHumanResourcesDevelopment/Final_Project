import React, { useState } from "react";
import analystsStrategizingWithGraphsAndMetrics from "../assets/img/login.png";

export const Join = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    phone: "",
    agreeToTerms: false,
  });

  const formFields = [
    {
      id: "email",
      label: "아이디",
      placeholder: "당신의 이메일을 입력해주세요",
      type: "email",
      top: "220px",
    },
    {
      id: "password",
      label: "비밀번호",
      placeholder: "당신의 비밀번호를 입력해주세요",
      type: "password",
      top: "308px",
    },
    {
      id: "confirmPassword",
      label: "비밀번호 재확인",
      placeholder: "당신의 비밀번호를 입력해주세요",
      type: "password",
      top: "396px",
    },
    {
      id: "name",
      label: "이름",
      placeholder: "당신의 이름을 입력해주세요",
      type: "text",
      top: "484px",
    },
    {
      id: "nickname",
      label: "닉네임",
      placeholder: "사용하실 닉네임을입력하세요",
      type: "text",
      top: "567px",
    },
    {
      id: "phone",
      label: "휴대폰번호",
      placeholder: "당신의 휴디폰번호를 입력해주세요",
      type: "tel",
      top: "655px",
    },
  ];

  const handleInputChange = (id, value) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCheckboxChange = () => {
    setFormData((prev) => ({
      ...prev,
      agreeToTerms: !prev.agreeToTerms,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1440px] h-[960px] relative">
        <form onSubmit={handleSubmit}>
          <div className="absolute w-[404px] h-[108px] top-[170px] left-[165px]">
            <div className="inline-flex h-[53px] items-start gap-2.5 absolute top-0 left-[103px]">
              <h1 className="text-black text-[32px] relative w-fit mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                환영합니다😊
              </h1>
            </div>

            <div className="flex flex-col w-[404px] h-[58px] items-start absolute top-[50px] left-0">
              <label
                htmlFor="email"
                className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]"
              >
                <div className="text-black text-sm relative w-fit mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                  아이디
                </div>
              </label>

              <div className="flex w-[404px] h-8 items-center gap-2.5 pl-2.5 pr-0 py-2.5 relative rounded-[10px] overflow-hidden border border-solid border-[#d9d9d9]">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="당신의 이메일을 입력해주세요"
                  className="w-full text-[10px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted"
                  aria-label="이메일 주소"
                />
              </div>
            </div>
          </div>

          {formFields.slice(1).map((field) => (
            <div
              key={field.id}
              className="flex flex-col w-[404px] h-[58px] items-start absolute left-[165px]"
              style={{ top: field.top }}
            >
              <label
                htmlFor={field.id}
                className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]"
              >
                <div className="text-black text-sm relative w-fit mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                  {field.label}
                </div>
              </label>

              <div className="flex w-[404px] h-8 items-center gap-2.5 pl-2.5 pr-0 py-2.5 relative rounded-[10px] overflow-hidden border border-solid border-[#d9d9d9]">
                <input
                  id={field.id}
                  type={field.type}
                  value={formData[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full text-[10px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted"
                  aria-label={field.label}
                />
              </div>
            </div>
          ))}

          <div className="absolute w-[145px] h-[15px] top-[743px] left-[165px]">
            <label
              htmlFor="agreeToTerms"
              className="flex items-center cursor-pointer"
            >
              <input
                id="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleCheckboxChange}
                className="absolute w-[9px] h-2.5 top-0.5 left-0 rounded-sm border border-solid border-black appearance-none checked:bg-black"
                aria-label="모든 정책 동의"
              />
              <div className="absolute w-32 top-0 left-[15px] [font-family:'Poppins-Medium',Helvetica] font-medium text-black text-[9px] tracking-[0] leading-[normal]">
                모든 정책 동의
              </div>
            </label>
          </div>

          <div className="absolute w-[404px] h-[35px] top-[787px] left-[165px] bg-edf-2f-7">
            <div className="relative h-8">
              <button
                type="submit"
                className="top-0 left-0 flex flex-col w-[404px] items-start absolute"
                aria-label="회원가입 버튼"
              >
                <div className="items-center bg-[#5969cf] flex w-[404px] h-8 gap-2.5 pl-2.5 pr-0 py-2.5 relative rounded-[10px] overflow-hidden border border-solid hover:bg-[#4a5bb8] transition-colors duration-200">
                  <div className="inline-flex items-start justify-center gap-2.5 relative flex-[0_0_auto] mt-[-1.50px] mb-[-1.50px]" />
                </div>
              </button>

              <div className="absolute top-[5px] left-[185px] [font-family:'Poppins-Bold',Helvetica] font-bold text-white text-[13px] tracking-[0] leading-[normal] pointer-events-none">
                회원가입
              </div>
            </div>
          </div>
        </form>

        <div className="absolute w-[760px] h-[960px] top-0 left-[720px] bg-[url(./assets/img/background/Rectangle_9.png)] bg-[100%_100%]">
          <img
            className="absolute w-[704px] h-[736px] top-[185px] left-4"
            alt="Analysts strategizing with graphs and metrics"
            src={analystsStrategizingWithGraphsAndMetrics}
          />
        </div>
      </div>
    </div>
  );
};

export default Join;
