import React from "react";

const MyPage_Profile = ({ onClose }) => {
  const handleUpdate = () => {
    alert("수정 완료되었습니다.");
    onClose(); // 수정 완료 후 창 닫기 (원하지 않으면 이 줄 제거)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-[20px] w-[500px] max-w-full p-8 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-2xl font-bold">×</button>
        <h2 className="text-center text-2xl font-bold mb-6">프로필 수정</h2>
        <div className="w-40 h-40 bg-gray-300 rounded-full mx-auto mb-6" />
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">닉네임</label>
          <input
            type="text"
            placeholder="사용하실 닉네임을 입력하세요"
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

export default MyPage_Profile;