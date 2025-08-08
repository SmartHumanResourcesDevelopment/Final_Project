import React, { useState, useEffect } from "react";
import { mainApiService } from "../api/mainApi";
import "../assets/css/Main_keyword_card.css";
import img1 from "../assets/img/common/rectangle-125-3.png";
import img2 from "../assets/img/common/rectangle-125-4.png";
import img3 from "../assets/img/common/rectangle-125-5.png";

// 기본 이미지 배열
const defaultImages = [img1, img2, img3];

export default function Main_top3() {
  const [hovered, setHovered] = useState(null);
  const [top3Data, setTop3Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchTop3Data();
  }, []);

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
          <div className="loading-message">
            <p>TOP3 키워드를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchTop3Data}>다시 시도</button>
          </div>
        ) : (
          top3Data.map(({ id, image, title, desc }) => (
            <article
              key={id}
              className={`keyword-card top3__card${hovered === id ? " is-hover" : ""}`}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              <img src={image} alt={`${title} 이미지`} />

              {/* ↓↓↓ 카드 내부 콘텐츠 래퍼 추가 ↓↓↓ */}
              <div className="card-body">
                <h3>{title}</h3>


                {/* 요약 문단에 카드 공통 클래스 부여 */}
                {desc.split("\n").map((line, i) => (
                  <p key={i} className="card-summary">
                    {line}
                  </p>
                ))}

                <button aria-label={`${title} 심층분석 보러가기`}>
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
