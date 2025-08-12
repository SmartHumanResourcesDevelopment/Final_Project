import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const KeywordStatsChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8095/zal/api/keyword-stats/last7days")
      .then(res => {
        const formattedData = res.data.map(item => {
          const dateObj = new Date(item.statsDate);
          const month = dateObj.getMonth() + 1;
          const day = dateObj.getDate();
          return {
            statsDate: `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`,
            totalCount: item.totalCount,
          };
        }).reverse();
        setData(formattedData);
      })
      .catch(err => {
        console.error("데이터 로드 실패:", err);
      });
  }, []);

  return (
    <div className="w-full bg-white shadow p-6 rounded-lg max-w-[1200px] mx-auto mb-10">
      <h2 className="[font-family:'Noto_Sans_KR-blod',Helvetica] font-bold text-[#1f384c] text-lg tracking-[0.50px] leading-[23px] whitespace-nowrap mb-4">
        하루 크롤링한 갯수
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="statsDate" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="totalCount" fill="#869cecff" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KeywordStatsChart;