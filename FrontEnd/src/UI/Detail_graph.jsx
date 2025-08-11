import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { keywordApiService } from "../api/sub";

export default function DetailInsightsGraph({ keyword = "말차", period = "1주" }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 기본 샘플 데이터
  const sampleData = [
    { date: "06/22", current: 1200, lastWeek: 1180 },
    { date: "06/23", current: 1300, lastWeek: 1250 },
    { date: "06/24", current: 1650, lastWeek: 1400 },
    { date: "06/25", current: 1720, lastWeek: 1580 },
    { date: "06/26", current: 1600, lastWeek: 1520 },
    { date: "06/27", current: 1900, lastWeek: 1750 },
  ];
  // API에서 일별 통계 데이터 가져오기
  useEffect(() => {
    const fetchDailyStats = async () => {
      if (!keyword) return;

      setLoading(true);
      setError(null);

      try {
        console.log("📊 일별 통계 조회 시작:", keyword, period);
        const response = await fetch(`http://localhost:8095/zal/api/keyword/daily-stats?keyword=${encodeURIComponent(keyword)}&period=${encodeURIComponent(period)}`);

        if (!response.ok) {
          throw new Error('일별 통계 조회 실패');
        }

        const data = await response.json();
        console.log("📊 일별 통계 데이터:", data);

        if (data.dailyStats && data.dailyStats.length > 0) {
          // API 데이터를 차트 형식으로 변환
          const formattedData = data.dailyStats.map(stat => ({
            date: stat.formatted_date || stat.STATS_DATE,
            current: stat.DAILY_COUNT || 0,
            lastWeek: Math.floor((stat.DAILY_COUNT || 0) * 0.8) // 임시로 80% 값으로 설정
          }));
          setChartData(formattedData);
        } else {
          // 데이터가 없으면 샘플 데이터 사용
          setChartData(sampleData);
        }

      } catch (err) {
        console.error("❌ 일별 통계 조회 실패:", err);
        setError(err.message);
        // 에러 시 샘플 데이터 사용
        setChartData(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyStats();
  }, [keyword, period]);

  // 사용할 데이터 결정
  const displayData = chartData.length > 0 ? chartData : sampleData;

  if (loading) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          로딩 중...
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={displayData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend verticalAlign="top" height={30} />
        <Line
          type="monotone"
          dataKey="current"
          name={`${period} 언급량`}
          stroke="#1e40ff"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="lastWeek"
          name="이전 기간"
          stroke="#c8c8c8"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
export { DetailInsightsGraph };