import React from "react";
import { useUser } from "../contexts/UserContext";

import {DetailBubbleChart} from "../UI/DetailbubleChart";
import "../assets/css/Detailsame.css";

export default function TrendAnalysisSection({ keyword = "말차", similarityInfo, similarKeywords = [] }) {
  const { user } = useUser();

  // 디버깅 로그
  console.log("TrendAnalysisSection props:", { keyword, similarityInfo, similarKeywords });

  // 디버깅용 로그
  console.log("TrendAnalysisSection props:", { keyword, similarityInfo, similarKeywords });

  // 실제 데이터 처리 - 더 생동감 있는 색상과 배치
  const colors = [
    "#FF6B6B", // 코랄 레드
    "#4ECDC4", // 터쿠아즈
    "#45B7D1", // 스카이 블루
    "#96CEB4", // 민트 그린
    "#FFEAA7"  // 소프트 옐로우
  ];
  // 키워드 개수에 따른 동적 위치 계산
  const getPositionsForCount = (count) => {
    const basePositions = [
      { top: 50, left: 120, size: 200 },   // 가장 큰 버블 (중앙 상단)
      { top: 120, left: 20, size: 150 },   // 두 번째 (왼쪽)
      { top: 30, left: 250, size: 120 },   // 세 번째 (오른쪽 상단)
      { top: 200, left: 180, size: 100 },  // 네 번째 (오른쪽 하단)
      { top: 180, left: 80, size: 80 }     // 다섯 번째 (왼쪽 하단)
    ];

    // 키워드 개수가 적으면 크기를 조정하여 더 균형있게 배치
    if (count <= 3) {
      return basePositions.slice(0, count).map((pos) => ({
        ...pos,
        size: pos.size + (20 * (3 - count)) // 개수가 적으면 크기 증가
      }));
    }

    return basePositions.slice(0, count);
  };

  // 유사 키워드 데이터 확인 및 처리 (중복 제거)
  const getSimilarKeywordsFromInfo = () => {
    if (!similarityInfo) return [];

    const keywords = [];
    const seenKeywords = new Set(); // 중복 제거용

    for (let i = 1; i <= 5; i++) {
      const keywordName = similarityInfo[`SIMILAR_${i}_NAME`];
      if (keywordName && keywordName !== "null" && keywordName.trim() !== "" && !seenKeywords.has(keywordName)) {
        seenKeywords.add(keywordName);
        keywords.push({ KEYWORD_NAME: keywordName });
      }
    }
    return keywords;
  };

  // similarityInfo에서 키워드 이름들을 가져오거나, 없으면 similarKeywords 사용
  const keywordsToDisplay = getSimilarKeywordsFromInfo();

  // similarKeywords에서도 중복 제거
  const uniqueSimilarKeywords = similarKeywords ?
    similarKeywords.filter((keyword, index, self) =>
      index === self.findIndex(k => k.KEYWORD_NAME === keyword.KEYWORD_NAME)
    ) : [];

  const hasValidSimilarKeywords = keywordsToDisplay.length > 0 || uniqueSimilarKeywords.length > 0;

  // 실제 표시할 키워드 목록 결정
  const finalKeywords = keywordsToDisplay.length > 0 ? keywordsToDisplay : uniqueSimilarKeywords;

  console.log("키워드 처리 결과:", {
    keywordsFromInfo: keywordsToDisplay,
    keywordsFromProps: similarKeywords,
    uniqueSimilarKeywords: uniqueSimilarKeywords,
    finalKeywords: finalKeywords,
    hasValidSimilarKeywords: hasValidSimilarKeywords
  });

  // 유사 키워드 데이터를 버블 차트 형식으로 변환
  const trendData = hasValidSimilarKeywords
    ? finalKeywords.slice(0, 5).map((keyword, index) => {
        // 유사도 점수 계산 (실제 키워드 개수에 따라 조정)
        const totalKeywords = finalKeywords.length;
        const scoreStep = totalKeywords > 1 ? Math.floor(70 / (totalKeywords - 1)) : 0;
        const similarityScore = Math.max(95 - (index * scoreStep), 25);

        // 키워드 개수에 맞는 위치 가져오기
        const positions = getPositionsForCount(totalKeywords);

        return {
          id: index + 1,
          pct: `${similarityScore}%`,
          label: keyword.KEYWORD_NAME,
          color: colors[index],
          size: positions[index].size,
          top: positions[index].top,
          left: positions[index].left
        };
      })
    : [];

  // 유사 이유 텍스트
  const similarityReason = hasValidSimilarKeywords
    ? (similarityInfo?.REASON || `${keyword}와 유사한 키워드들을 분석하여 확장된 마케팅 전략을 고려해볼 수 있습니다.`)
    : `아직 ${keyword}에 대한 유사 키워드 분석이 준비되지 않았습니다. 곧 업데이트될 예정입니다.`;

  return (
    <div className="detailSame">
      {/* ------- 제목 & 부제 ------- */}
      <header className="detailSame__header">
        <h2 className="detailSame__title">비슷한 키워드 TOP5</h2>
        <p className="detailSame__subtitle">
          {user?.nickname || '찝찝박사'}님이 고르신 키워드로 EatPICK이 만들어드려요
        </p>
      </header>

      {/* ------- 카드 ------- */}
      <section className="trendCard" role="region" aria-labelledby="trend-title">
        <h3 id="trend-title" className="sr-only">
          비슷한 키워드 TOP5 버블 차트
        </h3>

        {hasValidSimilarKeywords ? (
          <DetailBubbleChart data={trendData} />
        ) : (
          <div className="no-data-message">
            <div className="icon">🔍</div>
            <h4>유사 키워드 분석 준비중</h4>
            <p>
              현재 <strong>{keyword}</strong>에 대한<br />
              유사 키워드를 수집하고 있습니다
            </p>
          </div>
        )}

        <p className="trendCard__desc">
          {similarityReason}
        </p>
      </section>
    </div>
  );
}
export {TrendAnalysisSection}
