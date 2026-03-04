"use client";

import { useState, useTransition } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkRecordAttendance } from "@/lib/actions/attendance";

type SubjectOption = { id: string; name: string; color: string; studentCount: number };
type StudentItem = { id: string; name: string };

type Props = {
  subjects: SubjectOption[];
  subjectStudents: Record<string, StudentItem[]>;
};

export function AttendanceBulkCreate({ subjects, subjectStudents }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedSubject, setSelectedSubject] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const students = selectedSubject ? (subjectStudents[selectedSubject] ?? []) : [];

  function handleCreate() {
    if (!selectedSubject || students.length === 0) return;
    setError(null);
    const today = new Date().toISOString().split("T")[0];

    startTransition(async () => {
      const records = students.map((s) => ({
        student_id: s.id,
        subject_id: selectedSubject,
        date: today,
        status: "출석" as const,
        check_method: "manual" as const,
      }));

      const result = await bulkRecordAttendance(records);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setSelectedSubject("");
        }, 1000);
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="gap-2"
      >
        <Users className="w-4 h-4" />
        일괄 출석 기록
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
              <h2 className="text-lg font-bold text-eo-text-primary">일괄 출석 기록</h2>
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
              {success && (
                <div className="p-3 rounded-lg bg-green-50 text-sm text-eo-success font-medium">출석 기록이 생성되었습니다!</div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-eo-text-primary">과목 선택</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                >
                  <option value="">과목을 선택하세요</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.studentCount}명)
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubject && students.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-eo-text-primary">
                    대상 학생 ({students.length}명) — 오늘 날짜로 &quot;출석&quot; 기록 생성
                  </span>
                  <div className="flex flex-col gap-0.5 p-2 bg-eo-bg-page rounded-lg border border-eo-border max-h-[200px] overflow-auto">
                    {students.map((s) => (
                      <span key={s.id} className="text-[13px] px-2 py-1 text-eo-text-primary">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedSubject && students.length === 0 && (
                <div className="p-3 rounded-lg bg-[#FEF3C7] text-[13px] text-[#92400E]">
                  이 과목에 수강 학생이 없습니다. 과목 관리에서 학생을 먼저 배정해주세요.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-eo-border gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                취소
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isPending || !selectedSubject || students.length === 0}
                className="bg-eo-primary hover:bg-[#4338CA] text-white"
              >
                {isPending ? "생성중..." : `${students.length}명 출석 기록`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
