type Props = {
  data: { name: string; score: number }[];
};

function getHeatColor(score: number): string {
  if (score >= 80) return "bg-[#BBF7D0] text-[#166534]";
  if (score >= 60) return "bg-[#FEF3C7] text-[#92400E]";
  if (score >= 40) return "bg-[#FED7AA] text-[#9A3412]";
  return "bg-[#FECACA] text-[#991B1B]";
}

export function HeatmapChart({ data }: Props) {
  if (data.length === 0) {
    return <div className="text-sm text-eo-text-secondary">데이터가 없습니다.</div>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {data.map((d) => (
        <div key={d.name} className={`flex flex-col items-center justify-center w-[70px] h-[70px] rounded-lg ${getHeatColor(d.score)}`}>
          <span className="text-[11px] font-medium truncate max-w-[60px]">{d.name}</span>
          <span className="text-sm font-bold">{d.score}%</span>
        </div>
      ))}
    </div>
  );
}
