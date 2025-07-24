import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

/* 더미 데이터: 날짜별 언급량 */
const data = [
  { date: "07/11", tang: 95,  mara: 90,  zero: 82 },
  { date: "07/12", tang:110,  mara: 94,  zero: 86 },
  { date: "07/13", tang:130,  mara:110,  zero: 98 },
  { date: "07/14", tang:170,  mara:120,  zero:105 },
  { date: "07/15", tang:200,  mara:150,  zero:130 },
  { date: "07/16", tang:240,  mara:170,  zero:140 },
  { date: "07/17", tang:260,  mara:190,  zero:150 },
];

/* 색·라벨 */
const KEYS = [
  { key: "tang", color: "#ff0040", name: "탕후루" },
  { key: "mara", color: "#ff4cf9", name: "마라탕" },
  { key: "zero", color: "#4f6ff5", name: "제로음료" },
];

export default function Top3graph() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        {KEYS.map(({ key, color, name }) => (
          <Line key={key} type="monotone" dataKey={key}
                stroke={color} name={name}
                strokeWidth={3} dot={{ r: 3 }} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
export {Top3graph};