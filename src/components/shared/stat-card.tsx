interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeColor?: string;
}

export function StatCard({ label, value, change, changeColor = "text-vb-success" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-vb-border">
      <span className="text-sm text-vb-text-secondary">{label}</span>
      <span className="text-[28px] font-bold text-vb-text-primary">{value}</span>
      <span className={`text-xs ${changeColor}`}>{change}</span>
    </div>
  );
}
