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

export function DetailInsightsKOTE_positivity_Graph() {
  return (
    <div className="koteChart">
      <h3 className="koteChart__title koteChart__title--positive">긍정 TOP3</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={positiveData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
          <XAxis dataKey="name" tick={AxisStyle} />
          <YAxis tick={AxisStyle} />
          <Tooltip />
          <Bar dataKey="value" fill="#00c851" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DetailInsightsKOTE_negative_Graph() {
  return (
    <div className="koteChart">
      <h3 className="koteChart__title koteChart__title--negative">부정 TOP3</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={negativeData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeeee" />
          <XAxis dataKey="name" tick={AxisStyle} />
          <YAxis tick={AxisStyle} />
          <Tooltip />
          <Bar dataKey="value" fill="#ff4444" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
