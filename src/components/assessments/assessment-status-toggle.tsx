"use client";

import { useTransition } from "react";
import { updateAssessment } from "@/lib/actions/assessments";

const statusFlow: Record<string, string> = {
  예정: "진행중",
  진행중: "완료",
  완료: "예정",
};

const statusStyles: Record<string, string> = {
  예정: "bg-[#F1F5F9] text-[#6B7280] hover:bg-[#E2E8F0]",
  진행중: "bg-[#DBEAFE] text-[#1E40AF] hover:bg-[#BFDBFE]",
  완료: "bg-[#D1FAE5] text-[#065F46] hover:bg-[#A7F3D0]",
};

export function AssessmentStatusToggle({
  assessmentId,
  currentStatus,
}: {
  assessmentId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();

  const nextStatus = statusFlow[currentStatus] ?? "진행중";

  return (
    <button
      onClick={() => {
        startTransition(async () => {
          const fd = new FormData();
          fd.set("status", nextStatus);
          await updateAssessment(assessmentId, fd);
        });
      }}
      disabled={isPending}
      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-colors cursor-pointer ${statusStyles[currentStatus] ?? "bg-[#F1F5F9] text-[#6B7280]"}`}
      title={`클릭하여 "${nextStatus}"(으)로 변경`}
    >
      {isPending ? "변경중..." : currentStatus}
    </button>
  );
}
