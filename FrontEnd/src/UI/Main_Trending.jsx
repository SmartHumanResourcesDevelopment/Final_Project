import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import rectangle1251 from "../assets/img/common/rectangle-125-1.png";
import rectangle1252 from "../assets/img/common/rectangle-125-2.png";
import rectangle1253 from "../assets/img/common/rectangle-125-3-3.png";
import "../assets/css/Main_keyword_card.css";   // 공통 CSS
import { mainApiService } from "../api/mainApi";
import { keywordApiService } from "../api/sub";
import { useKeywordData } from "../contexts/KeywordDataContext";

export default function Main_Trending() {
  const navigate = useNavigate();
  const { setKeywordData: setGlobalKeywordData } = useKeywordData();
  const [hovered, setHovered] = useState(null);
  const [keywordData, setKeywordData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false); // 중복 요청 방지

  // 기본 이미지 배열
  const defaultImages = [rectangle1251, rectangle1252, rectangle1253];
  
  const getKeywordImagePath = (keyword) => {
      if (!keyword) return "/img/default/이미지없음.png";

      const encodedKeyword = encodeURIComponent(keyword);
      return `/img/default/KeywordsImages/${encodedKeyword}.png`;
    };


  // 급상승 키워드 데이터 로드
  const fetchTrendingKeywords = async () => {
    // 중복 요청 방지
    if (isRequesting) {
      console.log("⚠️ 이미 요청 중입니다. 중복 요청 방지");
      return;
    }

    try {
      setIsRequesting(true);
      console.log("📈 급상승 키워드 데이터 로드 시작 (타임아웃: 120초)");
      const data = await mainApiService.getTrendingKeywords();
      console.log("📋 API 응답 데이터:", data);

      if (data.trendingKeywords && Array.isArray(data.trendingKeywords)) {
        console.log("📊 조회된 키워드 수:", data.trendingKeywords.length);
        console.log("📊 키워드 목록:", data.trendingKeywords.map(item => item.keyword));

        // API 데이터를 컴포넌트 형식에 맞게 변환
        const formattedData = data.trendingKeywords.map((item, index) => ({
          id: item.rank || index + 1,
          title: item.keyword,
          summary: item.summary || item.description || `${item.keyword}가 최근 ${item.growth} 증가하며 주목받고 있습니다. 총 ${item.count}회 언급되었습니다.`,
          image: defaultImages[index] || rectangle1251,
          count: item.count,
          growth: item.growth,
          rank: item.rank
        }));

        console.log("🎯 변환된 카드 데이터:", formattedData);
        setKeywordData(formattedData);
        console.log("✅ 급상승 키워드 데이터 로드 성공 - 카드 " + formattedData.length + "개 생성");
      } else {
        console.error("❌ 키워드 데이터 형식 오류:", data);
        throw new Error("키워드 데이터 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("❌ 급상승 키워드 로드 실패:", err);
      console.error("❌ 에러 상세:", err.response?.data || err.message);
      setError(err.message);

      // 에러 시 빈 데이터 사용
      setKeywordData([]);
    } finally {
      setLoading(false);
      setIsRequesting(false); // 요청 완료 상태로 변경
      console.log("✅ 급상승 키워드 요청 완료");
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 (한 번만 실행)
  useEffect(() => {
    console.log("🚀 Main_Trending 컴포넌트 마운트 - 급상승 키워드 로딩 시작");
    fetchTrendingKeywords();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 심층분석 버튼 클릭 핸들러
  const handleCardClick = async (id) => {
    const keyword = keywordData.find(k => k.id === id);
    if (!keyword) {
      console.error("❌ 키워드를 찾을 수 없습니다:", id);
      return;
    }

    // 🔥 트렌딩 카드 클릭도 최근 검색 키워드에 추가
    if (window.addRecentKeyword) {
      window.addRecentKeyword(keyword.title);
      console.log("💾 트렌딩 키워드를 최근 검색에 추가:", keyword.title);
    }

    try {
      console.log("🔍 심층분석 시작:", keyword.title);

      // 키워드 검색 API 호출
      const data = await keywordApiService.searchKeyword(keyword.title);

      // 검색 결과를 전역 상태에 저장
      setGlobalKeywordData(data);

      // Sub 페이지로 이동
      navigate("/sub");

      console.log("✅ 심층분석 페이지 이동 완료:", keyword.title);

    } catch (error) {
      console.error("❌ 심층분석 이동 실패:", error);
      alert("심층분석 페이지로 이동하는 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <section className="trending-section" aria-labelledby="keyword-section-title">
        <header id="keyword-section-title" className="intro-box">
          <h1>
            급상승 키워드<br />TOP&nbsp;3
          </h1>
          <p>
            최근 한 달간 가장 많이<br />
            언급된 급상승 키워드 TOP3
          </p>
        </header>
        <div className="card-list">
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            fontSize: '1.2rem',
            color: '#666'
          }}>
            📈 급상승 키워드를 분석하고 있습니다...
          </div>
        </div>
      </section>
    );
  }

  // 렌더링 시 현재 데이터 상태 확인
  console.log("🎨 렌더링 중 - keywordData 상태:", keywordData);
  console.log("🎨 렌더링 중 - 카드 개수:", keywordData.length);

  return (
    <section className="trending-section" aria-labelledby="keyword-section-title">
      {/* ── 왼쪽 설명 */}
      <header id="keyword-section-title" className="intro-box">
        <h1>
          잠재키워드<br />TOP&nbsp;3
        </h1>
        <p>
          최근 한 달간 가장 많이<br />
          언급된 급상승 키워드 TOP3
        </p>
        <p className="note">※ 심층분석 보러가기 버튼을 눌러보세요</p>
      </header>

      {/* ── 카드 리스트 */}
      <div className="card-list">
        {keywordData.length > 0 ? (
          keywordData.map((k) => {
            console.log("🎨 카드 렌더링:", k.title, k.summary?.substring(0, 30) + "...");
            return (
          <article
            key={k.id}
            className={`keyword-card${hovered === k.id ? " is-hover" : ""}`}
            onMouseEnter={() => setHovered(k.id)}
            onMouseLeave={() => setHovered(null)}
            aria-labelledby={`keyword-title-${k.id}`}
          >
             <img
              src={getKeywordImagePath(k.title)}
              alt={k.title}
              onError={(e) => {
                e.target.onerror = null; // 무한루프 방지
                e.target.src = "/img/default/KeywordsImages/noImg.png";
              }}
              />

            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 id={`keyword-title-${k.id}`}>{k.title}</h3>
                <span style={{
                  color: '#28a745',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  background: '#e8f5e8',
                  padding: '2px 8px',
                  borderRadius: '12px'
                }}>
                  {k.growth}
                </span>
              </div>
              <p className="card-summary">
                ✅요약:<br />
                {k.summary}
              </p>
              <div style={{
                fontSize: '0.85rem',
                color: '#666',
                marginBottom: '10px'
              }}>
                📊 언급량: {k.count?.toLocaleString()}회
              </div>
              <button onClick={() => handleCardClick(k.id)}>
                심층분석 보러가기
              </button>
            </div>
          </article>
            );
          })
        ) : (
          <div>데이터 로딩 중...</div>
        )}
      </div>
    </section>
  );
}

export { Main_Trending };