"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplateActive,
} from "@/lib/actions/assessments";
import type { AssessmentTemplate } from "@/types/database";

const recurrenceLabels: Record<string, string> = {
  weekly: "매주",
  biweekly: "격주",
  monthly: "매월",
};

const dayLabels: Record<number, string> = {
  0: "일",
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
  6: "토",
};

type Props = {
  templates: AssessmentTemplate[];
  subjects: { id: string; name: string }[];
};

export function TemplatesClient({ templates, subjects }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] =
    useState<AssessmentTemplate | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleToggle(id: string, isActive: boolean) {
    startTransition(async () => {
      await toggleTemplateActive(id, !isActive);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-eo-text-secondary">
          총 {templates.length}개
        </span>
        <Button
          onClick={() => {
            setEditTemplate(null);
            setDialogOpen(true);
          }}
          className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          템플릿 추가
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">
            템플릿명
          </span>
          <span className="w-[100px] text-xs font-semibold text-eo-text-secondary">
            과목
          </span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            주기
          </span>
          <span className="w-[60px] text-xs font-semibold text-eo-text-secondary">
            요일
          </span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            평가유형
          </span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            채점방식
          </span>
          <span className="w-[60px] text-xs font-semibold text-eo-text-secondary">
            상태
          </span>
          <span className="w-[120px] text-xs font-semibold text-eo-text-secondary text-right">
            작업
          </span>
        </div>

        {templates.length > 0 ? (
          templates.map((t, i) => {
            const subjectName =
              subjects.find((s) => s.id === t.subject_id)?.name ?? "-";
            return (
              <div
                key={t.id}
                className={`flex items-center px-5 py-3 ${
                  i < templates.length - 1
                    ? "border-b border-eo-border"
                    : ""
                }`}
              >
                <span className="flex-1 text-[13px] font-medium text-eo-text-primary">
                  {t.name}
                </span>
                <span className="w-[100px] text-[13px] text-eo-text-secondary truncate">
                  {subjectName}
                </span>
                <span className="w-[80px] text-[13px] text-eo-text-secondary">
                  {recurrenceLabels[t.recurrence] ?? t.recurrence}
                </span>
                <span className="w-[60px] text-[13px] text-eo-text-secondary">
                  {t.day_of_week !== null
                    ? dayLabels[t.day_of_week] ?? "-"
                    : "-"}
                </span>
                <span className="w-[80px] text-[13px] text-eo-text-secondary">
                  {t.assessment_type}
                </span>
                <span className="w-[80px] text-[13px] text-eo-text-secondary">
                  {t.scoring_method === "score"
                    ? "점수형"
                    : t.scoring_method === "grade"
                      ? "등급형"
                      : "체크형"}
                </span>
                <div className="w-[60px]">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      t.is_active
                        ? "bg-[#ECFDF5] text-[#10B981]"
                        : "bg-[#F1F5F9] text-[#6B7280]"
                    }`}
                  >
                    {t.is_active ? "활성" : "비활성"}
                  </span>
                </div>
                <div className="w-[120px] flex gap-2 justify-end">
                  <button
                    onClick={() => handleToggle(t.id, t.is_active)}
                    disabled={isPending}
                    className="text-xs text-eo-text-secondary hover:text-eo-primary"
                  >
                    {t.is_active ? "비활성화" : "활성화"}
                  </button>
                  <button
                    onClick={() => {
                      setEditTemplate(t);
                      setDialogOpen(true);
                    }}
                    className="text-xs text-eo-text-secondary hover:text-eo-primary"
                  >
                    수정
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            등록된 템플릿이 없습니다.
          </div>
        )}
      </div>

      {dialogOpen && (
        <TemplateFormDialog
          template={editTemplate}
          subjects={subjects}
          onClose={() => {
            setDialogOpen(false);
            setEditTemplate(null);
          }}
        />
      )}
    </>
  );
}

function TemplateFormDialog({
  template,
  subjects,
  onClose,
}: {
  template: AssessmentTemplate | null;
  subjects: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEdit = !!template;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) {
        await updateTemplate(template!.id, formData);
      } else {
        await createTemplate(formData);
      }
      onClose();
    });
  }

  function handleDelete() {
    if (!template || !confirm("이 템플릿을 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteTemplate(template.id);
      onClose();
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form action={handleSubmit}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
            <h2 className="text-lg font-bold text-eo-text-primary">
              {isEdit ? "템플릿 수정" : "템플릿 추가"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-eo-text-secondary hover:text-eo-text-primary"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">
                템플릿명 *
              </label>
              <Input
                name="name"
                defaultValue={template?.name ?? ""}
                placeholder="예: 주간 영어 퀴즈"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">
                과목 *
              </label>
              <select
                name="subject_id"
                defaultValue={template?.subject_id ?? ""}
                className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                required
              >
                <option value="">선택</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-eo-text-primary">
                  반복 주기
                </label>
                <select
                  name="recurrence"
                  defaultValue={template?.recurrence ?? "weekly"}
                  className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                >
                  <option value="weekly">매주</option>
                  <option value="biweekly">격주</option>
                  <option value="monthly">매월</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-eo-text-primary">
                  요일
                </label>
                <select
                  name="day_of_week"
                  defaultValue={
                    template?.day_of_week != null
                      ? String(template.day_of_week)
                      : ""
                  }
                  className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                >
                  <option value="">미지정</option>
                  <option value="1">월</option>
                  <option value="2">화</option>
                  <option value="3">수</option>
                  <option value="4">목</option>
                  <option value="5">금</option>
                  <option value="6">토</option>
                  <option value="0">일</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-eo-text-primary">
                  평가 유형
                </label>
                <select
                  name="assessment_type"
                  defaultValue={template?.assessment_type ?? "시험"}
                  className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                >
                  <option value="시험">시험</option>
                  <option value="퀴즈">퀴즈</option>
                  <option value="과제">과제</option>
                  <option value="수행평가">수행평가</option>
                  <option value="출석점수">출석점수</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-sm font-medium text-eo-text-primary">
                  채점 방식
                </label>
                <select
                  name="scoring_method"
                  defaultValue={template?.scoring_method ?? "score"}
                  className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                >
                  <option value="score">점수형</option>
                  <option value="grade">등급형</option>
                  <option value="check">체크형</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">
                기본 총점
              </label>
              <Input
                type="number"
                name="total_points"
                defaultValue={template?.total_points ?? 100}
                placeholder="100"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_active"
                value="true"
                defaultChecked={template?.is_active ?? true}
                id="template_is_active"
              />
              <label
                htmlFor="template_is_active"
                className="text-sm text-eo-text-primary"
              >
                활성 템플릿
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-eo-border">
            <div>
              {isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-eo-danger border-eo-danger/30 hover:bg-eo-danger/5"
                >
                  삭제
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-eo-primary hover:bg-[#4338CA] text-white"
              >
                {isPending ? "저장중..." : isEdit ? "수정" : "추가"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
