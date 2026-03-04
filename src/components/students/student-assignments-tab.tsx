"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { updateStudentStatus } from "@/lib/actions/assignments";
import { Check, MessageSquare } from "lucide-react";
import Link from "next/link";

type AssignmentRow = {
  assignmentId: string;
  status: "pending" | "submitted" | "not_submitted" | "resubmit";
  feedback: string | null;
  submittedAt: string | null;
  title: string;
  subjectName: string;
  subjectColor: string;
  dueDate: string;
};

type Props = {
  studentId: string;
  assignments: AssignmentRow[];
};

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending: { label: "예정", cls: "bg-gray-100 text-gray-600" },
  submitted: { label: "제출", cls: "bg-green-100 text-green-700" },
  not_submitted: { label: "미제출", cls: "bg-red-100 text-red-700" },
  resubmit: { label: "재제출요청", cls: "bg-yellow-100 text-yellow-700" },
};

export function StudentAssignmentsTab({ studentId, assignments }: Props) {
  const [isPending, startTransition] = useTransition();
  const [feedbackTarget, setFeedbackTarget] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  function handleStatusChange(
    assignmentId: string,
    currentStatus: string,
    newStatus: "pending" | "submitted" | "not_submitted" | "resubmit"
  ) {
    if (newStatus === currentStatus) return;
    startTransition(async () => {
      await updateStudentStatus(assignmentId, studentId, {
        status: newStatus,
      });
    });
  }

  function handleFeedbackSave(assignmentId: string) {
    const row = assignments.find((a) => a.assignmentId === assignmentId);
    startTransition(async () => {
      await updateStudentStatus(assignmentId, studentId, {
        status: row?.status ?? "pending",
        feedback: feedbackText,
      });
      setFeedbackTarget(null);
      setFeedbackText("");
    });
  }

  return (
    <>
      <span className="text-base font-bold text-eo-text-primary">
        과제 현황
      </span>
      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-4 py-2.5 bg-eo-bg-surface border-b border-eo-border">
          <span className="text-xs font-semibold text-eo-text-secondary flex-1">
            과제명
          </span>
          <span className="text-xs font-semibold text-eo-text-secondary w-[80px]">
            과목
          </span>
          <span className="text-xs font-semibold text-eo-text-secondary w-[100px]">
            마감일
          </span>
          <span className="text-xs font-semibold text-eo-text-secondary w-[120px]">
            상태
          </span>
          <span className="text-xs font-semibold text-eo-text-secondary w-[200px]">
            피드백
          </span>
        </div>
        {assignments.length > 0 ? (
          assignments.map((a, i) => {
            const cfg = statusConfig[a.status] ?? statusConfig.pending;
            return (
              <div
                key={a.assignmentId}
                className={`flex items-center px-4 py-2.5 ${
                  i < assignments.length - 1
                    ? "border-b border-eo-border"
                    : ""
                }`}
              >
                <Link
                  href={`/assignments/${a.assignmentId}`}
                  className="text-[13px] font-medium text-eo-text-primary flex-1 truncate pr-2 hover:text-eo-primary"
                >
                  {a.title}
                </Link>
                <div className="w-[80px]">
                  <span
                    className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: `${a.subjectColor}20`,
                      color: a.subjectColor,
                    }}
                  >
                    {a.subjectName}
                  </span>
                </div>
                <span className="text-[13px] text-eo-text-secondary w-[100px]">
                  {a.dueDate}
                </span>
                <div className="w-[120px]">
                  <select
                    value={a.status}
                    onChange={(e) =>
                      handleStatusChange(
                        a.assignmentId,
                        a.status,
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
                <div className="w-[200px] flex items-center gap-1.5">
                  {feedbackTarget === a.assignmentId ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <Input
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="피드백 입력"
                        className="h-7 text-xs flex-1"
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleFeedbackSave(a.assignmentId);
                          if (e.key === "Escape") setFeedbackTarget(null);
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleFeedbackSave(a.assignmentId)}
                        disabled={isPending}
                        className="text-eo-primary hover:text-[#4338CA]"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <span className="text-[13px] text-eo-text-secondary truncate flex-1">
                        {a.feedback ?? "-"}
                      </span>
                      <button
                        onClick={() => {
                          setFeedbackTarget(a.assignmentId);
                          setFeedbackText(a.feedback ?? "");
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
        ) : (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            과제 기록이 없습니다.
          </div>
        )}
      </div>
    </>
  );
}
