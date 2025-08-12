import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { keywordApiService } from "../api/sub";
import { fetchWithAuth } from "../util/fetchWithAuth";
import CollabDetailModal from "./CollabDetailModal";

// 쿠키 관리 유틸리티 함수
const CookieUtils = {
  // 쿠키 설정 (24시간 유효)
  setCookie: (name, value, hours = 24) => {
    try {
      const expires = new Date();
      expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
      const cookieString = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
      document.cookie = cookieString;
      console.log("🍪 쿠키 설정:", cookieString);

      // 설정 후 바로 확인
      const verification = CookieUtils.getCookie(name);
      console.log("🔍 설정 후 확인:", verification);

      return verification !== null;
    } catch (error) {
      console.error("❌ 쿠키 설정 실패:", error);
      return false;
    }
  },

  // 쿠키 가져오기
  getCookie: (name) => {
    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      console.log("🔍 쿠키 검색 중:", name, "전체 쿠키:", document.cookie);

      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        console.log("🔍 쿠키 조각:", c);
        if (c.indexOf(nameEQ) === 0) {
          const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
          console.log("✅ 쿠키 찾음:", value);
          return value;
        }
      }
      console.log("❌ 쿠키 없음:", name);
      return null;
    } catch (error) {
      console.error("❌ 쿠키 읽기 실패:", error);
      return null;
    }
  },

  // 쿠키 삭제
  deleteCookie: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
  }
};

