import { PageHeader } from "@/components/shared/page-header";
import { AttendanceExportButton } from "@/components/attendance/attendance-export-button";
import { AttendanceBulkCreate } from "@/components/attendance/attendance-bulk-create";
import { getAttendance, getAttendanceSummary } from "@/lib/actions/attendance";
import { getSubjects, getSubjectStudents } from "@/lib/actions/subjects";
import { SearchInput } from "@/components/shared/search-input";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  출석: "bg-[#ECFDF5] text-[#10B981]",
  지각: "bg-[#FEF3C7] text-[#D97706]",
  결석: "bg-[#FEE2E2] text-[#EF4444]",
  인정결석: "bg-[#EFF6FF] text-[#3B82F6]",
};

const checkMethodStyles: Record<string, string> = {
  qr: "bg-[#F3F4F6] text-[#374151]",
  pin: "bg-[#FEF9C3] text-[#713F12]",
  manual: "bg-[#F5F3FF] text-[#7C3AED]",
};

const checkMethodLabel: Record<string, string> = {
  qr: "QR",
  pin: "PIN",
  manual: "수동",
};

const checkinColor: Record<string, string> = {
  출석: "text-eo-success",
  지각: "text-eo-warning",
  결석: "text-eo-danger",
  인정결석: "text-[#3B82F6]",
};

