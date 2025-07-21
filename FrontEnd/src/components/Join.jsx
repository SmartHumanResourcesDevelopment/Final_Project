import React, { useState } from "react";
import LoginSuccess from "./LoginSuccess.jsx";


export const Join = () => {
  const [formData, setFormData] = useState({
    id: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    phone: "",
    agreeToTerms: false,
  });

  const [showTermsModal, setShowTermsModal] = useState(false);
  //정책 동의
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 비밀번호 일치 여부
  const [passwordError, setPasswordError] = useState('');



  // 체크박스 클릭시 직접 변경 불가, 모달 오픈만
  const handleAgreeClick = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  // 모달 내 동의 버튼 누르면 체크 처리
  const handleAgreeTerms = () => {
    setFormData((prev) => ({ ...prev, agreeToTerms: true }));
    setShowTermsModal(false);
  };

  // 모달 내 거절 버튼 누르면 체크 해제
  const handleDisagreeTerms = () => {
    setFormData((prev) => ({ ...prev, agreeToTerms: false }));
    setShowTermsModal(false);
  };

const handleInputChange = (field, value) => {
  setFormData((prev) => ({
    ...prev,
    [field]: value,
  }));

  // 비밀번호 일치 실시간 확인
  if (field === "password" || field === "confirmPassword") {
    const password = field === "password" ? value : formData.password;
    const confirmPassword = field === "confirmPassword" ? value : formData.confirmPassword;
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
    } else {
      setPasswordError('');
    }
  }
};


  function formatPhone(value) {
  // 숫자만 남기기
  const onlyNums = value.replace(/\D/g, '');

  // 010-1234-5678 형식 자동 변환
  if (onlyNums.length < 4) return onlyNums;
  if (onlyNums.length < 8) return `${onlyNums.slice(0,3)}-${onlyNums.slice(3)}`;
  return `${onlyNums.slice(0,3)}-${onlyNums.slice(3,7)}-${onlyNums.slice(7,11)}`;
}


const handlePhoneChange = (e) => {
  let value = e.target.value;
  // 하이픈 제외한 숫자만 추출
  const onlyNums = value.replace(/\D/g, '');

  // 11자리 이상만 허용
  if (onlyNums.length > 11) return;

  // 하이픈 외 문자 입력시(알파벳, 한글 등) 경고
  if (/[^\d-]/.test(value)) {
    alert("숫자만 입력해주세요.");
    return;
  }

  setFormData((prev) => ({
    ...prev,
    phone: formatPhone(onlyNums),
  }));
};




