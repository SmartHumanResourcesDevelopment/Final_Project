import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const chartData = [
  { date: "7/4", value: 15000 },
  { date: "7/5", value: 17000 },
  { date: "7/6", value: 17200 },
  { date: "7/7", value: 13000 },
  { date: "7/8", value: 15000 },
  { date: "7/9", value: 12050 },
  { date: "7/10", value: 18500 },
  { date: "7/11", value: 11050 },
];

export const Admin_bar_chart = () => {
  return (
    <section className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[#1f384c]">최근 크롤링 된 키워드 현황</h2>
        <span className="text-sm text-gray-500">집계 기간: 최근 1주일 자료</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toLocaleString()}건`} />
          <Legend />
          <Bar dataKey="value" fill="#3b5cff" barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default Admin_bar_chart;