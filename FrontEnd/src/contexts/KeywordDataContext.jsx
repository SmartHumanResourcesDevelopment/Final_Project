import React, { createContext, useContext, useState } from 'react';

// 키워드 데이터 컨텍스트 생성
const KeywordDataContext = createContext();

// 키워드 데이터 프로바이더 컴포넌트
export const KeywordDataProvider = ({ children }) => {
  // localStorage에서 초기 데이터 로드
  const [keywordData, setKeywordData] = useState(() => {
    try {
      const savedData = localStorage.getItem('keywordData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log("🔄 localStorage에서 키워드 데이터 복원:", parsedData);
        return parsedData;
      }
    } catch (error) {
      console.error("❌ localStorage 데이터 파싱 실패:", error);
    }
    return null;
  });

  const [updateTrigger, setUpdateTrigger] = useState(0);

  // 키워드 데이터 변경 시 로그 및 localStorage 저장
  const setKeywordDataWithLog = (data) => {
    console.log("🔄 KeywordDataContext - 키워드 데이터 업데이트:", data);
    console.log("🔄 KeywordDataContext - 이전 데이터:", keywordData);
    console.log("🔄 KeywordDataContext - 새로운 데이터:", data);

    setKeywordData(data);
    setUpdateTrigger(prev => prev + 1); // 강제 리렌더링 트리거

    // localStorage에 저장
    try {
      if (data) {
        localStorage.setItem('keywordData', JSON.stringify(data));
        console.log("💾 키워드 데이터를 localStorage에 저장 완료");
      } else {
        localStorage.removeItem('keywordData');
        console.log("🗑️ localStorage에서 키워드 데이터 제거");
      }
    } catch (error) {
      console.error("❌ localStorage 저장 실패:", error);
    }

    console.log("✅ KeywordDataContext - 상태 업데이트 완료, 트리거:", updateTrigger + 1);
  };

  const value = {
    keywordData,
    setKeywordData: setKeywordDataWithLog,
    updateTrigger, // 리렌더링 트리거 값 제공
  };

  return (
    <KeywordDataContext.Provider value={value}>
      {children}
    </KeywordDataContext.Provider>
  );
};

// 키워드 데이터 컨텍스트를 사용하는 커스텀 훅
export const useKeywordData = () => {
  const context = useContext(KeywordDataContext);
  
  if (context === undefined) {
    throw new Error('useKeywordData must be used within a KeywordDataProvider');
  }
  
  return context;
};

export default KeywordDataContext;
