import React, { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";
import { keywordApiService } from "../api/sub";

export default function DetailInsightsGraph({ keyword = "말차", period = "1달" }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastMentionDate, setLastMentionDate] = useState(null);

  // 날짜를 yyyy-mm-dd 형식으로 변환하는 함수
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 기간별 샘플 데이터 생성 함수 (마지막 언급일 기준)
  const generateSampleData = (period, baseDate = null) => {
    // 기준 날짜 설정 (API에서 받은 마지막 언급일 또는 현재 날짜)
    const referenceDate = baseDate ? new Date(baseDate) : new Date();
    const data = [];

    if (period === "7일") {
      // 7일간 데이터 (마지막 언급일 기준으로 7일 전부터)
      for (let i = 6; i >= 0; i--) {
        const date = new Date(referenceDate);
        date.setDate(date.getDate() - i);
        data.push({
          date: formatDate(date), // yyyy-mm-dd 형식
          current: Math.floor(Math.random() * 500) + 1000
        });
      }
    } else if (period === "1달") {
      // 6개월간 데이터 (마지막 언급일 기준으로 월 단위로 6개 포인트)
      for (let i = 5; i >= 0; i--) {
        const date = new Date(referenceDate);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: formatDate(date), // yyyy-mm-dd 형식
          current: Math.floor(Math.random() * 1000) + 2000
        });
      }
    } else if (period === "1년") {
      // 1년간 데이터 (마지막 언급일 기준으로 월 단위로 12개 포인트)
      for (let i = 11; i >= 0; i--) {
        const date = new Date(referenceDate);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: formatDate(date), // yyyy-mm-dd 형식
          current: Math.floor(Math.random() * 2000) + 3000
        });
      }
    }

    return data;
  };

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
        console.log("📊 현재 기간:", period);
        console.log("📊 데이터 개수:", data.dailyStats?.length || 0);

        if (data.dailyStats && data.dailyStats.length > 0) {
          // 마지막 언급 날짜 찾기 (가장 최근 날짜)
          const dates = data.dailyStats.map(stat => {
            let dateStr = stat.formatted_date || stat.STATS_DATE;
            if (dateStr && dateStr.includes('T')) {
              dateStr = dateStr.split('T')[0];
            }
            return new Date(dateStr);
          }).filter(date => !isNaN(date));

          if (dates.length > 0) {
            const lastDate = new Date(Math.max(...dates));
            setLastMentionDate(lastDate);
            console.log("📅 키워드 마지막 언급일:", formatDate(lastDate));
          }

          // API 데이터를 차트 형식으로 변환
          const formattedData = data.dailyStats.map(stat => {
            // 날짜를 yyyy-mm-dd 형식으로 변환
            let formattedDate = stat.formatted_date || stat.STATS_DATE;

            // 다양한 날짜 형식 처리
            if (formattedDate) {
              // ISO 형식 (2024-09-12T15:00:00.000+00:00)인 경우
              if (formattedDate.includes('T')) {
                formattedDate = formattedDate.split('T')[0];
              }
              // MM/DD 형식인 경우
              else if (formattedDate.includes('/') && !formattedDate.includes('-')) {
                const currentYear = new Date().getFullYear();
                const [month, day] = formattedDate.split('/');
                formattedDate = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              }
              // 이미 yyyy-mm-dd 형식인 경우는 그대로 사용
            }

            return {
              date: formattedDate,
              current: stat.DAILY_COUNT || 0
            };
          });
          setChartData(formattedData);
          console.log("✅ API 데이터 사용:", formattedData.length, "개");
        } else {
          // 데이터가 없으면 샘플 데이터 사용 (현재 날짜 기준)
          console.log("⚠️ API 데이터 없음, 샘플 데이터 사용");
          const fallbackData = generateSampleData(period, lastMentionDate);
          setChartData(fallbackData);
        }

      } catch (err) {
        console.error("❌ 일별 통계 조회 실패:", err);
        setError(err.message);
        // 에러 시 샘플 데이터 사용 (현재 날짜 기준)
        const fallbackData = generateSampleData(period, lastMentionDate);
        setChartData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchDailyStats();
  }, [keyword, period]);

  // 사용할 데이터 결정 (마지막 언급일 기준)
  const displayData = chartData.length > 0 ? chartData : generateSampleData(period, lastMentionDate);

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
      </LineChart>
    </ResponsiveContainer>
  );
}
export { DetailInsightsGraph };