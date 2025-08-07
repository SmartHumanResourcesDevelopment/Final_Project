import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { mainApiService } from "../api/mainApi";

/* 키워드별 색상 */
const KEYWORD_COLORS = {
  "먹방": "#ff0040",
  "간식": "#ff4cf9",
  "딸기": "#4f6ff5",
  "과일": "#00c851",
  "레시피": "#ff8800",
  "초콜릿": "#8b4513",
  "동결건조": "#17a2b8",
  "불닭": "#dc3545",
  "요리": "#6f42c1",
  "구매": "#20c997"
};

export default function Top3graph({ period = "6개월" }) {
  const [chartData, setChartData] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // TOP3 인사이트 데이터 가져오기
  const fetchTop3Insights = async () => {
    try {
      setLoading(true);
      const response = await mainApiService.getTop3Insights(period);

      // API 응답 데이터를 차트 형식으로 변환
      const formattedData = response.chartData.map(item => {
        const formatted = {
          period: item.period // "02월", "07/15", "6월2주" 등
        };

        // 각 키워드의 데이터 추가
        response.keywords.forEach(keyword => {
          formatted[keyword] = item[keyword] || 0;
        });

        return formatted;
      });

      setChartData(formattedData);
      setKeywords(response.keywords);
      setError(null);

      console.log("📊 TOP3 차트 데이터:", formattedData);
      console.log("📊 키워드 목록:", response.keywords);

    } catch (err) {
      console.error('TOP3 인사이트 데이터 로드 실패:', err);
      setError('데이터를 불러오는데 실패했습니다.');

      // 에러 시 더미 데이터 사용
      setChartData([
        { period: "02월", "먹방": 35, "간식": 12, "딸기": 8 },
        { period: "03월", "먹방": 42, "간식": 15, "딸기": 25 },
        { period: "04월", "먹방": 48, "간식": 18, "딸기": 32 },
        { period: "05월", "먹방": 55, "간식": 22, "딸기": 28 },
        { period: "06월", "먹방": 62, "간식": 28, "딸기": 15 },
        { period: "07월", "먹방": 78, "간식": 35, "딸기": 12 }
      ]);
      setKeywords(["먹방", "간식", "딸기"]);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 및 period 변경 시 데이터 로드
  useEffect(() => {
    fetchTop3Insights();
  }, [period]);

  if (loading) {
    return (
      <div style={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>차트 데이터를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: 350, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <p>{error}</p>
        <button onClick={fetchTop3Insights} style={{ marginTop: 10 }}>다시 시도</button>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="period"
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => value}
          formatter={(value, name) => [value, name]}
        />
        <Legend verticalAlign="top" height={36} />
        {keywords.map((keyword, index) => (
          <Line
            key={keyword}
            type="monotone"
            dataKey={keyword}
            stroke={KEYWORD_COLORS[keyword] || `hsl(${index * 60}, 70%, 50%)`}
            name={keyword}
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
export {Top3graph};