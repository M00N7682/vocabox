import { PageHeader } from "@/components/shared/page-header";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { getRiskAlerts } from "@/lib/actions/risk-alerts";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { RiskResolveButton } from "./resolve-button";
import Link from "next/link";

const riskStyles: Record<string, { bg: string; text: string; label: string }> = {
  concern: { bg: "bg-[#FEF3C7]", text: "text-[#92400E]", label: "관심" },
  caution: { bg: "bg-[#FED7AA]", text: "text-[#9A3412]", label: "주의" },
  danger: { bg: "bg-[#FECACA]", text: "text-[#991B1B]", label: "위험" },
};

export default async function RiskAlertsPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; resolved?: string; search?: string }>;
}) {
  const params = await searchParams;
  const alerts = await getRiskAlerts({
    riskLevel: params.level,
    isResolved: params.resolved === "true" ? true : params.resolved === "false" ? false : undefined,
    search: params.search,
  });

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="위험 학생 관리" description="위험 신호가 감지된 학생을 확인하고 조치합니다" />

      <div className="flex items-center gap-2.5">
        <div className="w-[220px]"><SearchInput placeholder="학생 검색..." /></div>
        <FilterDropdown paramKey="level" label="등급" allLabel="등급: 전체"
          options={[
            { value: "concern", label: "관심" },
            { value: "caution", label: "주의" },
            { value: "danger", label: "위험" },
          ]} />
        <FilterDropdown paramKey="resolved" label="상태" allLabel="상태: 전체"
          options={[
            { value: "false", label: "미해결" },
            { value: "true", label: "해결됨" },
          ]} />
        <span className="text-[13px] font-medium text-eo-text-secondary">총 {alerts.length}건</span>
      </div>

      <div className="flex flex-col gap-4">
        {alerts.map((alert) => {
          const style = riskStyles[alert.risk_level] ?? riskStyles.concern;
          const reasons = (alert.reasons ?? []) as { text: string }[];

          return (
            <div key={alert.id} className={`flex gap-4 p-5 rounded-xl border border-eo-border ${alert.is_resolved ? "bg-eo-bg-surface opacity-60" : "bg-white"}`}>
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded ${style.bg} ${style.text}`}>{style.label}</span>
                  <Link href={`/students/${alert.student_id}`} className="text-base font-bold text-eo-text-primary hover:text-eo-primary">{alert.students?.name ?? "-"}</Link>
                  <span className="text-[13px] text-eo-text-secondary">{alert.students?.school ?? ""} {alert.students?.grade ?? ""}</span>
                  {alert.is_resolved && <CheckCircle className="w-4 h-4 text-eo-success ml-auto" />}
                </div>
                <div className="flex flex-col gap-1.5">
                  {reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 text-[13px] text-eo-text-secondary">
                      <AlertTriangle className="w-3.5 h-3.5 text-eo-warning shrink-0" />
                      {r.text}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-eo-text-tertiary">{new Date(alert.created_at).toLocaleDateString("ko-KR")}</span>
              </div>
              {!alert.is_resolved && <RiskResolveButton alertId={alert.id} />}
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="flex items-center justify-center py-20 text-sm text-eo-text-secondary">
            위험 신호가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
