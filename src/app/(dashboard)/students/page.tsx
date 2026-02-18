import { PageHeader } from "@/components/shared/page-header";
import { StudentAddButton } from "@/components/students/student-add-button";
import Link from "next/link";
import { getStudents } from "@/lib/actions/students";
import { getSubjects } from "@/lib/actions/subjects";
import { SearchInput } from "@/components/shared/search-input";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { Suspense } from "react";

const avatarColors = [
  { bg: "bg-[#DBEAFE]", text: "text-[#2563EB]" },
  { bg: "bg-[#FEF3C7]", text: "text-[#92400E]" },
  { bg: "bg-[#E0E7FF]", text: "text-[#3730A3]" },
  { bg: "bg-[#FCE7F3]", text: "text-[#9D174D]" },
  { bg: "bg-[#FEE2E2]", text: "text-[#991B1B]" },
  { bg: "bg-[#D1FAE5]", text: "text-[#065F46]" },
];

function getAvatarStyle(name: string) {
  const idx = name.charCodeAt(0) % avatarColors.length;
  return avatarColors[idx];
}

function FiltersRow({
  subjects,
  totalCount,
}: {
  subjects: { id: string; name: string }[];
  totalCount: number;
}) {
  const subjectOptions = subjects.map((s) => ({ value: s.id, label: s.name }));
  const statusOptions = [
    { value: "true", label: "재원" },
    { value: "false", label: "퇴원" },
  ];

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-[280px]">
        <SearchInput placeholder="학생 이름 검색..." />
      </div>
      <FilterDropdown
        paramKey="subject"
        label="과목"
        options={subjectOptions}
        allLabel="과목: 전체"
      />
      <FilterDropdown
        paramKey="status"
        label="상태"
        options={statusOptions}
        allLabel="상태: 전체"
      />
      <span className="text-[13px] font-medium text-eo-text-secondary">
        총 {totalCount}명
      </span>
    </div>
  );
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    subject?: string;
    status?: string;
  }>;
}) {
  const params = await searchParams;

  const activeOnly =
    params.status !== undefined ? params.status === "true" : undefined;

  const [students, subjects] = await Promise.all([
    getStudents({
      search: params.search,
      subjectId: params.subject,
      activeOnly,
    }),
    getSubjects(),
  ]);

  // Build a map: student_id -> subject info list
  const studentSubjects = new Map<string, { name: string; color: string }[]>();
  for (const sub of subjects) {
    for (const ss of sub.subject_students ?? []) {
      if (!studentSubjects.has(ss.student_id)) {
        studentSubjects.set(ss.student_id, []);
      }
      studentSubjects.get(ss.student_id)!.push({
        name: sub.name,
        color: sub.color,
      });
    }
  }

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="학생 관리"
        description="학원에 등록된 학생들을 관리합니다"
      >
        <StudentAddButton />
      </PageHeader>

      {/* Filter Row — client components need Suspense */}
      <Suspense
        fallback={
          <div className="h-9 flex items-center text-sm text-eo-text-secondary">
            필터 로딩 중...
          </div>
        }
      >
        <FiltersRow subjects={subjects} totalCount={students.length} />
      </Suspense>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        {/* Table Head */}
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <div className="w-[200px] text-xs font-semibold text-eo-text-secondary">
            이름
          </div>
          <div className="flex-1 text-xs font-semibold text-eo-text-secondary">
            학교/학년
          </div>
          <div className="w-[220px] text-xs font-semibold text-eo-text-secondary">
            수강 과목
          </div>
          <div className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            상태
          </div>
        </div>

        {/* Table Body */}
        {students.map((s, i) => {
          const avatar = getAvatarStyle(s.name);
          const subs = studentSubjects.get(s.id) ?? [];

          return (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className={`flex items-center px-5 py-3.5 hover:bg-eo-bg-page/50 transition-colors ${
                i < students.length - 1 ? "border-b border-eo-border" : ""
              }`}
            >
              <div className="flex items-center gap-2.5 w-[200px]">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${avatar.bg}`}
                >
                  <span className={`text-xs font-semibold ${avatar.text}`}>
                    {s.name[0]}
                  </span>
                </div>
                <span className="text-sm font-medium text-eo-text-primary">
                  {s.name}
                </span>
              </div>
              <div className="flex-1 text-[13px] text-eo-text-secondary">
                {s.school ?? "-"} {s.grade ?? ""}
              </div>
              <div className="flex items-center gap-1 flex-wrap w-[220px]">
                {subs.map((sub) => (
                  <span
                    key={sub.name}
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${sub.color}20`,
                      color: sub.color,
                    }}
                  >
                    {sub.name}
                  </span>
                ))}
                {subs.length === 0 && (
                  <span className="text-[11px] text-eo-text-secondary">-</span>
                )}
              </div>
              <div className="w-[80px]">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    s.is_active
                      ? "bg-[#ECFDF5] text-[#10B981]"
                      : "bg-[#F1F5F9] text-[#6B7280]"
                  }`}
                >
                  {s.is_active ? "재원" : "퇴원"}
                </span>
              </div>
            </Link>
          );
        })}

        {students.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            등록된 학생이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
