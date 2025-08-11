import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

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

export default function Top3graph({ period = "6개월", cachedData = null }) {
  const [chartData, setChartData] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 데이터 처리 함수
  const processData = (data) => {
    if (!data || !data.chartData) {
      // 기본 데이터 사용
      const fallbackData = [
        { period: "02월", "먹방": 35, "간식": 12, "딸기": 8 },
        { period: "03월", "먹방": 42, "간식": 15, "딸기": 25 },
        { period: "04월", "먹방": 48, "간식": 18, "딸기": 32 },
        { period: "05월", "먹방": 55, "간식": 22, "딸기": 28 },
        { period: "06월", "먹방": 62, "간식": 28, "딸기": 15 },
        { period: "07월", "먹방": 78, "간식": 35, "딸기": 12 }
      ];
      const fallbackKeywords = ["먹방", "간식", "딸기"];

      setChartData(fallbackData);
      setKeywords(fallbackKeywords);
      console.log("📊 기본 차트 데이터 사용");
      return;
    }

    // API 응답 데이터를 차트 형식으로 변환
    const formattedData = data.chartData.map(item => {
      const formatted = {
        period: item.period // "02월", "07/15", "6월2주" 등
      };

      // 각 키워드의 데이터 추가
      data.keywords.forEach(keyword => {
        formatted[keyword] = item[keyword] || 0;
      });

      return formatted;
    });

    setChartData(formattedData);
    setKeywords(data.keywords);
    setError(null);
    console.log("📊 부모에서 전달받은 차트 데이터 사용:", period);
  };

  // cachedData가 변경될 때마다 데이터 처리
  useEffect(() => {
    console.log("📊 차트 컴포넌트 - 데이터 업데이트:", period);
    processData(cachedData);
    setLoading(false);
  }, [cachedData, period]);

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