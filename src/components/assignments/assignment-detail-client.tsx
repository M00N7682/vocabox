"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignStudents, updateStudentStatus } from "@/lib/actions/assignments";
import { UserPlus, Check, MessageSquare } from "lucide-react";

type AssignmentStudentRow = {
  studentId: string;
  studentName: string;
  studentGrade: string | null;
  status: "pending" | "submitted" | "not_submitted" | "resubmit";
  feedback: string | null;
  submittedAt: string | null;
};

type AvailableStudent = {
  id: string;
  name: string;
  grade: string | null;
  assigned: boolean;
};

type Props = {
  assignmentId: string;
  assignmentStudents: AssignmentStudentRow[];
  availableStudents: AvailableStudent[];
};

const statusConfig: Record<
  string,
  { label: string; cls: string }
> = {
  pending: { label: "예정", cls: "bg-gray-100 text-gray-600" },
  submitted: { label: "제출", cls: "bg-green-100 text-green-700" },
  not_submitted: { label: "미제출", cls: "bg-red-100 text-red-700" },
  resubmit: { label: "재제출요청", cls: "bg-yellow-100 text-yellow-700" },
};

export function AssignmentDetailClient({
  assignmentId,
  assignmentStudents,
  availableStudents,
}: Props) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [feedbackTarget, setFeedbackTarget] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAssignStudents() {
    if (selectedIds.size === 0) return;
    startTransition(async () => {
      await assignStudents(assignmentId, Array.from(selectedIds));
      setShowAddModal(false);
      setSelectedIds(new Set());
    });
  }

  function handleStatusChange(
    studentId: string,
    newStatus: "pending" | "submitted" | "not_submitted" | "resubmit"
  ) {
    startTransition(async () => {
      await updateStudentStatus(assignmentId, studentId, {
        status: newStatus,
      });
    });
  }

  function handleFeedbackSave(studentId: string) {
    startTransition(async () => {
      const row = assignmentStudents.find((s) => s.studentId === studentId);
      await updateStudentStatus(assignmentId, studentId, {
        status: row?.status ?? "pending",
        feedback: feedbackText,
      });
      setFeedbackTarget(null);
      setFeedbackText("");
    });
  }

  const unassignedStudents = availableStudents.filter((s) => !s.assigned);

  const submitted = assignmentStudents.filter(
    (s) => s.status === "submitted"
  ).length;
  const total = assignmentStudents.length;
  const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;

  return (
    <>
      {/* Summary + Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-base font-bold text-eo-text-primary">
            학생별 제출 현황
          </span>
          <span className="text-sm text-eo-text-secondary">
            {submitted}/{total}명 제출 ({pct}%)
          </span>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
          disabled={unassignedStudents.length === 0}
        >
          <UserPlus className="w-4 h-4" />
          학생 배정
        </Button>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[180px] text-xs font-semibold text-eo-text-secondary">
            학생
          </span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">
            학년
          </span>
          <span className="w-[140px] text-xs font-semibold text-eo-text-secondary">
            상태
          </span>
          <span className="w-[160px] text-xs font-semibold text-eo-text-secondary">
            제출일시
          </span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">
            피드백
          </span>
        </div>

        {assignmentStudents.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            배정된 학생이 없습니다. &quot;학생 배정&quot; 버튼으로 학생을 추가하세요.
          </div>
        ) : (
          assignmentStudents.map((row, i) => {
            const cfg = statusConfig[row.status] ?? statusConfig.pending;
            return (
              <div
                key={row.studentId}
                className={`flex items-center px-5 py-3 ${
                  i < assignmentStudents.length - 1
                    ? "border-b border-eo-border"
                    : ""
                }`}
              >
                <span className="w-[180px] text-[13px] font-medium text-eo-text-primary">
                  {row.studentName}
                </span>
                <span className="w-[80px] text-[13px] text-eo-text-secondary">
                  {row.studentGrade ?? "-"}
                </span>
                <div className="w-[140px]">
                  <select
                    value={row.status}
                    onChange={(e) =>
                      handleStatusChange(
                        row.studentId,
                        e.target.value as "pending" | "submitted" | "not_submitted" | "resubmit"
                      )
                    }
                    disabled={isPending}
                    className={`text-[11px] font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${cfg.cls}`}
                  >
                    <option value="pending">예정</option>
                    <option value="submitted">제출</option>
                    <option value="not_submitted">미제출</option>
                    <option value="resubmit">재제출요청</option>
                  </select>
                </div>
                <span className="w-[160px] text-[13px] text-eo-text-secondary">
                  {row.submittedAt
                    ? new Date(row.submittedAt).toLocaleString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "-"}
                </span>
                <div className="flex-1 flex items-center gap-2">
                  {feedbackTarget === row.studentId ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="피드백 입력"
                        className="h-8 text-sm flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleFeedbackSave(row.studentId);
                          if (e.key === "Escape") setFeedbackTarget(null);
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        onClick={() => handleFeedbackSave(row.studentId)}
                        disabled={isPending}
                        className="h-8 bg-eo-primary hover:bg-[#4338CA] text-white"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-[13px] text-eo-text-secondary truncate flex-1">
                        {row.feedback ?? "-"}
                      </span>
                      <button
                        onClick={() => {
                          setFeedbackTarget(row.studentId);
                          setFeedbackText(row.feedback ?? "");
                        }}
                        className="text-eo-text-tertiary hover:text-eo-primary shrink-0"
                        title="피드백 수정"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Students Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-xl w-[480px] max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
              <h2 className="text-lg font-bold text-eo-text-primary">
                학생 배정
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-eo-text-secondary hover:text-eo-text-primary text-xl"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-3 border-b border-eo-border">
              <span className="text-sm text-eo-text-secondary">
                {selectedIds.size}명 선택됨
              </span>
            </div>

            <div className="flex-1 overflow-auto px-6 py-3">
              {unassignedStudents.length === 0 ? (
                <p className="text-sm text-eo-text-secondary py-8 text-center">
                  배정 가능한 학생이 없습니다.
                </p>
              ) : (
                <div className="flex flex-col">
                  {unassignedStudents.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-eo-bg-surface cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(s.id)}
                        onChange={() => toggleStudent(s.id)}
                        className="w-4 h-4 rounded border-eo-border text-eo-primary"
                      />
                      <span className="text-sm font-medium text-eo-text-primary flex-1">
                        {s.name}
                      </span>
                      <span className="text-xs text-eo-text-secondary">
                        {s.grade ?? "-"}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-eo-border gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                취소
              </Button>
              <Button
                onClick={handleAssignStudents}
                disabled={isPending || selectedIds.size === 0}
                className="bg-eo-primary hover:bg-[#4338CA] text-white"
              >
                {isPending ? "배정중..." : `${selectedIds.size}명 배정`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