export const ActivityFeedSection = () => {
  const navigate = useNavigate();
  const [recentKeywords, setRecentKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scrapedReports, setScrapedReports] = useState([]);
  const [scrapLoading, setScrapLoading] = useState(false);

  // 모달 상태 관리
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState("");
  const [selectedScrapType, setSelectedScrapType] = useState("콜라보");

  // 최근 검색 키워드 불러오기 (쿠키 + localStorage 이중화)
  const loadRecentKeywords = () => {
    try {
      console.log("🔍 최근 검색 키워드 로드 시도");
      console.log("🍪 현재 모든 쿠키:", document.cookie);

      // 1차: 쿠키에서 시도
      let savedKeywords = CookieUtils.getCookie('recentSearchKeywords');
      console.log("🔍 쿠키에서 저장된 키워드:", savedKeywords);

      // 2차: 쿠키가 없으면 localStorage에서 시도
      if (!savedKeywords) {
        console.log("🔍 쿠키 없음, localStorage에서 시도");
        savedKeywords = localStorage.getItem('recentSearchKeywords');
        console.log("🔍 localStorage에서 저장된 키워드:", savedKeywords);
      }

      if (savedKeywords) {
        const keywords = JSON.parse(savedKeywords);
        setRecentKeywords(keywords);
        console.log("📋 최근 검색 키워드 로드 성공:", keywords);
      } else {
        setRecentKeywords([]);
        console.log("📋 저장된 검색 키워드 없음 (쿠키, localStorage 모두)");
      }
    } catch (error) {
      console.error("❌ 최근 검색 키워드 로드 실패:", error);
      setRecentKeywords([]);
    }
  };

  // 새로운 키워드 추가 (외부에서 호출 가능하도록 전역 함수로 등록)
  const addRecentKeyword = (keyword) => {
    try {
      console.log("🔍 키워드 추가 시도:", keyword);

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

      // 저장 후 확인
      const verifyCookie = CookieUtils.getCookie('recentSearchKeywords');
      const verifyLocalStorage = localStorage.getItem('recentSearchKeywords');
      console.log("✅ 쿠키 저장 확인:", verifyCookie);
      console.log("✅ localStorage 저장 확인:", verifyLocalStorage);

      // 상태 업데이트
      setRecentKeywords(currentKeywords);
      console.log("🔄 상태 업데이트 완료");

      console.log("✅ 검색 키워드 저장 성공:", trimmedKeyword);
      console.log("📋 최종 키워드 목록:", currentKeywords);

    } catch (error) {
      console.error("❌ 검색 키워드 저장 실패:", error);
    }
  };

  // 키워드 클릭 시 Sub 페이지로 이동
  const handleKeywordClick = async (keyword) => {
    try {
      setLoading(true);
      console.log("🔍 키워드 재검색:", keyword);

      // API 호출하여 키워드 데이터 조회
      const keywordData = await keywordApiService.searchKeyword(keyword);

      // Sub 페이지로 이동하면서 데이터 전달
      navigate('/sub', {
        state: {
          keywordData: {
            keyword: keywordData.keywordInfo?.KEYWORD_NAME || keyword,
            ranking: keywordData.ranking ?
                     (typeof keywordData.ranking === 'number' ?
                      `${keywordData.ranking}위` : keywordData.ranking) :
                     "순위 정보 없음",
            emotionLabels: keywordData.emotionLabels || ["감정", "분석", "정보", "없음", "~"],
            description: keywordData.description || `${keyword}에 대한 분석 정보입니다.`,
            trendExplanation: keywordData.trendExplanation || `${keyword}의 트렌드 분석 정보를 로딩 중입니다.`,
            similarityInfo: keywordData.similarityInfo || {},
            similarKeywords: keywordData.similarKeywords || [],
            sentimentAnalysis: keywordData.sentimentAnalysis,
            positiveComments: keywordData.positiveComments || [],
            negativeComments: keywordData.negativeComments || []
          }
        }
      });

    } catch (error) {
      console.error("❌ 키워드 재검색 실패:", error);
      // 에러 시에도 기본 Sub 페이지로 이동
      navigate('/sub');
    } finally {
      setLoading(false);
    }
  };

  // 스크랩 정보 클릭 핸들러
  const handleScrapClick = (reportText) => {
    const match = reportText.match(/\[(콜라보|제품|슬로건)\]\s*(.+?)에\s*관한\s*보고서/);
    
    // match[1]은 타입(콜라보, 제품, 슬로건), match[2]는 키워드 이름이 됩니다.
    if (match && match[1] && match[2]) {
      const type = match[1].trim();
      const keywordName = match[2].trim();

      console.log(`🔍 스크랩 클릭 - 타입: ${type}, 키워드: ${keywordName}`);
      
      setSelectedScrapType(type); // 어떤 종류의 스크랩인지 상태에 저장
      setSelectedKeyword(keywordName);
      setIsModalOpen(true);
    } else {
      console.error("❌ 키워드를 추출할 수 없습니다:", reportText);
      alert("키워드를 찾을 수 없습니다.");
    }
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedKeyword("");
  };

  // 컴포넌트 마운트 시 최근 키워드와 스크랩 정보 로드
  useEffect(() => {
    loadRecentKeywords();
    loadScrapInfo(); // 스크랩 정보도 함께 로드

    // 전역 함수로 등록 (다른 컴포넌트에서 사용 가능)
    window.addRecentKeyword = addRecentKeyword;
    window.refreshRecentKeywords = loadRecentKeywords; // 새로고침 함수도 전역으로 등록

    console.log("🌐 전역 함수 등록 완료:");
    console.log("  - window.addRecentKeyword:", typeof window.addRecentKeyword);
    console.log("  - window.refreshRecentKeywords:", typeof window.refreshRecentKeywords);

    // 테스트용 함수 (개발자 도구에서 사용 가능)
    window.testAddKeyword = (keyword) => {
      console.log("🧪 테스트 키워드 추가:", keyword);
      addRecentKeyword(keyword || "테스트키워드");
    };

    window.clearRecentKeywords = () => {
      console.log("🗑️ 최근 키워드 모두 삭제");
      CookieUtils.deleteCookie('recentSearchKeywords');
      localStorage.removeItem('recentSearchKeywords');
      setRecentKeywords([]);
    };

    return () => {
      // 컴포넌트 언마운트 시 전역 함수 제거
      delete window.addRecentKeyword;
      delete window.refreshRecentKeywords;
    };
  }, []);

  // 페이지 포커스 시 키워드 목록 새로고침
  useEffect(() => {
    const handleFocus = () => {
      console.log("🔄 페이지 포커스로 인한 키워드 목록 새로고침");
      loadRecentKeywords();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 스크랩 정보 로드 함수
  const loadScrapInfo = async () => {
    try {
      setScrapLoading(true);
      console.log("🔍 스크랩 정보 로드 시작");

      const response = await fetchWithAuth("/zal/api/mypage/scrap-info", { method: "GET" });


      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setScrapedReports(result.data);
          console.log("✅ 스크랩 정보 로드 성공:", result.data);
        } else {
          console.error("❌ 스크랩 정보 로드 실패:", result.message);
          setScrapedReports(["스크랩 정보를 불러올 수 없습니다."]);
        }
      } else {
        console.error("❌ 스크랩 정보 API 호출 실패");
        setScrapedReports(["로그인이 필요합니다."]);
      }
    } catch (error) {
      console.error("❌ 스크랩 정보 로드 오류:", error);
      setScrapedReports(["스크랩 정보 로드 중 오류가 발생했습니다."]);
    } finally {
      setScrapLoading(false);
    }
  };

  return (
    <section className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-20">
      <h2 className="text-lg font-bold mb-6">내 활동</h2>
      {/* 💥 변경 부분: 이 div에 divide-x와 divide-색상 클래스를 추가하세요. 💥 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-x divide-gray-300">
        {/* div에 border-r 클래스는 제거해야 합니다. divide-x와 중복됩니다. */}
        <div className="pr-3"> {/* 선과 내용 사이에 여백을 줍니다. */}
          <h3 className="mb-2">최근 키워드</h3>
          {recentKeywords.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {recentKeywords.map((keyword, index) => (
                <li key={`${keyword}-${index}`} className="group">
                  <button
                    onClick={() => handleKeywordClick(keyword)}
                    disabled={loading}
                    className={`
                      text-left hover:text-blue-600 hover:underline transition-colors duration-200
                      ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      group-hover:font-medium
                    `}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      font: 'inherit',
                      color: 'inherit'
                    }}
                  >
                    # {keyword}
                    {loading && (
                      <span className="ml-2 text-xs text-gray-500">검색 중...</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm italic">
              아직 검색한 키워드가 없습니다.<br />
              키워드를 검색해보세요!
            </div>
          )}
        </div>
        <div className="pl-3"> {/* 선과 내용 사이에 여백을 줍니다. */}
          <h3 className="mb-2">스크랩 정보</h3>
          {scrapLoading ? (
            <div className="text-gray-500 text-sm italic">
              스크랩 정보를 불러오는 중...
            </div>
          ) : scrapedReports.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {scrapedReports.map((report, index) => (
                <li
                  key={`${report}-${index}`}
                  className="cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                  onClick={() => handleScrapClick(report)}
                  title="클릭하여 상세 정보 보기"
                >
                  {report}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500 text-sm italic">
              아직 스크랩한 아이디어가 없습니다.<br />
              챗봇에서 아이디어를 스크랩해보세요!
            </div>
          )}
        </div>
      </div>

      {/* 콜라보 상세 정보 모달 */}
      <CollabDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        keywordName={selectedKeyword}
        scrapType={selectedScrapType}
      />
    </section>
  );
};

export default ActivityFeedSection;