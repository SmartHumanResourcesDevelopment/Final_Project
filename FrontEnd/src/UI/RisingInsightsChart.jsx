import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

export default function RisingInsightsChart() {
  const [chartData, setChartData] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [loading, setLoading] = useState(true);

  // 급상승 키워드 차트 데이터 로딩 (한 번만 실행)
  useEffect(() => {
    console.log("📊 급상승 인사이트 차트 데이터 로딩 시작");

    fetch("/zal/api/main/trending/insights")
      .then(res => res.json())
      .then(data => {
        console.log("✅ 급상승 인사이트 데이터 로딩 성공:", data);

        if (data.labels && data.datasets) {
          // 차트 데이터 변환
          const transformedData = data.labels.map((label, index) => {
            const dataPoint = { date: label };

            data.datasets.forEach(dataset => {
              dataPoint[dataset.label] = dataset.data[index] || 0;
            });

            return dataPoint;
          });

          setChartData(transformedData);
          setDatasets(data.datasets);
          setAiAnalysis(data.aiAnalysis || "");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("❌ 급상승 인사이트 데이터 로딩 실패:", error);
        setLoading(false);
      });
  }, []); // 빈 의존성 배열 추가 - 컴포넌트 마운트 시 한 번만 실행

  if (loading) {
    return <div>로딩 중...</div>;
  }

  if (!chartData.length) {
    return <div>급상승 키워드 데이터가 없습니다.</div>;
  }

  return (
    <div>
      {/* 차트 */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 5, bottom: 0 }}
        >
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend verticalAlign="top" height={30} />

          {/* 동적으로 라인 생성 */}
          {datasets.map((dataset, index) => (
            <Line
              key={dataset.label}
              type="monotone"
              dataKey={dataset.label}
              name={dataset.label}
              stroke={dataset.color}
              strokeWidth={3}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* AI 분석 - 기존 ti-summary 스타일 사용 */}
      {aiAnalysis && (
        <p className="ti-summary">
          {aiAnalysis}
        </p>
      )}
    </div>
  );
}

export { RisingInsightsChart };
