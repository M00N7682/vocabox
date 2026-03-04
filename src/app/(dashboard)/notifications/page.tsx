import { PageHeader } from "@/components/shared/page-header";
import { getNotifications } from "@/lib/actions/notifications";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { Bell } from "lucide-react";
import { Suspense } from "react";
import Link from "next/link";

const typeOptions = [
  { value: "attendance", label: "출결" },
  { value: "score", label: "성적" },
  { value: "assignment", label: "과제" },
  { value: "reminder", label: "리마인드" },
  { value: "risk_alert", label: "위험알림" },
  { value: "monthly_report", label: "월간리포트" },
];

const channelOptions = [
  { value: "in_app", label: "앱내" },
  { value: "email", label: "이메일" },
  { value: "sms", label: "문자" },
  { value: "kakao", label: "카카오" },
];

const typeLabels: Record<string, string> = {
  attendance: "출결",
  score: "성적",
  assignment: "과제",
  reminder: "리마인드",
  risk_alert: "위험알림",
  monthly_report: "월간리포트",
};

const channelLabels: Record<string, string> = {
  in_app: "앱내",
  email: "이메일",
  sms: "문자",
  kakao: "카카오",
};

const typeBadgeStyles: Record<string, string> = {
  attendance: "bg-blue-100 text-blue-700",
  score: "bg-purple-100 text-purple-700",
  assignment: "bg-orange-100 text-orange-700",
  reminder: "bg-gray-100 text-gray-600",
  risk_alert: "bg-red-100 text-red-700",
  monthly_report: "bg-green-100 text-green-700",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

async function NotificationsTable({
  type,
  channel,
  search,
}: {
  type?: string;
  channel?: string;
  search?: string;
}) {
  const notifications = await getNotifications({
    type: type || undefined,
    channel: channel || undefined,
    search: search || undefined,
  });

  return (
    <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
      {/* Table header */}
      <div className="flex items-center px-4 py-2.5 bg-eo-bg-surface border-b border-eo-border">
        <span className="text-xs font-semibold text-eo-text-secondary w-[140px]">
          날짜
        </span>
        <span className="text-xs font-semibold text-eo-text-secondary w-[90px]">
          유형
        </span>
        <span className="text-xs font-semibold text-eo-text-secondary flex-1">
          제목
        </span>
        <span className="text-xs font-semibold text-eo-text-secondary w-[200px]">
          내용
        </span>
        <span className="text-xs font-semibold text-eo-text-secondary w-[100px]">
          학생
        </span>
        <span className="text-xs font-semibold text-eo-text-secondary w-[70px]">
          채널
        </span>
        <span className="text-xs font-semibold text-eo-text-secondary w-[60px]">
          발송
        </span>
        <span className="text-xs font-semibold text-eo-text-secondary w-[70px]">
          읽음
        </span>
      </div>

      {notifications.length > 0 ? (
        notifications.map((n, i) => (
          <div
            key={n.id}
            className={`flex items-center px-4 py-2.5 ${
              i < notifications.length - 1 ? "border-b border-eo-border" : ""
            }`}
          >
            <span className="text-[13px] text-eo-text-secondary w-[140px]">
              {formatDate(n.created_at)}
            </span>
            <div className="w-[90px]">
              <span
                className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  typeBadgeStyles[n.type] ?? "bg-gray-100 text-gray-600"
                }`}
              >
                {typeLabels[n.type] ?? n.type}
              </span>
            </div>
            <span className="text-[13px] font-medium text-eo-text-primary flex-1 truncate pr-2">
              {n.title}
            </span>
            <span className="text-[13px] text-eo-text-secondary w-[200px] truncate pr-2">
              {n.message}
            </span>
            <div className="w-[100px]">
              {n.student_id ? (
                <Link href={`/students/${n.student_id}`} className="text-[13px] text-eo-text-secondary hover:text-eo-primary truncate">
                  {n.students?.name ?? "-"}
                </Link>
              ) : (
                <span className="text-[13px] text-eo-text-secondary">-</span>
              )}
            </div>
            <span className="text-[13px] text-eo-text-secondary w-[70px]">
              {channelLabels[n.channel] ?? n.channel}
            </span>
            <div className="w-[60px] flex items-center gap-1.5">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  n.is_sent ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            </div>
            <div className="w-[70px]">
              <span
                className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  n.is_read
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {n.is_read ? "읽음" : "안읽음"}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Bell className="w-8 h-8 text-eo-text-tertiary" />
          <span className="text-sm text-eo-text-secondary">
            알림 내역이 없습니다.
          </span>
        </div>
      )}
    </div>
  );
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; channel?: string; search?: string }>;
}) {
  const { type, channel, search } = await searchParams;

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="알림"
        description="학생에게 발송된 알림 내역을 확인합니다."
      />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Suspense>
          <FilterDropdown
            paramKey="type"
            label="유형 필터"
            options={typeOptions}
            allLabel="전체 유형"
          />
          <FilterDropdown
            paramKey="channel"
            label="채널 필터"
            options={channelOptions}
            allLabel="전체 채널"
          />
          <div className="w-[240px]">
            <SearchInput placeholder="제목, 내용, 학생 검색..." />
          </div>
        </Suspense>
      </div>

      {/* Table */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16 text-sm text-eo-text-secondary">
            로딩 중...
          </div>
        }
      >
        <NotificationsTable type={type} channel={channel} search={search} />
      </Suspense>
    </div>
  );
}
