"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubjectFormDialog } from "./subject-form-dialog";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { SearchInput } from "@/components/shared/search-input";
import { toggleSubjectActive } from "@/lib/actions/subjects";
import type { Subject, Profile } from "@/types/database";

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
};

export function SubjectsClient({ subjects, teachers }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);

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
          return (
            <div
              key={s.id}
              onClick={() => { setEditSubject(s); setDialogOpen(true); }}
              className={`flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border w-[340px] cursor-pointer hover:shadow-sm transition-shadow ${!s.is_active ? "opacity-50" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-lg font-bold text-eo-text-primary">{s.name}</span>
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
