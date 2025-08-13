import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mainApiService } from "../api/mainApi";
import { keywordApiService } from "../api/sub";
import { useKeywordData } from "../contexts/KeywordDataContext";
import "../assets/css/Main_keyword_card.css";
import img1 from "../assets/img/common/rectangle-125-3.png";
import img2 from "../assets/img/common/rectangle-125-4.png";
import img3 from "../assets/img/common/rectangle-125-5.png";

// 기본 이미지 배열
const defaultImages = [img1, img2, img3];

export default function Main_top3() {
  const navigate = useNavigate();
  const { setKeywordData } = useKeywordData();
  const [hovered, setHovered] = useState(null);
  const [top3Data, setTop3Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getKeywordImagePath = (keyword) => {
  if (!keyword) return "/img/default/이미지없음.png";

  const encodedKeyword = encodeURIComponent(keyword);
  return `/img/default/KeywordsImages/${encodedKeyword}.png`;
};


  // TOP3 데이터 가져오기
  const fetchTop3Data = async () => {
    try {
      setLoading(true);
      const response = await mainApiService.getTop3Keywords();

      // API 응답을 컴포넌트 형식에 맞게 변환
      const formattedData = response.data.map((item, index) => {
        // OpenAI 응답에서 중복 제목 제거
        let description = item.description || '인기 급상승 키워드입니다!';

        // 이미 "📌 잘파세대 열광 포인트:"가 포함되어 있으면 제거
        if (description.includes('📌 잘파세대 열광 포인트:')) {
          description = description.replace('📌 잘파세대 열광 포인트:', '').trim();
        }

        return {
          id: item.rank,
          image: defaultImages[index] || defaultImages[0],
          title: item.keyword,
          desc: `📌 잘파세대 열광 포인트:\n${description}`,
          count: item.count,
          trend: item.trend,
          color: item.color
        };
      });

      setTop3Data(formattedData);
      setError(null);
    } catch (err) {
      console.error('TOP3 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');

      // 에러 시 기본 데이터 사용
      setTop3Data([
        {
          id: 1,
          image: defaultImages[0],
          title: "탕후루",
          desc: "📌 잘파세대 열광 포인트:\n달콤 바삭한 비주얼과 식감으로 SNS를 장악한 길거리 간식!",
        },
        {
          id: 2,
          image: defaultImages[1],
          title: "마라탕",
          desc: "📌 잘파세대 열광 포인트:\n맵고 얼얼한 중독성, 커스텀의 즐거움으로 MZ세대를 사로잡다",
        },
        {
          id: 3,
          image: defaultImages[2],
          title: "제로음료",
          desc: "📌 잘파세대 열광 포인트:\n건강과 맛을 동시에, 죄책감 없이 즐기는 음료 트렌드",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 (한 번만 실행)
  useEffect(() => {
    console.log("🚀 Main_top3 컴포넌트 마운트 - TOP3 키워드 로딩 시작");
    fetchTop3Data();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 심층분석 버튼 클릭 핸들러
  const handleAnalysisClick = async (keyword) => {
    // 🔥 심층분석 클릭도 최근 검색 키워드에 추가
    if (window.addRecentKeyword) {
      window.addRecentKeyword(keyword);
      console.log("💾 심층분석 키워드를 최근 검색에 추가:", keyword);
    }

    try {
      console.log("🔍 심층분석 시작:", keyword);

      // 키워드 검색 API 호출
      const data = await keywordApiService.searchKeyword(keyword);

      // 전역 상태에 타임스탬프와 함께 저장
      const updatedData = {
        ...data,
        searchTimestamp: Date.now(),
        searchKeyword: keyword
      };

      // 검색 결과를 전역 상태에 저장
      setKeywordData(updatedData);

      // Sub 페이지로 이동
      navigate("/sub");

      console.log("✅ 심층분석 페이지 이동 완료:", keyword);

    } catch (error) {
      console.error("❌ 심층분석 이동 실패:", error);
      alert("심층분석 페이지로 이동하는 중 오류가 발생했습니다.");
    }
  };

  return (
    <section className="trending-section top3">
      {/* ── 왼쪽 소개 ─────────────────────── */}
      <header id="keyword-section-title" className="intro-box">
          {/* h2 → h1 로 변경 */}
          <h1>
            <strong>가장핫한 키워드<br /></strong>
            <strong>TOP&nbsp;3</strong>
          </h1>

          <p>
            EAT&nbsp;PICK 선정&nbsp;TOP3<br />
            심층 분석 해 보러가요.
          </p>

          {/* note 클래스 그대로 */}
          <p className="note top3__note">
            ※ 심층분석 보러가기 버튼을 눌러보세요
          </p>
        </header>

      {/* ── 카드 영역 ─────────────────────── */}
      <div className="card-list top3__cards">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span className="loading-text">TOP3 키워드를 불러오는 중</span>
            <div className="loading-dots">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchTop3Data}>다시 시도</button>
          </div>
        ) : (
          top3Data.map(({ id, title, desc }) => (
            <article
              key={id}
              className={`keyword-card top3__card${hovered === id ? " is-hover" : ""}`}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
            <img
              src={getKeywordImagePath(title)}
              alt={title}
              onError={(e) => {
                e.target.onerror = null; // 무한루프 방지
                e.target.src = "/img/default/KeywordsImages/noImg.png";
              }}
              />

              {/* ↓↓↓ 카드 내부 콘텐츠 래퍼 추가 ↓↓↓ */}
              <div className="card-body">
                <h3>{title}</h3>


                {/* 요약 문단에 카드 공통 클래스 부여 */}
                {desc.split("\n").map((line, i) => (
                  <p key={i} className="card-summary">
                    {line}
                  </p>
                ))}

                <button
                  aria-label={`${title} 심층분석 보러가기`}
                  onClick={() => handleAnalysisClick(title)}
                >
                  심층분석 보러가기
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export { Main_top3 };