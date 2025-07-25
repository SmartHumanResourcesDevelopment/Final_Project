import React from "react";

const MyPage_Personal = ({ onClose }) => {
  // 수정 버튼 클릭 시 실행될 함수
  const handleUpdate = () => {
    alert("수정 완료 되었습니다.");
    onClose(); // 수정 후 창 닫기 (필요 없다면 이 줄 제거 가능)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-[20px] w-[600px] max-w-full p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold">×</button>
        <h2 className="text-center text-2xl font-bold mb-6">개인정보 수정</h2>
        <div className="space-y-4 mb-6">
          <input
            type="password"
            placeholder="새로운 비밀번호를 입력해주세요"
            className="w-full border rounded-md p-3 text-sm outline-none"
          />
          <input
            type="password"
            placeholder="다시 한번 당신의 비밀번호를 입력해주세요"
            className="w-full border rounded-md p-3 text-sm outline-none"
          />
          <input
            type="text"
            placeholder="당신의 이름을 입력해주세요"
            className="w-full border rounded-md p-3 text-sm outline-none"
          />
          <input
            type="text"
            placeholder="당신의 휴대폰번호를 입력해주세요"
            className="w-full border rounded-md p-3 text-sm outline-none"
          />
        </div>
        <button
          onClick={handleUpdate}
          className="w-full bg-black text-white py-4 rounded-full font-bold text-lg"
        >
          수정하기
        </button>
      </div>
    </div>
  );
};

export default MyPage_Personal;