const avatarColors = [
  { bg: "bg-[#DBEAFE]", text: "text-[#1E40AF]" },
  { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
  { bg: "bg-[#E0E7FF]", text: "text-[#3730A3]" },
  { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]" },
  { bg: "bg-[#D1FAE5]", text: "text-[#065F46]" },
];

function getAvatarStyle(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    subject?: string;
    status?: string;
    search?: string;
  }>;
}) {
  const params = await searchParams;

  const [records, summary, subjects] = await Promise.all([
    getAttendance({
      date: params.date,
      subjectId: params.subject,
      status: params.status,
      search: params.search,
    }),
    getAttendanceSummary(params.date),
    getSubjects({ isActive: true }),
  ]);

  // Fetch subject students in parallel (non-blocking for page render)
  const subjectStudentsMap = subjects.length > 0
    ? await getSubjectStudents(subjects.map((s) => s.id))
    : {};

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const statusOptions = [
    { value: "출석", label: "출석" },
    { value: "지각", label: "지각" },
    { value: "결석", label: "결석" },
    { value: "인정결석", label: "인정결석" },
  ];

  const metrics = [
    {
      label: "출석",
      value: String(summary.present),
      unit: `/ ${summary.total}명`,
      color: "text-eo-success",
    },
    {
      label: "지각",
      value: String(summary.late),
      unit: "명",
      color: "text-eo-warning",
    },
    {
      label: "결석",
      value: String(summary.absent),
      unit: "명",
      color: "text-eo-danger",
    },
    {
      label: "인정결석",
      value: String(summary.excused),
      unit: "명",
      color: "text-[#3B82F6]",
    },
    {
      label: "출석률",
      value: String(summary.rate),
      unit: "%",
      color: "text-eo-text-primary",
    },
  ];

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="출결 관리" description="학생 출결 현황을 관리합니다">
        <AttendanceBulkCreate
          subjects={subjects.map((s) => ({
            id: s.id,
            name: s.name,
            color: s.color,
            studentCount: s.subject_students?.length ?? 0,
          }))}
          subjectStudents={subjectStudentsMap}
        />
        <AttendanceExportButton
          records={records.map((r) => ({
            id: r.id,
            date: r.date,
            status: r.status,
            check_in_time: r.check_in_time,
            check_method: r.check_method,
            reason: r.reason,
            students: r.students,
            subjects: r.subjects ? { name: r.subjects.name } : null,
          }))}
        />
      </PageHeader>

      {/* Filter Row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="w-[240px]">
          <SearchInput placeholder="학생 검색..." />
        </div>
        <FilterDropdown
          paramKey="subject"
          label="과목"
          options={subjectOptions}
          allLabel="과목 전체"
        />
        <FilterDropdown
          paramKey="status"
          label="상태"
          options={statusOptions}
          allLabel="상태 전체"
        />
        {/* Date filter */}
        <form method="GET" className="flex items-center gap-2">
          <input
            type="date"
            name="date"
            defaultValue={params.date ?? ""}
            className="h-9 px-3 rounded-lg border border-eo-border bg-white text-sm text-eo-text-primary focus:outline-none focus:ring-2 focus:ring-eo-primary/20 focus:border-eo-primary"
          />
          <button
            type="submit"
            className="h-9 px-3 rounded-lg bg-eo-primary text-white text-sm font-medium hover:bg-[#4338CA]"
          >
            조회
          </button>
        </form>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-5 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-eo-border"
          >
            <span className="text-xs text-eo-text-secondary">{m.label}</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-[28px] font-bold ${m.color}`}>
                {m.value}
              </span>
              <span className="text-sm text-eo-text-secondary">{m.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[200px] text-xs font-semibold text-eo-text-secondary">
            학생
          </span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">
            과목
          </span>
          <span className="w-[130px] text-xs font-semibold text-eo-text-secondary">
            수업 시간
          </span>
          <span className="w-[90px] text-xs font-semibold text-eo-text-secondary">
            체크인
          </span>
          <span className="w-[90px] text-xs font-semibold text-eo-text-secondary">
            상태
          </span>
          <span className="w-[70px] text-xs font-semibold text-eo-text-secondary">
            방법
          </span>
          <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">
            사유
          </span>
        </div>

        {records.map((r, i) => {
          const name = r.students?.name ?? "-";
          const initial = name[0] ?? "?";
          const avatar = getAvatarStyle(name);
          const timeRange =
            r.class_time_start && r.class_time_end
              ? `${r.class_time_start.slice(0, 5)} - ${r.class_time_end.slice(0, 5)}`
              : "-";
          const checkin = r.check_in_time
            ? new Date(r.check_in_time).toLocaleTimeString("ko-KR", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })
            : "-";
          const methodKey = (r.check_method ?? "manual") as string;

          return (
            <div
              key={r.id}
              className={`flex items-center px-5 py-3 ${
                i < records.length - 1 ? "border-b border-eo-border" : ""
              }`}
            >
              <Link href={`/students/${r.student_id}`} className="flex items-center gap-2.5 w-[200px] hover:opacity-80">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full ${avatar.bg}`}
                >
                  <span className={`text-[11px] font-semibold ${avatar.text}`}>
                    {initial}
                  </span>
                </div>
                <span className="text-[13px] font-medium text-eo-text-primary hover:text-eo-primary">
                  {name}
                </span>
              </Link>

              <span className="flex-1 text-[13px] text-eo-text-secondary">
                {r.subjects?.name ?? "-"}
              </span>

              <span className="w-[130px] text-[13px] text-eo-text-primary">
                {timeRange}
              </span>

              <span
                className={`w-[90px] text-[13px] ${
                  checkinColor[r.status] ?? "text-eo-text-secondary"
                }`}
              >
                {checkin}
              </span>

              <div className="w-[90px]">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    statusStyles[r.status] ?? "bg-[#F3F4F6] text-[#374151]"
                  }`}
                >
                  {r.status}
                </span>
              </div>

              <div className="w-[70px]">
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    checkMethodStyles[methodKey] ??
                    "bg-[#F3F4F6] text-[#374151]"
                  }`}
                >
                  {checkMethodLabel[methodKey] ?? methodKey}
                </span>
              </div>

              <span className="w-[100px] text-[13px] text-eo-text-secondary truncate">
                {r.reason || "-"}
              </span>
            </div>
          );
        })}

        {records.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <span className="text-sm text-eo-text-secondary">출결 기록이 없습니다.</span>
            <span className="text-xs text-eo-text-tertiary">
              상단의 &quot;일괄 등록&quot; 버튼으로 과목별 출결을 한번에 등록하거나, 학생이 QR/PIN으로 체크인할 수 있습니다.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
