import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* 예시 데이터 → 실제 API 값으로 교체 */
const positiveData = [
  { name: "감동", value: 240 },
  { name: "기쁨", value: 186 },
  { name: "즐거움", value: 156 },
];
const negativeData = [
  { name: "분노", value: 275 },
  { name: "재미없음", value: 257 },
  { name: "불안", value: 175 },
];

/* 공통 차트 옵션 */
const AxisStyle = { fontSize: 12 };

export function DetailInsightsKOTE_positivity_Graph({
  positiveCount = 0,
  totalCount = 0,
  topEmotions = [],
  comments = []
}) {
  // TOP 3 감정 데이터 활용
  const chartData = topEmotions.length > 0
    ? topEmotions.map(emotion => ({
        name: emotion.emotion,
        value: emotion.count
      }))
    : positiveData; // 기본 데이터

  // 댓글 6개만 표시 (TOP 3 감정별로 각각 2개씩)
  const displayComments = comments.slice(0, 6);

  return (
    <div className="koteChart">
      <h3 className="koteChart__title koteChart__title--positive">
        긍정 감정 TOP {Math.min(topEmotions.length, 3)} ({positiveCount}개)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
          <XAxis
            dataKey="name"
            tick={AxisStyle}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={AxisStyle} />
          <Tooltip
            formatter={(value) => [value + '개', '감정 수']}
            labelFormatter={(label) => `감정: ${label}`}
          />
          <Bar dataKey="value" fill="#00c851" barSize={40} />
        </BarChart>
      </ResponsiveContainer>

      {/* 긍정 댓글 4개 표시 */}
      <div className="emotion-comments">
        <h4 className="emotion-comments__title">긍정 댓글 예시 (TOP 3 감정별)</h4>
        <div className="emotion-comments__list">
          {displayComments.length > 0 ? (
            displayComments.map((comment, index) => {
              // 플랫폼에 따른 클래스명 결정
              const platformClass = comment.platform?.toLowerCase() === 'youtube'
                ? 'emotion-comment__platform--youtube'
                : comment.platform?.toLowerCase() === 'instagram'
                ? 'emotion-comment__platform--instagram'
                : '';

              return (
                <div key={index} className="emotion-comment">
                  <span className={`emotion-comment__platform ${platformClass}`}>
                    {comment.platform?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <p className="emotion-comment__text">💬 {comment.comment_text}</p>
                  <span className="emotion-comment__emotion">#{comment.emotion}</span>
                </div>
              );
            })
          ) : (
            <div className="emotion-comment emotion-comment--placeholder">
              <p className="emotion-comment__text">댓글 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DetailInsightsKOTE_negative_Graph({
  negativeCount = 0,
  topEmotions = [],
  comments = []
}) {
  // TOP 3 감정 데이터 활용
  const chartData = topEmotions.length > 0
    ? topEmotions.map(emotion => ({
        name: emotion.emotion,
        value: emotion.count
      }))
    : negativeData; // 기본 데이터

  // 댓글 6개만 표시 (TOP 3 감정별로 각각 2개씩)
  const displayComments = comments.slice(0, 6);

  return (
    <div className="koteChart">
      <h3 className="koteChart__title koteChart__title--negative">
        부정 감정 TOP {Math.min(topEmotions.length, 3)} ({negativeCount}개)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
          <XAxis
            dataKey="name"
            tick={AxisStyle}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tick={AxisStyle} />
          <Tooltip
            formatter={(value) => [value + '개', '감정 수']}
            labelFormatter={(label) => `감정: ${label}`}
          />
          <Bar dataKey="value" fill="#ff4444" barSize={40} />
        </BarChart>
      </ResponsiveContainer>

      {/* 부정 댓글 4개 표시 */}
      <div className="emotion-comments">
        <h4 className="emotion-comments__title">부정 댓글 예시 (TOP 3 감정별)</h4>
        <div className="emotion-comments__list">
          {displayComments.length > 0 ? (
            displayComments.map((comment, index) => {
              // 플랫폼에 따른 클래스명 결정
              const platformClass = comment.platform?.toLowerCase() === 'youtube'
                ? 'emotion-comment__platform--youtube'
                : comment.platform?.toLowerCase() === 'instagram'
                ? 'emotion-comment__platform--instagram'
                : '';

              return (
                <div key={index} className="emotion-comment">
                  <span className={`emotion-comment__platform ${platformClass}`}>
                    {comment.platform?.toUpperCase() || 'UNKNOWN'}
                  </span>
                  <p className="emotion-comment__text">💬 {comment.comment_text}</p>
                  <span className="emotion-comment__emotion">#{comment.emotion}</span>
                </div>
              );
            })
          ) : (
            <div className="emotion-comment emotion-comment--placeholder">
              <p className="emotion-comment__text">댓글 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
