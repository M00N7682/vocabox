"use client";

import { useState, useTransition } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAssessment } from "@/lib/actions/assessments";
import Link from "next/link";

type SubjectWithCount = { id: string; name: string; studentCount: number };

type Props = {
  subjects: SubjectWithCount[];
};

export function AssessmentAddButton({ subjects }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAssessment(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(null);
        setSelectedSubjectId("");
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
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value)}
                    >
                      <option value="">선택</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.studentCount}명)
                        </option>
                      ))}
                    </select>
                    {selectedSubject && selectedSubject.studentCount === 0 && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FEF3C7] border border-[#FDE68A]">
                        <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                        <div className="text-[12px] text-[#92400E]">
                          이 과목에 수강 학생이 없어 성적 입력이 불가합니다.{" "}
                          <Link href="/subjects" className="underline font-medium hover:text-[#78350F]" onClick={(e) => e.stopPropagation()}>
                            과목 관리
                          </Link>
                          에서 학생을 먼저 배정해주세요.
                        </div>
                      </div>
                    )}
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
