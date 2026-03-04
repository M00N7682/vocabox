"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAssessment } from "@/lib/actions/assessments";

type Props = {
  subjects: { id: string; name: string }[];
};

export function AssessmentAddButton({ subjects }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAssessment(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(null);
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        평가 추가
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form action={handleSubmit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
                <h2 className="text-lg font-bold text-eo-text-primary">
                  평가 추가
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-eo-text-secondary hover:text-eo-text-primary"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col gap-4 px-6 py-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-sm text-eo-danger">{error}</div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    평가명 *
                  </label>
                  <Input
                    name="name"
                    placeholder="예: 3월 월말 시험"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      과목 *
                    </label>
                    <select
                      name="subject_id"
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
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      날짜 *
                    </label>
                    <Input
                      type="date"
                      name="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      평가 유형
                    </label>
                    <select
                      name="type"
                      defaultValue="시험"
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
                      defaultValue="score"
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="score">점수형</option>
                      <option value="grade">등급형</option>
                      <option value="check">체크형</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      총점
                    </label>
                    <Input
                      type="number"
                      name="total_points"
                      defaultValue={100}
                      placeholder="100"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      상태
                    </label>
                    <select
                      name="status"
                      defaultValue="예정"
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="예정">예정</option>
                      <option value="진행중">진행중</option>
                      <option value="완료">완료</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-eo-border gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-eo-primary hover:bg-[#4338CA] text-white"
                >
                  {isPending ? "저장중..." : "추가"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
