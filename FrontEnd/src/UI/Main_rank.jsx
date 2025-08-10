import React, { useState, useEffect } from "react";
import { mainApiService } from "../api/mainApi";
import "../assets/css/Main_rank.css"; // 메인 페이지 스타일

const timePeriods = ["6개월", "1년"];

export default function Main_rank() {
  const [activePeriod, setActivePeriod] = useState("6개월");
  const [rankingData, setRankingData] = useState([]);
  const [maxCnt, setMaxCnt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API에서 랭킹 데이터 가져오기
  const fetchRankingData = async (period) => {
    try {
      setLoading(true);
      console.log(`📊 랭킹 데이터 요청: ${period}`);

      const response = await mainApiService.getRanking(period);
      const data = response.data;

      setRankingData(data);
      setMaxCnt(response.maxCount);
      setError(null);

      // console.log(`✅ 랭킹 데이터 로드 성공: ${data.length}개`);
      // console.log(`📊 maxCount: ${response.maxCount}`);
      // console.log(`📊 첫 번째 데이터:`, data[0]);
    } catch (err) {
      console.error('❌ 랭킹 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');

      // 에러 시 더미 데이터 사용
      const dummyData = [
        { rank: 1, name: "탕후루", trend: "⬆", color: "#e60000", count: 1020 },
        { rank: 2, name: "마라탕", trend: "↔", color: "#000000", count: 980 },
        { rank: 3, name: "제로음료", trend: "⬇", color: "#0044ff", count: 903 },
        { rank: 4, name: "포케", trend: "↔", color: "#000000", count: 892 },
        { rank: 5, name: "인절미 토스트", trend: "↔", color: "#000000", count: 810 }
      ];
      setRankingData(dummyData);
      setMaxCnt(1020);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드 및 기간 변경 시 재로드
  useEffect(() => {
    console.log("🚀 Main_rank 컴포넌트 - 랭킹 데이터 로딩:", activePeriod);
    fetchRankingData(activePeriod);
  }, [activePeriod]); // activePeriod 변경 시에만 재실행

  // 기간 변경 핸들러
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };

  return (
    <section className="stats">
      {/* ----- 왼쪽 소개 카드 ----- */}
      <div className="stats__card">
        <h2>
          주목해야할 키워드<br />TOP&nbsp;10
        </h2>
        <p>
          EAT&nbsp;PICK선정&nbsp;TOP20<br />
          같이 핫한 키워드를 찾아봐요
        </p>
        <a href="#" aria-label="전체 키워드 보기">
          전체보기&nbsp;&gt;
        </a>
      </div>

      {/* ----- 오른쪽 랭킹 그래프 ----- */}
      <div className="stats__chart">
        {/* 기간 선택 탭 */}
        <div className="stats__tabs">
          {timePeriods.map((t) => (
            <button
              key={t}
              className={t === activePeriod ? "is-active" : ""}
              onClick={() => handlePeriodChange(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 랭킹 리스트 */}
        {loading ? (
          <div className="loading-state">
            <p>데이터를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p style={{ color: '#e60000' }}>{error}</p>
            <button onClick={() => fetchRankingData(activePeriod)}>
              다시 시도
            </button>
          </div>
        ) : (
          <ol className="ranking-list">
            {rankingData.map(({ rank, name, trend, color, count }) => {
              // 원래 비율 계산
              const originalWidth = maxCnt > 0 ? (count / maxCnt) * 100 : 0;

              // 순위별로 조금씩 짧아지도록 조정 (1위=100%, 2위=95%, 3위=90%...)
              const adjustedWidth = Math.max(
                100 - (rank - 1) * 5, // 순위별로 5%씩 감소
                30 // 최소 30% 보장
              );

              // console.log(`🎯 ${name}: 원래=${originalWidth.toFixed(1)}%, 조정=${adjustedWidth}%`);

              return (
                <li key={rank} className="ranking-item">
                  <span className="ranking-item__label">
                    {rank}위 {name}
                    <span style={{ color }}>{` (${trend})`}</span>
                  </span>

                <div style={{
                  width: '170px',
                  height: '20px',
                  backgroundColor: '#ffffff',
                  margin: '5px 0',
                  position: 'relative',
                  borderRadius: '0 5px 5px 0' // 오른쪽만 둥글게
                }}>
                  <div
                    style={{
                      width: `${adjustedWidth}%`,
                      height: '100%',
                      backgroundColor: '#87CEEB', // 하늘색으로 통일
                      transition: 'width 0.3s ease',
                      borderRadius: '0 5px 5px 0' // 오른쪽만 둥글게
                    }}
                    title={`${rank}위 ${name}: ${count}건 (실제 비율: ${Math.round(originalWidth)}%)`}
                  />
                </div>

                <span className="ranking-item__count">
                  {count.toLocaleString()}건
                </span>
              </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
export {Main_rank}