"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSubject, updateSubject, deleteSubject } from "@/lib/actions/subjects";
import type { Subject, Profile } from "@/types/database";

const SUBJECT_TYPES = [
  { value: "정규", label: "정규 과목" },
  { value: "특강", label: "특강" },
  { value: "캠프", label: "단기 캠프" },
  { value: "수행평가", label: "수행평가형" },
  { value: "프로젝트", label: "프로젝트형" },
  { value: "내신관리", label: "내신 관리형" },
  { value: "반복테스트", label: "반복 테스트" },
] as const;

const COLORS = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
];

type Props = {
  open: boolean;
  onClose: () => void;
  subject?: Subject | null;
  teachers: Pick<Profile, "id" | "name">[];
};

export function SubjectFormDialog({ open, onClose, subject, teachers }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!subject;

  if (!open) return null;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateSubject(subject!.id, formData)
        : await createSubject(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  function handleDelete() {
    if (!subject || !confirm("이 과목을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      const result = await deleteSubject(subject.id);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <form action={handleSubmit}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
            <h2 className="text-lg font-bold text-eo-text-primary">
              {isEdit ? "과목 수정" : "과목 추가"}
            </h2>
            <button type="button" onClick={onClose} className="text-eo-text-secondary hover:text-eo-text-primary">
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-sm text-eo-danger">{error}</div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">과목명 *</label>
              <Input name="name" defaultValue={subject?.name ?? ""} placeholder="예: 영어, 수학" required />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">과목 유형</label>
              <select name="type" defaultValue={subject?.type ?? "정규"} className="h-10 px-3 rounded-lg border border-eo-border text-sm">
                {SUBJECT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">과목 색상</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <label key={c} className="cursor-pointer">
                    <input type="radio" name="color" value={c} defaultChecked={c === (subject?.color ?? "#3B82F6")} className="sr-only peer" />
                    <div className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-eo-text-primary peer-checked:ring-2 peer-checked:ring-offset-1 peer-checked:ring-eo-primary/30" style={{ backgroundColor: c }} />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">아이콘</label>
              <Input name="icon" defaultValue={subject?.icon ?? ""} placeholder="아이콘 이름 (선택)" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">담당 강사</label>
              <select name="instructor_id" defaultValue={subject?.instructor_id ?? ""} className="h-10 px-3 rounded-lg border border-eo-border text-sm">
                <option value="">선택 안함</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" name="is_active" value="true" defaultChecked={subject?.is_active ?? true} id="is_active" />
              <label htmlFor="is_active" className="text-sm text-eo-text-primary">활성 과목</label>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-eo-border">
            <div>
              {isEdit && (
                <Button type="button" variant="outline" onClick={handleDelete} className="text-eo-danger border-eo-danger/30 hover:bg-eo-danger/5">
                  삭제
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>취소</Button>
              <Button type="submit" disabled={isPending} className="bg-eo-primary hover:bg-[#4338CA] text-white">
                {isPending ? "저장중..." : isEdit ? "수정" : "추가"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
