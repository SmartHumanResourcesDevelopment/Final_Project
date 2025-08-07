import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function RisingInsightsChart() {
  const [rows, setRows] = useState([]);

  // 1) JSON 로딩
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/forecast_data.json`, { cache: "no-store" })
      .then(res => res.json())
      .then(setRows)
      .catch(console.error);
  }, []);

  if (!rows.length) {
    return null; // 로딩 중
  }

  // 2) 예측이 시작되는 인덱스 찾기
  const startIdx = rows.findIndex(r => r.isForecast);

  // 3) 데이터를 Actual/Forecast 필드로 재구성
  const data = rows.map((row, i) => ({
    date: row.date,
    // 실제 구간: isForecast=false 구간만 값, 나머진 null
    tangActual: row.isForecast ? null : row.tang,
    maraActual: row.isForecast ? null : row.mara,
    zeroActual: row.isForecast ? null : row.zero,
    // 예측 구간: startIdx-1 부터 끝까지 값, 나머진 null
    tangForecast: i >= startIdx - 1 ? row.tang : null,
    maraForecast: i >= startIdx - 1 ? row.mara : null,
    zeroForecast: i >= startIdx - 1 ? row.zero : null,
  }));

  // 4) 오늘 세로선 위치(date)
  const todayX = rows.filter(r => !r.isForecast).pop()?.date;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 5, bottom: 0 }}
      >
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" height={30} />

        {/* 실제 구간(진한 실선) */}
        <Line
          type="monotone"
          dataKey="tangActual"
          name="탕후루"
          stroke="#ff0040"
          strokeWidth={3}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="maraActual"
          name="마라탕"
          stroke="#ff4cf9"
          strokeWidth={3}
          dot={false}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="zeroActual"
          name="제로음료"
          stroke="#4f6ff5"
          strokeWidth={3}
          dot={false}
          connectNulls
        />

        {/* 예측 구간(연한 실선) */}
        <Line
          type="monotone"
          dataKey="tangForecast"
          name="탕후루 미래예측 결과"
          stroke="rgba(255, 0, 64, 0.45)"
          strokeWidth={3}
          dot={false}
          legendType="none"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="maraForecast"
          name="마라탕 미래예측 결과"
          stroke="rgba(255, 76, 249, 0.45)"
          strokeWidth={3}
          dot={false}
          legendType="none"
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="zeroForecast"
          name="제로음료 미래예측 결과"
          stroke="rgba(79, 111, 245, 0.45)"
          strokeWidth={3}
          dot={false}
          legendType="none"
          connectNulls
        />

        {/* 오늘 기준 세로선(회색 실선) */}
        {todayX && (
          <ReferenceLine
            x={todayX}
            stroke="#888"
            strokeWidth={1}
            label={{ value: "오늘", position: "insideTop", fill: "#666" }}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}

export { RisingInsightsChart };
