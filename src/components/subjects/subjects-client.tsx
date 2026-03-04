"use client";

import { useState, useTransition } from "react";
import { Plus, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectFormDialog } from "./subject-form-dialog";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { addStudentToSubject, removeStudentFromSubject } from "@/lib/actions/subjects";
import type { Subject, Profile } from "@/types/database";
import Link from "next/link";

type StudentItem = { id: string; name: string; grade: string | null };

type SubjectWithDetails = Subject & {
  profiles: { name: string } | null;
  subject_students: { student_id: string }[];
};

const typeStyles: Record<string, { bg: string; color: string }> = {
  정규: { bg: "bg-[#DBEAFE]", color: "text-[#1E40AF]" },
  특강: { bg: "bg-[#D1FAE5]", color: "text-[#065F46]" },
  캠프: { bg: "bg-[#FEF3C7]", color: "text-[#92400E]" },
  수행평가: { bg: "bg-[#FCE7F3]", color: "text-[#9D174D]" },
  프로젝트: { bg: "bg-[#E0E7FF]", color: "text-[#3730A3]" },
  내신관리: { bg: "bg-[#ECFDF5]", color: "text-[#065F46]" },
  반복테스트: { bg: "bg-[#FEE2E2]", color: "text-[#991B1B]" },
};

type Props = {
  subjects: SubjectWithDetails[];
  teachers: Pick<Profile, "id" | "name">[];
  students: StudentItem[];
};

export function SubjectsClient({ subjects, teachers, students }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [studentManagerOpen, setStudentManagerOpen] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[220px]">
            <SearchInput placeholder="과목명 검색..." />
          </div>
          <FilterDropdown
            paramKey="type"
            label="유형"
            allLabel="유형: 전체"
            options={[
              { value: "정규", label: "정규 과목" },
              { value: "특강", label: "특강" },
              { value: "캠프", label: "캠프" },
              { value: "수행평가", label: "수행평가" },
              { value: "프로젝트", label: "프로젝트" },
              { value: "내신관리", label: "내신관리" },
              { value: "반복테스트", label: "반복테스트" },
            ]}
          />
          <FilterDropdown
            paramKey="active"
            label="상태"
            allLabel="상태: 전체"
            options={[
              { value: "true", label: "활성" },
              { value: "false", label: "비활성" },
            ]}
          />
          <span className="text-[13px] font-medium text-eo-text-secondary">총 {subjects.length}개</span>
        </div>
        <Button onClick={() => { setEditSubject(null); setDialogOpen(true); }} className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2">
          <Plus className="w-4 h-4" />
          과목 추가
        </Button>
      </div>

      <div className="flex gap-5 flex-wrap">
        {subjects.map((s) => {
          const studentCount = s.subject_students?.length ?? 0;
          const style = typeStyles[s.type] ?? typeStyles["정규"];
          const isExpanded = studentManagerOpen === s.id;
          const enrolledIds = new Set(s.subject_students?.map((ss) => ss.student_id) ?? []);
          const enrolledStudents = students.filter((st) => enrolledIds.has(st.id));

          return (
            <div
              key={s.id}
              className={`flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border w-[340px] hover:shadow-sm transition-shadow ${!s.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => { setEditSubject(s); setDialogOpen(true); }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-lg font-bold text-eo-text-primary hover:text-eo-primary">{s.name}</span>
                </div>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${style.bg} ${style.color}`}>
                  {s.type}
                </span>
              </div>
              <div className="flex gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-eo-text-secondary">담당 강사</span>
                  <span className="text-[13px] font-medium text-eo-text-primary">{s.profiles?.name ?? "-"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-eo-text-secondary">수강 학생</span>
                  <span className="text-[13px] font-medium text-eo-text-primary">{studentCount}명</span>
                </div>
                {!s.is_active && (
                  <span className="text-[11px] text-eo-text-secondary self-end ml-auto">비활성</span>
                )}
              </div>
              <button
                onClick={() => setStudentManagerOpen(isExpanded ? null : s.id)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-eo-primary hover:text-[#4338CA]"
              >
                <Users className="w-3.5 h-3.5" />
                {isExpanded ? "학생 관리 닫기" : "학생 관리"}
              </button>
              {isExpanded && (
                <SubjectStudentManager
                  subjectId={s.id}
                  enrolledStudents={enrolledStudents}
                  allStudents={students}
                  enrolledIds={enrolledIds}
                />
              )}
            </div>
          );
        })}
        {subjects.length === 0 && (
          <div className="flex items-center justify-center w-full py-20 text-eo-text-secondary text-sm">
            등록된 과목이 없습니다. 과목을 추가해주세요.
          </div>
        )}
      </div>

      <SubjectFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditSubject(null); }}
        subject={editSubject}
        teachers={teachers}
      />
    </>
  );
}

function SubjectStudentManager({
  subjectId,
  enrolledStudents,
  allStudents,
  enrolledIds,
}: {
  subjectId: string;
  enrolledStudents: StudentItem[];
  allStudents: StudentItem[];
  enrolledIds: Set<string>;
}) {
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);
  const available = allStudents.filter((s) => !enrolledIds.has(s.id));

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-eo-border">
      {enrolledStudents.map((s) => (
        <div key={s.id} className="flex items-center justify-between text-[13px]">
          <Link href={`/students/${s.id}`} className="text-eo-text-primary hover:text-eo-primary">
            {s.name} <span className="text-eo-text-tertiary">{s.grade ?? ""}</span>
          </Link>
          <button
            onClick={() => startTransition(async () => { await removeStudentFromSubject(subjectId, s.id); })}
            disabled={isPending}
            className="text-eo-text-tertiary hover:text-eo-danger"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {enrolledStudents.length === 0 && (
        <span className="text-[12px] text-eo-text-secondary">수강 학생이 없습니다</span>
      )}
      {available.length > 0 && (
        <>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1 text-[12px] text-eo-primary hover:text-[#4338CA] mt-1"
          >
            <Plus className="w-3 h-3" />
            학생 추가
          </button>
          {showPicker && (
            <div className="flex flex-col gap-0.5 p-2 bg-eo-bg-page rounded-lg border border-eo-border max-h-[200px] overflow-auto">
              {available.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    startTransition(async () => {
                      await addStudentToSubject(subjectId, s.id);
                      setShowPicker(false);
                    });
                  }}
                  disabled={isPending}
                  className="text-left text-[12px] px-2 py-1.5 rounded hover:bg-white text-eo-text-primary"
                >
                  {s.name} <span className="text-eo-text-tertiary">{s.grade ?? ""}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
