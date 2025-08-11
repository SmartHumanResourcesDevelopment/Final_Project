import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { keywordApiService } from "../api/sub";

// 쿠키 관리 유틸리티 함수
const CookieUtils = {
  // 쿠키 설정 (24시간 유효)
  setCookie: (name, value, hours = 24) => {
    const expires = new Date();
    expires.setTime(expires.getTime() + (hours * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  },

  // 쿠키 가져오기
  getCookie: (name) => {
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
  },

  // 쿠키 삭제
  deleteCookie: (name) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
};

export const ActivityFeedSection = () => {
  const navigate = useNavigate();
  const [recentKeywords, setRecentKeywords] = useState([]);
  const [loading, setLoading] = useState(false);

  // 쿠키에서 최근 검색 키워드 불러오기
  const loadRecentKeywords = () => {
    try {
      const savedKeywords = CookieUtils.getCookie('recentSearchKeywords');
      if (savedKeywords) {
        const keywords = JSON.parse(savedKeywords);
        setRecentKeywords(keywords);
        console.log("📋 최근 검색 키워드 로드:", keywords);
      } else {
        setRecentKeywords([]);
        console.log("📋 저장된 검색 키워드 없음");
      }
    } catch (error) {
      console.error("❌ 최근 검색 키워드 로드 실패:", error);
      setRecentKeywords([]);
    }
  };

  // 새로운 키워드 추가 (외부에서 호출 가능하도록 전역 함수로 등록)
  const addRecentKeyword = (keyword) => {
    try {
      if (!keyword || keyword.trim() === '') return;

      const trimmedKeyword = keyword.trim();
      let currentKeywords = [];

      // 기존 키워드 가져오기
      const savedKeywords = CookieUtils.getCookie('recentSearchKeywords');
      if (savedKeywords) {
        currentKeywords = JSON.parse(savedKeywords);
      }

      // 중복 제거 (대소문자 구분 없이)
      currentKeywords = currentKeywords.filter(
        k => k.toLowerCase() !== trimmedKeyword.toLowerCase()
      );

      // 새 키워드를 맨 앞에 추가
      currentKeywords.unshift(trimmedKeyword);

      // 최대 7개까지만 유지
      if (currentKeywords.length > 7) {
        currentKeywords = currentKeywords.slice(0, 7);
      }

      // 쿠키에 저장 (24시간)
      CookieUtils.setCookie('recentSearchKeywords', JSON.stringify(currentKeywords), 24);

      // 상태 업데이트
      setRecentKeywords(currentKeywords);

      console.log("✅ 검색 키워드 저장:", trimmedKeyword);
      console.log("📋 현재 키워드 목록:", currentKeywords);

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

  // 컴포넌트 마운트 시 최근 키워드 로드
  useEffect(() => {
    loadRecentKeywords();

    // 전역 함수로 등록 (다른 컴포넌트에서 사용 가능)
    window.addRecentKeyword = addRecentKeyword;

    return () => {
      // 컴포넌트 언마운트 시 전역 함수 제거
      delete window.addRecentKeyword;
    };
  }, []);

  const scrapedReports = [
    "냉라면에 관한 보고서", "비건에 관한 보고서", "하입푸드에 관한 보고서",
    "초코바나나에 관한 보고서", "멜론킥에 관한 보고서", "민초에 관한 보고서",
    "말차에 관한 보고서",
  ];

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
          <ul className="list-disc list-inside">
            {scrapedReports.map(report => (
              <li key={report}>{report}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ActivityFeedSection;