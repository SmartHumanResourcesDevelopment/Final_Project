import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/Main_search.css";
import searchIcon from "../assets/img/common/search.png";
import { keywordApiService } from "../api/sub";


function Main_search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [popularKeywords, setPopularKeywords] = useState(["마라탕", "민트초코", "말차", "탕후루", "마라탕"]);
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 키워드 검색 시작:", searchQuery);

      const data = await keywordApiService.searchKeyword(searchQuery.trim());

      console.log("✅ 검색 성공:", data);
      setSearchResults(data);

      // 키워드 정보가 없는 경우 에러 메시지 설정
      if (!data.keywordInfo) {
        setError(data.message || '검색 결과를 찾을 수 없습니다.');
      } else {
        setError(''); // 성공한 경우 에러 메시지 초기화

        // 검색 성공 시 Sub 페이지로 이동하면서 키워드 데이터 전달
        navigate('/sub', {
          state: {
            keywordData: {
              keyword: data.keywordInfo.KEYWORD_NAME,
              ranking: data.mainStats && data.mainStats.length > 0 ?
                       `${data.mainStats[0].CURRENT_RANK}등` : "순위 정보 없음",
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

    } catch (err) {
      console.error("❌ 검색 실패:", err);
      setError(err.message || "검색 중 오류가 발생했습니다.");
      setSearchResults(null); // 에러 시 검색 결과 초기화
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

  /* 입력 변경 처리 */
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  /* 컴포넌트 마운트 시 인기 키워드 로드 */
  useEffect(() => {
    loadPopularKeywords();
  }, []);

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
        />

        <button type="submit" aria-label="검색" disabled={loading}>
          {loading ? (
            <span>검색중...</span>
          ) : (
            <img src={searchIcon} alt="" />
          )}
        </button>
      </form>

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

      {/* 검색 결과 미리보기 (옵션) */}
      {searchResults && (
        <div className="keyword-search__results" style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          fontSize: '14px'
        }}>
          <strong>검색 결과:</strong> "{searchResults.keywordInfo?.KEYWORD_NAME}"
          {searchResults.keywordInfo?.total_mentions &&
            ` (총 ${searchResults.keywordInfo.total_mentions}회 언급)`
          }
        </div>
      )}
    </section>
  );
}

// Named export와 default export 모두 제공
export { Main_search };
export default Main_search;