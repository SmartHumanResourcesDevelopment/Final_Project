import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Main_search.css";
import searchIcon from "../assets/img/common/search.png";
import { keywordApiService } from "../api/sub";

// 쿠키 관리 유틸리티 함수 (MyFeed.jsx와 동일)
const CookieUtils = {
  setCookie: (name, value, hours = 24) => {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
      const cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      document.cookie = cookieString;
      console.log("🍪 쿠키 설정:", cookieString);
      return true;
    } catch (error) {
      console.error("❌ 쿠키 설정 실패:", error);
      return false;
    }
  },

  getCookie: (name) => {
    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
      }
      return null;
    } catch (error) {
      console.error("❌ 쿠키 읽기 실패:", error);
      return null;
    }
  }
};

// 키워드 오타 교정 데이터베이스
const KEYWORD_CORRECTIONS = {
  // 일반적인 오타 패턴
  "제리": "젤리",
  "젤이": "젤리",
  "겔리": "젤리",
  "먹빵": "먹방",
  "먹팡": "먹방",
  "간시": "간식",
  "갈식": "간식",
  "과져": "과자",
  "괘자": "과자",
  "음뇨": "음료",
  "디져트": "디저트",
  "디절트": "디저트",
  "케익": "케이크",
  "케잌": "케이크",
  "치긴": "치킨",
  "피짜": "피자",
  "햄버가": "햄버거",
  "햄벅거": "햄버거",
  "라멘": "라면",
  "라민": "라면",
  "떡복이": "떡볶이",
  "떡뽁이": "떡볶이",
  "깁치": "김치",
  "불닥": "불닭",
  "불딱": "불닭",
  "마라땅": "마라탕",
  "마라당": "마라탕",
  "탕후르": "탕후루",
  "당후루": "탕후루",
  "버블테": "버블티",
  "버불티": "버블티",
  "치즈케익": "치즈케이크",
  "치즈케잌": "치즈케이크",
  "망고": "망고",
  "맹고": "망고",
  "두찜": "두찜",
  "두짐": "두찜"
};


// 최근 키워드 추가 함수 (메인 페이지 전용)
const addRecentKeywordLocal = (keyword) => {
  try {
    console.log("🔍 메인 페이지 - 키워드 추가 시도:", keyword);

    if (!keyword || keyword.trim() === '') {
      console.log("⚠️ 빈 키워드로 인해 추가 취소");
      return;
    }

    const trimmedKeyword = keyword.trim();
    let currentKeywords = [];

    // 기존 키워드 가져오기 (쿠키 + localStorage 이중화)
    let savedKeywords = CookieUtils.getCookie('recentSearchKeywords');
    if (!savedKeywords) {
      savedKeywords = localStorage.getItem('recentSearchKeywords');
      console.log("🔍 localStorage에서 기존 키워드:", savedKeywords);
    } else {
      console.log("🔍 쿠키에서 기존 키워드:", savedKeywords);
    }

    if (savedKeywords) {
      currentKeywords = JSON.parse(savedKeywords);
      console.log("📋 파싱된 기존 키워드:", currentKeywords);
    }

    // 중복 제거 (대소문자 구분 없이)
    const beforeFilter = currentKeywords.length;
    currentKeywords = currentKeywords.filter(
      k => k.toLowerCase() !== trimmedKeyword.toLowerCase()
    );
    console.log(`🔄 중복 제거: ${beforeFilter}개 → ${currentKeywords.length}개`);

    // 새 키워드를 맨 앞에 추가
    currentKeywords.unshift(trimmedKeyword);
    console.log("➕ 새 키워드 추가 후:", currentKeywords);

    // 최대 7개까지만 유지
    if (currentKeywords.length > 7) {
      currentKeywords = currentKeywords.slice(0, 7);
      console.log("✂️ 7개로 제한 후:", currentKeywords);
    }

    // 쿠키와 localStorage에 이중 저장
    const keywordsJson = JSON.stringify(currentKeywords);

    // 쿠키에 저장 시도
    const cookieSuccess = CookieUtils.setCookie('recentSearchKeywords', keywordsJson, 24);
    console.log("💾 쿠키 저장 결과:", cookieSuccess);

    // localStorage에도 저장 (백업)
    try {
      localStorage.setItem('recentSearchKeywords', keywordsJson);
      console.log("💾 localStorage에 저장 성공:", keywordsJson);
    } catch (localStorageError) {
      console.error("❌ localStorage 저장 실패:", localStorageError);
    }

    console.log("✅ 메인 페이지 - 검색 키워드 저장 성공:", trimmedKeyword);
    console.log("📋 최종 키워드 목록:", currentKeywords);

  } catch (error) {
    console.error("❌ 메인 페이지 - 검색 키워드 저장 실패:", error);
  }
};

