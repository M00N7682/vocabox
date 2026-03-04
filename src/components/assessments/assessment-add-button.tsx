"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAssessment } from "@/lib/actions/assessments";

type SubjectItem = { id: string; name: string };
type ClassItem = {
  id: string;
  name: string;
  subjectId: string | null;
  studentIds: string[];
};
type StudentItem = { id: string; name: string; grade: string | null };

type Props = {
  subjects: SubjectItem[];
  classes: ClassItem[];
  students: StudentItem[];
};

export function AssessmentAddButton({ subjects, classes, students }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(
    new Set()
  );

  // Classes filtered by selected subject
  const filteredClasses = useMemo(() => {
    if (!selectedSubjectId) return [];
    return classes.filter((c) => c.subjectId === selectedSubjectId);
  }, [selectedSubjectId, classes]);

  // Student IDs from selected classes (deduplicated)
  const enrolledStudentIds = useMemo(() => {
    const ids = new Set<string>();
    for (const cls of classes) {
      if (selectedClassIds.has(cls.id)) {
        for (const sid of cls.studentIds) ids.add(sid);
      }
    }
    return ids;
  }, [selectedClassIds, classes]);

  // Resolved student objects for display
  const enrolledStudents = useMemo(() => {
    return students.filter((s) => enrolledStudentIds.has(s.id));
  }, [enrolledStudentIds, students]);

  function handleSubjectChange(subjectId: string) {
    setSelectedSubjectId(subjectId);
    setSelectedClassIds(new Set());
  }

  function toggleClass(classId: string) {
    setSelectedClassIds((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAssessment(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setSelectedSubjectId("");
        setSelectedClassIds(new Set());
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
            className="bg-white rounded-xl w-[560px] max-h-[90vh] overflow-auto"
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
                  <div className="p-3 rounded-lg bg-red-50 text-sm text-eo-danger">
                    {error}
                  </div>
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
                      value={selectedSubjectId}
                      onChange={(e) => handleSubjectChange(e.target.value)}
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
                      defaultValue="진행중"
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="예정">예정</option>
                      <option value="진행중">진행중</option>
                      <option value="완료">완료</option>
                    </select>
                  </div>
                </div>

                {/* Class-based student selection */}
                {selectedSubjectId && filteredClasses.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-eo-text-primary">
                      대상 반 선택
                    </label>
                    <div className="flex flex-col gap-1 border border-eo-border rounded-lg p-2">
                      {filteredClasses.map((cls) => (
                        <label
                          key={cls.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-eo-bg-surface cursor-pointer rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedClassIds.has(cls.id)}
                            onChange={() => toggleClass(cls.id)}
                            className="w-4 h-4 rounded border-eo-border text-eo-primary"
                          />
                          <span className="text-sm text-eo-text-primary flex-1">
                            {cls.name}
                          </span>
                          <span className="text-xs text-eo-text-secondary">
                            {cls.studentIds.length}명
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSubjectId && filteredClasses.length === 0 && (
                  <div className="p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-[12px] text-[#92400E]">
                    이 과목에 연결된 반이 없습니다. &quot;반 관리&quot;에서
                    반을 만들고 과목을 연결해주세요.
                  </div>
                )}

                {/* Show enrolled students preview */}
                {enrolledStudents.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-eo-text-primary">
                      대상 학생 ({enrolledStudents.length}명)
                    </span>
                    <div className="border border-eo-border rounded-lg max-h-[160px] overflow-auto">
                      {enrolledStudents.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 px-3 py-1.5 border-b border-eo-border last:border-0"
                        >
                          <span className="text-[13px] text-eo-text-primary flex-1">
                            {s.name}
                          </span>
                          <span className="text-xs text-eo-text-secondary">
                            {s.grade ?? "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Hidden inputs for student_ids */}
                {Array.from(enrolledStudentIds).map((id) => (
                  <input
                    key={id}
                    type="hidden"
                    name="student_ids"
                    value={id}
                  />
                ))}
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
