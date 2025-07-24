import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from "recharts";

const sampleData = [
  { date: "06/22", current: 1200, lastWeek: 1180 },
  { date: "06/23", current: 1300, lastWeek: 1250 },
  { date: "06/24", current: 1650, lastWeek: 1400 },
  { date: "06/25", current: 1720, lastWeek: 1580 },
  { date: "06/26", current: 1600, lastWeek: 1520 },
  { date: "06/27", current: 1900, lastWeek: 1750 },
];
export default function DetailInsightsGraph() {
  return (

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend verticalAlign="top" height={30} />
                <Line
                    type="monotone"
                    dataKey="current"
                    name="Last 6 days"
                    stroke="#1e40ff"
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="lastWeek"
                    name="Last week"
                    stroke="#c8c8c8"
                    strokeWidth={2}
                    dot={false}
                />
                </LineChart>
          </ResponsiveContainer>    

    );
}
export { DetailInsightsGraph };