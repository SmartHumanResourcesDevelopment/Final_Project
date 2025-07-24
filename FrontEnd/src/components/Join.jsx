import React, { useState } from "react";
import LoginSuccess from "./LoginSuccess.jsx";
import { signUp } from "../api/authApi"; 
import login_join_bg_img from "../assets/img/common/login_join_bg_img.png";
import mint_bg_color from "../assets/img/common/mint_bg_color.png"

export const Join = () => {
  /* ---------- 상태 ---------- */
  const [formData, setFormData] = useState({
    id: "", password: "", confirmPassword: "",
    name: "", nickname: "", phone: "", agreeToTerms: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  /* ---------- 입력 핸들러 ---------- */
  const handleInputChange = (k, v) => {
    setFormData((p) => ({ ...p, [k]: v }));
    if (k === "password" || k === "confirmPassword") {
      const pw = k === "password" ? v : formData.password;
      const cf = k === "confirmPassword" ? v : formData.confirmPassword;
      setPasswordError(pw && cf && pw !== cf ? "비밀번호가 일치하지 않습니다." : "");
    }
  };

  const formatPhone = (n) => {
    const nums = n.replace(/\D/g, "");
    if (nums.length < 4) return nums;
    if (nums.length < 8) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
    return `${nums.slice(0, 3)}-${nums.slice(3, 7)}-${nums.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const rawInput = e.target.value;

    // 숫자·하이픈만 허용
    if (/[^0-9-]/.test(rawInput)) {
      alert("숫자만 입력하세요.");
      return;
    }

    // 하이픈 제거 후 숫자만
    const onlyNums = rawInput.replace(/-/g, "");

    // 11자리 초과 거부
    if (onlyNums.length > 11) return;

    // 하이픈 자동 삽입
    const autoHyphen =
      onlyNums.length < 4
        ? onlyNums
        : onlyNums.length < 8
        ? `${onlyNums.slice(0, 3)}-${onlyNums.slice(3)}`
        : `${onlyNums.slice(0, 3)}-${onlyNums.slice(3, 7)}-${onlyNums.slice(7, 11)}`;

    setFormData((p) => ({ ...p, phone: autoHyphen }));
  };

  const handleAgreeClick = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };
  const handleAgreeTerms = () => {
    setFormData((p) => ({ ...p, agreeToTerms: true }));
    setShowTermsModal(false);
  };

  /* ---------- 제출 ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 모든 필수값 체크
    const required = ["id", "password", "confirmPassword", "name", "nickname", "phone"];
    const emptyKey = required.find((k) => !formData[k].trim());
    if (emptyKey) {
      alert("모든 항목을 입력해주세요.");
      return;
    }
    if (!formData.agreeToTerms) {
      alert("정책에 동의해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
-    setShowSuccessModal(true);  /* 실제 API 호출 자리 */
      const { success, message } = await signUp(formData);
      console.log("응답:", success, message);
      if (success) {
        setShowSuccessModal(true);            // ★ 성공 모달
      } else {
        alert(message || "회원가입 실패입니다.");
        }
      } catch (err) {
        setShowSuccessModal(false); 
        console.err("회원가입 중 오류", err);
        alert("서버 오류가 발생했습니다.");
      }
  };

  /* ---------- JSX ---------- */
  return (
    <div className="bg-white flex justify-center w-full font-poppins">
      {/* 메인 캔버스: 높이 720 데스크탑 / 650 모바일 */}
      <div className="flex flex-col justify-center items-center
                w-full min-h-[650px] md:min-h-[75vh] px-4 bg-white">

        {/* ───────── 좌측 폼 ───────── */}
        <div className="absolute inset-y-0 left-0 w-1/2 flex justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-[540px] flex flex-col items-start gap-3 justify-center"
          >
            {/* 타이틀 */}
            <div className="space-y-4">
              <h1 className="text-[32px] font-semibold">환영합니다😊</h1>
            </div>

            {/* 입력 필드 모음 */}
            {[
              { id: "id", label: "아이디", ph: "당신의 아이디를 입력해주세요", type: "text" },
              { id: "password", label: "비밀번호", ph: "당신의 비밀번호를 입력해주세요", type: "password" },
              { id: "confirmPassword", label: "비밀번호 재확인", ph: "당신의 비밀번호를 입력해주세요", type: "password" },
              { id: "name", label: "이름", ph: "당신의 이름을 입력해주세요", type: "text" },
              { id: "nickname", label: "닉네임", ph: "사용하실 닉네임을입력하세요", type: "text" },
              { id: "phone", label: "휴대폰번호", ph: "당신의 휴대폰번호를 입력해주세요", type: "tel" },
            ].map((f) => (
              <div key={f.id} className="w-full">
                <label htmlFor={f.id} className="text-sm font-semibold">{f.label}</label>
                <input
                  id={f.id}
                  type={f.type}
                  inputMode={f.id === "phone" ? "numeric" : undefined}
                  value={formData[f.id]}
                  onChange={f.id === "phone"
                    ? handlePhoneChange
                    : (e) => handleInputChange(f.id, e.target.value)}
                  placeholder={f.ph}
                  className="mt-1 w-full h-12 rounded-[10px] pl-2.5 border border-[#d9d9d9] text-[14px]"
                />
                {f.id === "confirmPassword" && (
                  <span className="text-xs text-red-500 mt-1 block min-h-[14px]">{passwordError || "\u00A0"}</span>
                )}
              </div>
            ))}

            {/* 정책 동의 */}
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeToTerms}
                readOnly
                onClick={handleAgreeClick}
                className="w-5 h-5 accent-blue-500 border border-gray-300 rounded-sm appearance-auto"
              />
              모든 정책 동의
            </label>

            {/* 회원가입 버튼 */}
            <button
              type="submit"
              className="h-9 w-full rounded-md bg-[#5969cf] text-white font-bold hover:bg-[#4a5bb8] transition-colors"
            >
              회원가입
            </button>
          </form>
        </div>

        {/* ───────── 우측 이미지 & 배경 ───────── */}
        <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
          <div className="absolute inset-0 bg-[#E9FFFF] bg-repeat-x bg-top bg-[length:320px_100%]" 
          style={{ backgroundImage: `url(${mint_bg_color})`,  // React 변수를 사용해야 빌드 시 경로가 정확히 매핑됩니다
                  backgroundSize : "320px 100%",          // 가로 320 px, 세로 100 %
                  }}/>
          <div className="relative z-10 flex h-full items-center justify-center">
            <img
              src={login_join_bg_img}
              alt="Analysts"
              className="w-[90%] max-w-[640px] h-auto object-contain"
            />
          </div>
        </div>

        {/* ───────── 모달들 ───────── */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-8 max-w-lg w-full">
              <h2 className="text-lg font-bold mb-4">이용약관 동의</h2>
              <div className="max-h-60 overflow-y-auto text-sm mb-4">
                <p>
                    <strong>잘파세대 식문화 트렌드 대시보드 서비스 이용 약관 동의</strong><br />
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
                <button onClick={()=>{setShowTermsModal(false);}} className="px-4 py-2 bg-gray-200 rounded">동의하지 않음</button>
                <button onClick={()=>{handleAgreeTerms();}} className="px-4 py-2 bg-blue-600 text-white rounded">동의합니다</button>
              </div>
            </div>
          </div>
        )}
        {showSuccessModal && <LoginSuccess onClose={() => setShowSuccessModal(false)} />}
      </div>
    </div>
  );
};

export default Join;
