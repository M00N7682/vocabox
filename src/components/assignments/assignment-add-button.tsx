"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAssignment, assignStudents } from "@/lib/actions/assignments";

type Props = {
  subjects: { id: string; name: string; studentIds: string[] }[];
  students: { id: string; name: string; grade: string | null }[];
};

export function AssignmentAddButton({ subjects, students }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(
    new Set()
  );

  const subjectStudents = useMemo(() => {
    if (!selectedSubjectId) return [];
    const subject = subjects.find((s) => s.id === selectedSubjectId);
    if (!subject) return [];
    const ids = new Set(subject.studentIds);
    return students.filter((s) => ids.has(s.id));
  }, [selectedSubjectId, subjects, students]);

  function handleSubjectChange(subjectId: string) {
    setSelectedSubjectId(subjectId);
    if (subjectId) {
      const subject = subjects.find((s) => s.id === subjectId);
      setSelectedStudentIds(new Set(subject?.studentIds ?? []));
    } else {
      setSelectedStudentIds(new Set());
    }
  }

  function toggleStudent(id: string) {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selectedStudentIds.size === subjectStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(subjectStudents.map((s) => s.id)));
    }
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createAssignment(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setSelectedSubjectId("");
        setSelectedStudentIds(new Set());
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
        과제 추가
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
                  과제 추가
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
                    과제명 *
                  </label>
                  <Input
                    name="title"
                    placeholder="과제 제목을 입력하세요"
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
                      마감일 *
                    </label>
                    <Input type="date" name="due_date" required />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    설명
                  </label>
                  <Input name="description" placeholder="과제에 대한 설명" />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      제출 방식
                    </label>
                    <select
                      name="submission_type"
                      defaultValue="check"
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="check">체크</option>
                      <option value="photo">사진</option>
                      <option value="file">파일</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      난이도
                    </label>
                    <select
                      name="difficulty"
                      defaultValue=""
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="">미지정</option>
                      <option value="easy">하</option>
                      <option value="medium">중</option>
                      <option value="hard">상</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_required"
                    value="true"
                    defaultChecked
                    id="assignment_is_required"
                  />
                  <label
                    htmlFor="assignment_is_required"
                    className="text-sm text-eo-text-primary"
                  >
                    필수 과제
                  </label>
                </div>

                {/* Student Selection */}
                {selectedSubjectId && subjectStudents.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-eo-text-primary">
                        학생 선택 ({selectedStudentIds.size}/{subjectStudents.length})
                      </label>
                      <button
                        type="button"
                        onClick={toggleAll}
                        className="text-xs text-eo-primary hover:underline"
                      >
                        {selectedStudentIds.size === subjectStudents.length
                          ? "전체 해제"
                          : "전체 선택"}
                      </button>
                    </div>
                    <div className="border border-eo-border rounded-lg max-h-[200px] overflow-auto">
                      {subjectStudents.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-eo-bg-surface cursor-pointer border-b border-eo-border last:border-0"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.has(s.id)}
                            onChange={() => toggleStudent(s.id)}
                            className="w-4 h-4 rounded border-eo-border text-eo-primary"
                          />
                          <span className="text-sm text-eo-text-primary flex-1">
                            {s.name}
                          </span>
                          <span className="text-xs text-eo-text-secondary">
                            {s.grade ?? "-"}
                          </span>
                        </label>
                      ))}
                    </div>
                    {/* Pass selected student IDs as hidden inputs */}
                    {Array.from(selectedStudentIds).map((id) => (
                      <input
                        key={id}
                        type="hidden"
                        name="student_ids"
                        value={id}
                      />
                    ))}
                  </div>
                )}
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