const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.agreeToTerms) {
    alert("정책에 동의해주세요.");
    return;
  }

  // 여기에 회원가입 입력값 유효성 검사 추가 가능
  // 예시: if (!formData.id || !formData.password || ... ) return;
 // 비밀번호, 재확인 불일치시
  if (formData.password !== formData.confirmPassword) {
    setPasswordError("비밀번호가 일치하지 않습니다.");
    return;
  }
  try {
    // 실제 회원가입 API 연동 (아래는 예시, 실제 함수로 대체)
    // const response = await signupApi(formData);
    // if (response.success) {
    //   setShowSuccessModal(true);  // 성공 모달
    // } else {
    //   alert("회원가입 실패입니다.");
    // }
    
    // [DEMO용] 아래는 무조건 성공하는 구조
    setShowSuccessModal(true);
  } catch (error) {
    // 실패 시 알람
    alert("회원가입 실패입니다.");
  }
};


  const formFields = [
    {
      id: "id",
      label: "아이디",
      placeholder: "당신의 이메일을 입력해주세요",
      type: "text",
      value: formData.id,
      top: "220px",
    },
    {
      id: "password",
      label: "비밀번호",
      placeholder: "당신의 비밀번호를 입력해주세요",
      type: "password",
      value: formData.password,
      top: "303px",
    },
    {
      id: "confirmPassword",
      label: "비밀번호 재확인",
      placeholder: "당신의 비밀번호를 입력해주세요",
      type: "password",
      value: formData.confirmPassword,
      top: "386px",
    },
    {
      id: "name",
      label: "이름",
      placeholder: "당신의 이름을 입력해주세요",
      type: "text",
      value: formData.name,
      top: "484px",
    },
    {
      id: "nickname",
      label: "닉네임",
      placeholder: "사용하실 닉네임을입력하세요",
      type: "text",
      value: formData.nickname,
      top: "567px",
    },
    {
      id: "phone",
      label: "휴대폰번호",
      placeholder: "당신의 휴디폰번호를 입력해주세요",
      type: "tel",
      value: formData.phone,
      top: "655px",
    },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white overflow-hidden w-[1440px] h-[960px] relative">
        <form onSubmit={handleSubmit}>
          <div className="absolute w-[404px] h-[108px] top-[170px] left-[165px]">
            <div className="inline-flex h-[53px] items-start gap-2.5 absolute top-0 left-[103px]">
              <h1 className="text-black text-[32px] relative w-fit mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]">
                환영합니다😊
              </h1>
            </div>

            <div className="flex flex-col w-[404px] h-[70px] items-start absolute top-[50px] left-0">
              <div className="inline-flex items-start gap-2.5 relative flex-[0_0_auto]">
                <label
                  htmlFor="id"
                  className="text-black text-sm relative w-fit mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal]"
                >
                  아이디
                </label>
              </div>

              <div className="flex w-[404px] h-12 items-center gap-2.5 pl-2.5 pr-0 py-2.5 relative rounded-[10px] overflow-hidden border border-solid border-[#d9d9d9]">
                <input
                  id="id"
                  type="text"
                  value={formData.id}
                  onChange={(e) => handleInputChange("id", e.target.value)}
                  placeholder="당신의 아이디를 입력해주세요"
                  className="text-black text-[14px] relative w-full mt-[-1.00px] [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted"
                  aria-label="아이디 입력"
                />
              </div>
            </div>
          </div>

          {formFields.slice(1).map((field) => (
            <div
              key={field.id}
              className="flex flex-col w-[404px] items-start absolute left-[165px]"
              style={{ top: field.top, height: field.id === "confirmPassword" ? "84px" : "70px" }}
            >
              <div className="inline-flex items-start gap-2.5 mb-1">
                <label
                  htmlFor={field.id}
                  className="text-black text-sm [font-family:'Poppins-Medium',Helvetica] font-medium"
                >
                  {field.label}
                </label>
              </div>
              <div className="w-full">
                <input
                  id={field.id}
                  type={field.type}
                  value={field.value}
                  onChange={field.id === "phone" ? handlePhoneChange : (e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className="text-black text-[14px] w-full h-12 [font-family:'Poppins-Medium',Helvetica] font-medium tracking-[0] leading-[normal] placeholder:text-muted border border-solid border-[#d9d9d9] rounded-[10px] pl-2.5"
                  aria-label={field.label}
                  inputMode={field.id === "phone" ? "numeric" : undefined}
                  maxLength={field.id === "phone" ? 13 : undefined}
                />
                {/* input과 별도로 아래에만 에러 메시지 */}
                {field.id === "confirmPassword" && (
                  <div className="text-red-500 text-xs mt-1 min-h-[14px] mb-6">
                    {passwordError ? passwordError : "\u00A0"}
                  </div>
                )}
              </div>
            </div>
          ))}

  


         





          <div className="absolute w-[180px] h-[24px] top-[743px] left-[165px] flex items-center">
            <input
              id="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              // onChange를 직접 사용하지 않고 클릭 시 모달만 띄움
              onClick={handleAgreeClick}
              readOnly
              className="w-5 h-5 border border-gray-300 rounded-sm accent-blue-500 cursor-pointer appearance-auto"
              aria-label="모든 정책 동의"
            />
            <label
              htmlFor="agreeToTerms"
              className="ml-3 [font-family:'Poppins-Medium',Helvetica] font-medium text-black text-[12px] tracking-[0] leading-[normal] cursor-pointer select-none"
              onClick={handleAgreeClick}
            >
              모든 정책 동의
            </label>
          </div>

          {/* 정책 모달 예시 */}
          {showTermsModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg p-8 max-w-lg w-full">
                <h2 className="text-lg font-bold mb-4">이용약관 동의</h2>
                <div className="max-h-60 overflow-y-auto text-sm mb-4">
                  <p>
                    <strong>잘파세대 식문화 트렌드 대시보드 서비스 이용 약관 동의(요약)</strong><br />
                    <br />
                    1. 본 서비스는 인스타그램, 유튜브 등에서 공개된 데이터를 분석하여 식문화 트렌드 및 통계를 제공합니다.<br />
                    2. 회원가입 시 이메일(아이디), 비밀번호, 이름, 닉네임, 휴대폰번호 등의 개인정보를 수집합니다.<br />
                    3. 수집된 개인정보는 회원관리, 맞춤형 데이터 추천, 서비스 품질 개선, 통계분석, 마케팅 안내(선택 동의 시)에 사용됩니다.<br />
                    4. Google, Apple 등 소셜 로그인 정보는 본인 확인 및 맞춤형 서비스 제공에만 활용합니다.<br />
                    5. 회원은 서비스 내 “마이페이지”에서 마케팅/이벤트 정보 수신 동의를 언제든 변경·철회할 수 있습니다.<br />
                    6. 본 서비스는 만 14세 이상만 가입할 수 있으며, 허위 정보 입력이나 비정상적 이용 시 서비스 이용이 제한될 수 있습니다.<br />
                    7. 기타 자세한 약관 및 개인정보 처리방침은 [여기]에서 확인할 수 있습니다.<br />
                    <br />
                    ※ 본인은 위 내용을 충분히 읽고 이해하였으며, 이에 동의합니다.
                  </p>

                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={handleDisagreeTerms}
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                  >
                    동의하지 않음
                  </button>
                  <button
                    onClick={handleAgreeTerms}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    동의합니다
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* 로그인 성공 페이지 모달 생성 */}
          {showSuccessModal && <LoginSuccess onClose={() => setShowSuccessModal(false)} />}



          <div className="absolute w-[404px] h-[35px] top-[787px] left-[165px] bg-edf-2f-7">
            <div className="relative h-8">
              <div className="top-0 left-0 flex flex-col w-[404px] items-start absolute">
                <button
                  type="submit"
                  className="items-center bg-[#5969cf] flex w-[404px] h-8 gap-2.5 pl-2.5 pr-0 py-2.5 relative rounded-[10px] overflow-hidden border border-solid cursor-pointer hover:bg-[#4a5bb8] transition-colors duration-200"
                  aria-label="회원가입 버튼"
                >
                  <div className="inline-flex items-start justify-center gap-2.5 relative flex-[0_0_auto] mt-[-1.50px] mb-[-1.50px]" />
                </button>
              </div>

              <span className="absolute top-[7px] left-[185px] [font-family:'Poppins-Bold',Helvetica] font-bold text-white text-[13px] tracking-[0] leading-[normal] pointer-events-none">
                회원가입
              </span>
            </div>
          </div>
        </form>

        <div className="absolute w-[720px] h-[960px] top-0 left-[720px] bg-[url(/img/rectangle-9.png)] bg-[100%_100%]">
          <img
            className="absolute w-[704px] h-[736px] top-[187px] left-4"
            alt="Analysts"
            src="/img/analysts-strategizing-with-graphs-and-metrics.png"
          />
        </div>
      </div>
    </div>
  );
};
export default Join;