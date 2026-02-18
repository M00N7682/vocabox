"use client";

import { Radar, RadarChart as RechartsRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type Props = {
  data: { name: string; score: number; fullMark: number }[];
};

export function RadarChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[250px] text-sm text-eo-text-secondary">데이터가 없습니다.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsRadarChart data={data}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#374151" }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#9CA3AF" }} />
        <Radar name="성취도" dataKey="score" stroke="#5B5FC7" fill="#5B5FC7" fillOpacity={0.3} />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
