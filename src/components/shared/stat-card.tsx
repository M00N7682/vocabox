import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  changeColor?: string;
  icon?: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeColor = "text-eo-success",
  icon: Icon,
  iconColor = "text-eo-primary",
}: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-eo-border">
      <div className="flex items-center justify-between">
        <span className="text-sm text-eo-text-secondary">{label}</span>
        {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
      </div>
      <span className="text-[28px] font-bold text-eo-text-primary leading-tight">{value}</span>
      <span className={`text-xs ${changeColor}`}>{change}</span>
    </div>
  );
}
