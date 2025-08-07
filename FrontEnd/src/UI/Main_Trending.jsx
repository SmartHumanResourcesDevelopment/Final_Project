import React, { useState, useEffect } from "react";
import rectangle1251 from "../assets/img/common/rectangle-125-1.png";
import rectangle1252 from "../assets/img/common/rectangle-125-2.png";
import rectangle1253 from "../assets/img/common/rectangle-125-3-3.png";
import "../assets/css/Main_keyword_card.css";   // 공통 CSS
import { mainApiService } from "../api/mainApi";

export default function Main_Trending() {
  const [hovered, setHovered] = useState(null);
  const [keywordData, setKeywordData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 기본 이미지 배열
  const defaultImages = [rectangle1251, rectangle1252, rectangle1253];

  // 급상승 키워드 데이터 로드
  const fetchTrendingKeywords = async () => {
    try {
      console.log("📈 급상승 키워드 데이터 로드 시작");
      const data = await mainApiService.getTrendingKeywords();

      if (data.trendingKeywords && Array.isArray(data.trendingKeywords)) {
        // API 데이터를 컴포넌트 형식에 맞게 변환
        const formattedData = data.trendingKeywords.map((item, index) => ({
          id: item.rank || index + 1,
          title: item.keyword,
          summary: item.description || `${item.keyword}가 최근 ${item.growth} 증가하며 주목받고 있습니다. 총 ${item.count}회 언급되었습니다.`,
          image: defaultImages[index] || rectangle1251,
          count: item.count,
          growth: item.growth,
          rank: item.rank
        }));

        setKeywordData(formattedData);
        console.log("✅ 급상승 키워드 데이터 로드 성공:", formattedData);
      } else {
        throw new Error("키워드 데이터 형식이 올바르지 않습니다.");
      }
    } catch (err) {
      console.error("❌ 급상승 키워드 로드 실패:", err);
      setError(err.message);

      // 에러 시 기본 데이터 사용
      setKeywordData([
        {
          id: 1,
          title: "먹방",
          summary: "유튜브와 인스타그램에서 폭발적 증가하며 주목받고 있습니다.",
          image: rectangle1251,
          count: 1250,
          growth: "+45%",
          rank: 1
        },
        {
          id: 2,
          title: "간식",
          summary: "건강한 간식 트렌드로 주목받는 중입니다.",
          image: rectangle1252,
          count: 980,
          growth: "+32%",
          rank: 2
        },
        {
          id: 3,
          title: "딸기",
          summary: "계절 과일로 디저트 메뉴에서 인기를 얻고 있습니다.",
          image: rectangle1253,
          count: 756,
          growth: "+28%",
          rank: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchTrendingKeywords();
  }, []);

  const handleCardClick = (id) => {
    const keyword = keywordData.find(k => k.id === id);
    console.log(`심층분석 보러가기 ← ${keyword?.title} (${keyword?.growth})`);
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

  return (
    <section className="trending-section" aria-labelledby="keyword-section-title">
      {/* ── 왼쪽 설명 */}
      <header id="keyword-section-title" className="intro-box">
        <h1>
          급상승 키워드<br />TOP&nbsp;3
        </h1>
        <p>
          최근 한 달간 가장 많이<br />
          언급된 급상승 키워드 TOP3
        </p>
        <p className="note">※ 심층분석 보러가기 버튼을 눌러보세요</p>
      </header>

      {/* ── 카드 리스트 */}
      <div className="card-list">
        {keywordData.map((k) => (
          <article
            key={k.id}
            className={`keyword-card${hovered === k.id ? " is-hover" : ""}`}
            onMouseEnter={() => setHovered(k.id)}
            onMouseLeave={() => setHovered(null)}
            aria-labelledby={`keyword-title-${k.id}`}
          >
            <img src={k.image} alt={`${k.title} 관련 이미지`} />

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
        ))}
      </div>
    </section>
  );
}

export { Main_Trending };