function Main_search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularKeywords, setPopularKeywords] = useState(["마라탕", "민트초코", "말차", "탕후루", "마라탕"]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [correctionMessage, setCorrectionMessage] = useState("");

  // 오타 교정 함수
  const correctTypo = (input) => {
    const trimmedInput = input.trim().toLowerCase();

    // 정확한 매칭 먼저 확인
    if (KEYWORD_CORRECTIONS[trimmedInput]) {
      return KEYWORD_CORRECTIONS[trimmedInput];
    }

    // 부분 매칭 확인 (유사도 기반)
    for (const [typo, correct] of Object.entries(KEYWORD_CORRECTIONS)) {
      if (trimmedInput.includes(typo) || typo.includes(trimmedInput)) {
        // 길이 차이가 1-2자 이내인 경우만 교정
        if (Math.abs(trimmedInput.length - typo.length) <= 2) {
          return correct;
        }
      }
    }

    return null; // 교정할 수 없음
  };

  // 검색어 변경 시 오타 교정 확인
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // 교정 메시지 초기화
    setCorrectionMessage("");

    if (value.trim().length > 1) {
      const correctedKeyword = correctTypo(value);
      if (correctedKeyword && correctedKeyword !== value.trim()) {
        setCorrectionMessage(`"${correctedKeyword}"(으)로 검색하시겠습니까?`);
      }
    }
  };

  // 교정된 키워드로 검색창 업데이트
  const applyCorrectedKeyword = () => {
    const correctedKeyword = correctTypo(searchQuery);
    if (correctedKeyword) {
      setSearchQuery(correctedKeyword);
      setCorrectionMessage("");
      console.log(`🔧 오타 교정: "${searchQuery}" → "${correctedKeyword}"`);
    }
  };



  /* 인기 키워드 로드 */
  const loadPopularKeywords = async () => {
    try {
      console.log("🔍 인기 키워드 로드 시작");
      const data = await keywordApiService.getPopularKeywords();

      if (data && data.keywords) {
        const keywords = data.keywords.slice(0, 5).map(k => k.KEYWORD_NAME);
        setPopularKeywords(keywords);
        console.log("✅ 인기 키워드 로드 성공:", keywords);
      }
    } catch (err) {
      console.error("❌ 인기 키워드 로드 실패:", err);
      // 기본 키워드 유지
    }
  };

  /* 키워드 검색 실행 */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      alert("검색할 키워드를 입력해주세요.");
      return;
    }

    const searchKeyword = searchQuery.trim();

    // 🔥 검색 API 요청 시작과 동시에 최근 검색 키워드에 추가
    console.log("� 메인 페이지 - 검색 시도 키워드를 최근 검색에 추가:", searchKeyword);
    addRecentKeywordLocal(searchKeyword);

    // 전역 함수가 있다면 그것도 호출 (마이페이지 상태 동기화)
    if (window.addRecentKeyword) {
      console.log("🔄 전역 함수도 호출하여 마이페이지와 동기화");
      window.addRecentKeyword(searchKeyword);
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 키워드 검색 시작:", searchKeyword);

      // 먼저 서버 연결 테스트
      try {
        await keywordApiService.testConnection();
        console.log("✅ 서버 연결 확인됨");
      } catch (connectionError) {
        console.error("❌ 서버 연결 실패:", connectionError);
        setError("서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.");
        return;
      }

      const data = await keywordApiService.searchKeyword(searchKeyword);

      console.log("✅ 검색 성공:", data);
      setSearchResults(data);

      // 키워드 정보가 없는 경우 에러 메시지 설정
      if (!data.keywordInfo) {
        setError(data.message || '검색 결과를 찾을 수 없습니다.');
      } else {
        setError(''); // 성공한 경우 에러 메시지 초기화

        // 유사도 테이블에서 받은 관련 키워드 확인
        if (data.suggestedKeywords && data.suggestedKeywords.length > 0) {
          console.log("🔍 " + searchQuery + " 관련 유사도 테이블 키워드들:");
          data.suggestedKeywords.forEach(keyword => {
            console.log("🔍 " + searchQuery + " 관련 키워드: " + keyword);
          });
          setSuggestedKeywords(data.suggestedKeywords);
          setShowSuggestions(true);
          console.log("💡 Enter 키를 누르면 '" + searchQuery + "'로 검색됩니다.");
        } else {
          // 유사 키워드가 없으면 바로 Sub 페이지로 이동
          console.log("🎯 관련 키워드가 없어서 바로 '" + searchQuery + "'로 이동합니다.");
          navigate('/sub', {
            state: {
              keywordData: {
                keyword: data.keywordInfo.KEYWORD_NAME,
              ranking: data.ranking ?
                       (typeof data.ranking === 'number' ? `${data.ranking}위` : data.ranking) :
                       "순위 정보 없음",
              emotionLabels: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].MAIN_EMOTIONS ?
                           data.mainStats[0].MAIN_EMOTIONS.split(',').slice(0, 5) : ["감정", "분석", "정보", "없음", "~"],
              description: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].SHORT_DESCRIPTION ?
                          data.mainStats[0].SHORT_DESCRIPTION : "키워드 설명이 없습니다.",
              trendExplanation: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].TREND_EXPLANATION ?
                               data.mainStats[0].TREND_EXPLANATION : "트렌드 설명이 없습니다.",
              similarityInfo: data.similarityInfo,
              similarKeywords: data.similarKeywords || [],
              sentimentAnalysis: data.sentimentAnalysis,
              positiveComments: data.positiveComments || [],
              negativeComments: data.negativeComments || []
            }
          }
        });
        return; // 페이지 이동 후 함수 종료
        }
      }

    } catch (err) {
      console.error("❌ 검색 실패:", err);
      setError(err.message || "검색 중 오류가 발생했습니다.");
      setSearchResults(null); // 에러 시 검색 결과 초기화
    } finally {
      setLoading(false);
    }
  };

  /* Enter 키 핸들러 - 유사 키워드 제안 중에도 원래 키워드로 검색 */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showSuggestions) {
      e.preventDefault();
      handleDirectSearch();
    }
  };

  /* 원래 검색어로 직접 검색 (Enter 키 - 관련 키워드 무시하고 원래 키워드로 검색) */
  const handleDirectSearch = async () => {
    if (!searchQuery.trim()) {
      console.log("⚠️ 검색어가 없습니다.");
      return;
    }

    const searchKeyword = searchQuery.trim();

    // 🔥 직접 검색도 최근 검색 키워드에 추가 (이미 추가되었을 수도 있지만 중복 제거됨)
    console.log("💾 메인 페이지 - 직접 검색 키워드를 최근 검색에 추가:", searchKeyword);
    addRecentKeywordLocal(searchKeyword);

    // 전역 함수가 있다면 그것도 호출
    if (window.addRecentKeyword) {
      window.addRecentKeyword(searchKeyword);
    }

    try {
      setShowSuggestions(false);
      setLoading(true);
      setError(null);

      console.log("🎯 관련 키워드 무시하고 원래 키워드로 직접 검색:", searchKeyword);

      // 원래 입력한 키워드로 새로운 API 호출
      const data = await keywordApiService.searchKeyword(searchKeyword);

      console.log("✅ 원래 키워드 직접 검색 성공:", data);

      if (!data.keywordInfo) {
        setError(data.message || '검색 결과를 찾을 수 없습니다.');
        return;
      }

      // Sub 페이지로 이동
      navigate('/sub', {
        state: {
          keywordData: {
            keyword: data.keywordInfo.KEYWORD_NAME,
            ranking: data.ranking ?
                     (typeof data.ranking === 'number' ? `${data.ranking}위` : data.ranking) :
                     "순위 정보 없음",
            emotionLabels: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].MAIN_EMOTIONS ?
                          data.mainStats[0].MAIN_EMOTIONS.split(',').slice(0, 5) : ["감정", "분석", "정보", "없음", "~"],
            description: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].SHORT_DESCRIPTION ?
                        data.mainStats[0].SHORT_DESCRIPTION : "키워드 설명이 없습니다.",
            trendExplanation: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].TREND_EXPLANATION ?
                             data.mainStats[0].TREND_EXPLANATION : "트렌드 설명이 없습니다.",
            similarityInfo: data.similarityInfo,
            similarKeywords: data.similarKeywords || [],
            sentimentAnalysis: data.sentimentAnalysis,
            positiveComments: data.positiveComments || [],
            negativeComments: data.negativeComments || []
          }
        }
      });

      console.log("✅ 원래 키워드로 Sub 페이지 이동 완료:", searchQuery);

    } catch (error) {
      console.error("❌ 원래 키워드 직접 검색 실패:", error);
      setError(error.message || "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* 인기 키워드 클릭 시 검색 */
  const handlePopularKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    // 자동으로 검색 실행
    setTimeout(() => {
      const form = document.querySelector('.keyword-search__form');
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    }, 100);
  };

  /* 유사 키워드 클릭 핸들러 */
  const handleSuggestedKeywordClick = async (keyword) => {
    // 🔥 유사 키워드 선택도 최근 검색 키워드에 추가
    console.log("💾 메인 페이지 - 유사 키워드 선택을 최근 검색에 추가:", keyword);
    addRecentKeywordLocal(keyword);

    // 전역 함수가 있다면 그것도 호출
    if (window.addRecentKeyword) {
      window.addRecentKeyword(keyword);
    }

    try {
      setSearchQuery(keyword);
      setShowSuggestions(false); // 제안 목록 숨기기
      setLoading(true);

      console.log("🔍 유사 키워드 검색 시작:", keyword);

      // 해당 키워드로 다시 검색
      const data = await keywordApiService.searchKeyword(keyword);

      console.log("✅ 유사 키워드 검색 성공:", data);

      if (!data.keywordInfo) {
        setError(data.message || '검색 결과를 찾을 수 없습니다.');
      } else {
        setError('');

        // 바로 Sub 페이지로 이동 (유사 키워드 선택했으므로)
        navigate('/sub', {
          state: {
            keywordData: {
              keyword: data.keywordInfo.KEYWORD_NAME,
              ranking: data.ranking ?
                       (typeof data.ranking === 'number' ? `${data.ranking}위` : data.ranking) :
                       "순위 정보 없음",
              emotionLabels: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].MAIN_EMOTIONS ?
                            data.mainStats[0].MAIN_EMOTIONS.split(',').slice(0, 5) : ["감정", "분석", "정보", "없음", "~"],
              description: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].SHORT_DESCRIPTION ?
                          data.mainStats[0].SHORT_DESCRIPTION : "키워드 설명이 없습니다.",
              trendExplanation: data.mainStats && data.mainStats.length > 0 && data.mainStats[0].TREND_EXPLANATION ?
                               data.mainStats[0].TREND_EXPLANATION : "트렌드 설명이 없습니다.",
              similarityInfo: data.similarityInfo,
              similarKeywords: data.similarKeywords || [],
              sentimentAnalysis: data.sentimentAnalysis,
              positiveComments: data.positiveComments || [],
              negativeComments: data.negativeComments || []
            }
          }
        });
      }

    } catch (error) {
      console.error("❌ 유사 키워드 검색 실패:", error);
      setError(error.message || "검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /* 입력 변경 처리 (오타 교정 포함) */
  const handleInputChange = (e) => {
    handleSearchChange(e);
  };

  /* 컴포넌트 마운트 시 인기 키워드 로드 (한 번만 실행) */
  useEffect(() => {
    console.log("🚀 Main_search 컴포넌트 마운트 - 인기 키워드 로딩 시작");
    loadPopularKeywords();
  }, []); // 빈 의존성 배열로 한 번만 실행

  return (
    <section className="keyword-search" role="search">
      <h2 id="keyword-search-heading" className="keyword-search__title">
        궁금한 키워드를 직접 검색해보세요
      </h2>

      {/* 인기 키워드 해시태그 */}
      <div className="keyword-search__tags">
        {popularKeywords.map((kw, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Search ${kw}`}
            onClick={() => handlePopularKeywordClick(kw)}
          >
            #{kw}
          </button>
        ))}
      </div>

      {/* 검색 인풋 */}
      <form className="keyword-search__form" onSubmit={handleSubmit}>
        <label htmlFor="search-input" className="sr-only">
          키워드 검색
        </label>

        <input
          id="search-input"
          type="text"
          placeholder="예) 민트초코"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button type="submit" aria-label="검색" disabled={loading}>
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              color: '#666',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              minWidth: '100px'
            }}>
              <span style={{ whiteSpace: 'nowrap' }}>검색중</span>
              <div style={{
                display: 'flex',
                gap: '2px'
              }}>
                <span style={{
                  animation: 'dots 1.4s ease-in-out infinite both',
                  animationDelay: '-0.32s'
                }}>.</span>
                <span style={{
                  animation: 'dots 1.4s ease-in-out infinite both',
                  animationDelay: '-0.16s'
                }}>.</span>
                <span style={{
                  animation: 'dots 1.4s ease-in-out infinite both',
                  animationDelay: '0s'
                }}>.</span>
              </div>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #f3f3f3',
                borderTop: '2px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginLeft: '4px',
                flexShrink: 0
              }}></div>
            </div>
          ) : (
            <img src={searchIcon} alt="검색" style={{
              width: '20px',
              height: '20px'
            }} />
          )}
        </button>
      </form>

      {/* 오타 교정 메시지 */}
      {correctionMessage && (
        <div style={{
          marginTop: '10px',
          padding: '12px 16px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '14px',
          color: '#1976d2'
        }}>
          <span>
            🔧 {correctionMessage}
          </span>
          <button
            onClick={applyCorrectedKeyword}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1976d2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2196f3'}
          >
            교정하기
          </button>
        </div>
      )}

      {/* 에러 메시지 및 추천 키워드 */}
      {error && (
        <div className="keyword-search__error" style={{
          color: '#e74c3c',
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '14px'
        }}>
          {error}

          {/* 추천 키워드 표시 */}
          {searchResults && searchResults.similarKeywords && searchResults.similarKeywords.length > 0 && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <div style={{
                color: '#495057',
                marginBottom: '10px',
                fontWeight: 'bold',
                fontSize: '14px'
              }}>
                <span style={{ color: '#007bff' }}>
                  {searchResults.similarKeywords.join(', ')}
                </span> 이런 키워드가 있어요! 어떤게 궁금하세요?
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {searchResults.similarKeywords.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => handlePopularKeywordClick(keyword)}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '15px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 유사 키워드 제안 */}
      {showSuggestions && suggestedKeywords.length > 0 && (
        <div className="keyword-suggestions" style={{
          marginTop: '15px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px solid #e3f2fd',
          textAlign: 'center'
        }}>
          <div style={{
            color: '#1976d2',
            marginBottom: '15px',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            🔍 이런 유사 키워드가 있어요!! 어떤게 궁금하세요!
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {suggestedKeywords.map((keyword, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedKeywordClick(keyword)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1976d2';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2196f3';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.3)';
                }}
              >
                {keyword}
              </button>
            ))}
          </div>

          <div style={{
            marginTop: '15px',
            fontSize: '13px',
            color: '#666',
            lineHeight: '1.4'
          }}>
            <div style={{ marginBottom: '5px' }}>
              💡 클릭하면 해당 키워드로 검색됩니다
            </div>
            <div style={{
              fontSize: '12px',
              color: '#888',
              fontStyle: 'italic'
            }}>
              또는 작성하신 키워드 "<strong style={{color: '#007bff'}}>{searchQuery}</strong>"로 검색하시려면 <kbd style={{
                background: '#f1f3f4',
                border: '1px solid #dadce0',
                borderRadius: '3px',
                padding: '2px 6px',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}>Enter</kbd>키를 눌러주세요
            </div>
          </div>
        </div>
      )}


    </section>
  );
}

// Named export와 default export 모두 제공
export { Main_search };
export default Main_search;