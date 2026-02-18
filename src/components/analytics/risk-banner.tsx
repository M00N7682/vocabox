import { AlertTriangle } from "lucide-react";
import Link from "next/link";

type Props = { count: number };

export function RiskBanner({ count }: Props) {
  if (count === 0) return null;

  return (
    <Link href="/analytics/risks" className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] hover:bg-[#FEE2E2] transition-colors">
      <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
      <span className="text-sm font-semibold text-[#991B1B]">
        위험 학생 {count}명이 감지되었습니다
      </span>
      <span className="ml-auto text-xs text-[#EF4444] font-medium">확인하기 →</span>
    </Link>
  );
}
