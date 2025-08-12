import React, { createContext, useContext, useState } from 'react';

// 키워드 데이터 컨텍스트 생성
const KeywordDataContext = createContext();

// 키워드 데이터 프로바이더 컴포넌트
export const KeywordDataProvider = ({ children }) => {
  const [keywordData, setKeywordData] = useState(null);

  // 키워드 데이터 변경 시 로그
  const setKeywordDataWithLog = (data) => {
    console.log("🔄 KeywordDataContext - 키워드 데이터 업데이트:", data);
    setKeywordData(data);
  };

  const value = {
    keywordData,
    setKeywordData: setKeywordDataWithLog,
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
