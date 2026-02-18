"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: { month: string; score: number }[];
};

export function GrowthLineChart({ data }: Props) {
  // Calculate 3-period moving average
  const chartData = data.map((d, i) => {
    const start = Math.max(0, i - 2);
    const subset = data.slice(start, i + 1).filter(x => x.score > 0);
    const ma = subset.length > 0 ? Math.round(subset.reduce((a, b) => a + b.score, 0) / subset.length) : 0;
    return { ...d, movingAvg: d.score > 0 ? ma : 0 };
  });

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6B7280" }} />
        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #E5E7EB", fontSize: "13px" }} />
        <Line type="monotone" dataKey="score" stroke="#5B5FC7" strokeWidth={2} dot={{ r: 4, fill: "#5B5FC7" }} name="점수" />
        <Line type="monotone" dataKey="movingAvg" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="이동평균" />
      </LineChart>
    </ResponsiveContainer>
  );
}
