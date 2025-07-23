import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
// npm install recharts
// 더미 데이터 (날짜·3개 키워드 언급량)
const data = [
  { date: "07/11", tang: 120, mara:  95, zero: 90 },
  { date: "07/12", tang: 190, mara: 110, zero:120 },
  { date: "07/13", tang: 260, mara: 150, zero:160 },
  { date: "07/14", tang: 310, mara: 170, zero:200 },
  { date: "07/15", tang: 380, mara: 200, zero:230 },
];

export default function RisingInsightsChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        <Line type="monotone" dataKey="tang"  stroke="#ff0040" name="탕후루"  strokeWidth={3}/>
        <Line type="monotone" dataKey="mara"  stroke="#ff4cf9" name="마라탕"  strokeWidth={3}/>
        <Line type="monotone" dataKey="zero"  stroke="#4f6ff5" name="제로음료" strokeWidth={3}/>
      </LineChart>
    </ResponsiveContainer>
  );
}
export { RisingInsightsChart };