import React from "react";

const MyPage_delete = ({ onClose }) => {
  const handleWithdraw = () => {
    // 탈퇴 로직
    alert("탈퇴 처리되었습니다.");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-10 w-[600px] relative text-center">
        <p className="text-xl font-bold mb-10">
          탈퇴 시 계정 정보가 모두 삭제됩니다.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleWithdraw}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded-full"
          >
            탈퇴
          </button>
          <button
            onClick={onClose}
            className="bg-black text-white font-bold py-3 px-8 rounded-full"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage_delete;