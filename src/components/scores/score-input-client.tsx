"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { saveAssessmentScores } from "@/lib/actions/assessments";

type ScoreEntry = {
  student_id: string;
  students: { id: string; name: string } | null;
  score: number | null;
  grade_value: string | null;
  check_value: boolean | null;
  status: string;
  note: string | null;
};

type Props = {
  assessmentId: string;
  totalPoints: number;
  scoringMethod: "score" | "grade" | "check";
  scores: ScoreEntry[];
};

const STATUS_OPTIONS = [
  { value: "응시", label: "응시" },
  { value: "결시", label: "결시" },
  { value: "지각", label: "지각" },
  { value: "미제출", label: "미제출" },
  { value: "보강예정", label: "보강예정" },
  { value: "면제", label: "면제" },
] as const;

const GRADE_OPTIONS = ["A", "B", "C", "D", "F"];

const statusStyles: Record<string, string> = {
  응시: "bg-[#ECFDF5] text-[#10B981]",
  결시: "bg-[#FEE2E2] text-[#EF4444]",
  지각: "bg-[#FEF3C7] text-[#D97706]",
  미제출: "bg-[#FEE2E2] text-[#EF4444]",
  보강예정: "bg-[#EEF2FF] text-[#4F46E5]",
  면제: "bg-[#F1F5F9] text-[#6B7280]",
};

export function ScoreInputClient({ assessmentId, totalPoints, scoringMethod, scores: initialScores }: Props) {
  const [scores, setScores] = useState(
    initialScores.map((s) => ({
      student_id: s.student_id,
      name: s.students?.name ?? "-",
      score: s.score,
      grade_value: s.grade_value ?? "",
      check_value: s.check_value ?? false,
      status: s.status || "응시",
      note: s.note ?? "",
    }))
  );
  const [isPending, startTransition] = useTransition();
  const [saveResult, setSaveResult] = useState<{ success?: boolean; error?: string } | null>(null);

  function updateField<K extends keyof (typeof scores)[0]>(index: number, key: K, value: (typeof scores)[0][K]) {
    setScores((prev) => prev.map((s, i) => (i === index ? { ...s, [key]: value } : s)));
  }

  function updateStatus(index: number, status: string) {
    const isAbsent = status !== "응시" && status !== "지각";
    setScores((prev) =>
      prev.map((s, i) =>
        i === index
          ? { ...s, status, ...(isAbsent ? { score: null, grade_value: "", check_value: false } : {}) }
          : s
      )
    );
  }

  function handleSave() {
    setSaveResult(null);
    startTransition(async () => {
      const result = await saveAssessmentScores(
        assessmentId,
        scores.map((s) => ({
          student_id: s.student_id,
          score: scoringMethod === "score" ? s.score : null,
          grade_value: scoringMethod === "grade" ? s.grade_value || null : null,
          check_value: scoringMethod === "check" ? s.check_value : null,
          status: s.status as "응시" | "결시" | "지각" | "미제출" | "보강예정" | "면제",
          note: s.note || undefined,
        }))
      );
      if (result?.error) {
        setSaveResult({ error: result.error });
      } else {
        setSaveResult({ success: true });
        setTimeout(() => setSaveResult(null), 3000);
      }
    });
  }

  const completedCount = scores.filter((s) => {
    if (s.status !== "응시" && s.status !== "지각") return false;
    if (scoringMethod === "score") return s.score !== null;
    if (scoringMethod === "grade") return !!s.grade_value;
    return true;
  }).length;

  const scoringLabel = scoringMethod === "score" ? "점수형" : scoringMethod === "grade" ? "등급형" : "체크형";

  return (
    <>
      <div className="flex items-center gap-6 px-5 py-4 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-eo-text-secondary">채점 방식</span>
          <span className="text-sm font-semibold text-eo-text-primary">{scoringLabel}</span>
        </div>
        {scoringMethod === "score" && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-eo-text-secondary">총점</span>
            <span className="text-sm font-semibold text-eo-text-primary">{totalPoints}점</span>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-eo-text-secondary">대상 인원</span>
          <span className="text-sm font-semibold text-eo-text-primary">{scores.length}명</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] text-eo-text-secondary">입력 완료</span>
          <span className="text-sm font-semibold text-eo-primary">{completedCount}/{scores.length}명</span>
        </div>
        <div className="ml-auto flex gap-2">
          {saveResult?.error && (
            <span className="text-sm text-eo-danger">{saveResult.error}</span>
          )}
          {saveResult?.success && (
            <span className="text-sm text-eo-success font-medium">저장 완료!</span>
          )}
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
          >
            <Save className="w-4 h-4" />
            {isPending ? "저장중..." : "저장"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[50px] text-xs font-semibold text-eo-text-secondary">#</span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">학생명</span>
          <span className="w-[140px] text-xs font-semibold text-eo-text-secondary">
            {scoringMethod === "score" ? "점수" : scoringMethod === "grade" ? "등급" : "완료"}
          </span>
          <span className="w-[120px] text-xs font-semibold text-eo-text-secondary">상태</span>
          <span className="w-[160px] text-xs font-semibold text-eo-text-secondary">비고</span>
        </div>
        {scores.map((s, i) => {
          const isAbsent = s.status !== "응시" && s.status !== "지각";
          return (
            <div
              key={s.student_id}
              className={`flex items-center px-5 py-2.5 ${
                isAbsent ? "bg-[#FEF2F2]" : ""
              } ${i < scores.length - 1 ? "border-b border-eo-border" : ""}`}
            >
              <span className="w-[50px] text-[13px] text-eo-text-secondary">{i + 1}</span>
              <span className="flex-1 text-[13px] font-medium text-eo-text-primary">{s.name}</span>

              <div className="w-[140px]">
                {scoringMethod === "score" && (
                  <input
                    type="number"
                    min={0}
                    max={totalPoints}
                    step="0.01"
                    value={s.score ?? ""}
                    onChange={(e) => updateField(i, "score", e.target.value === "" ? null : Number(e.target.value))}
                    disabled={isAbsent}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm w-[90px] ${
                      isAbsent
                        ? "bg-[#FEF2F2] border border-[#FECACA] text-eo-placeholder"
                        : "bg-white border border-eo-border text-eo-text-primary focus:border-eo-primary focus:border-2 outline-none"
                    }`}
                  />
                )}
                {scoringMethod === "grade" && (
                  <select
                    value={s.grade_value}
                    onChange={(e) => updateField(i, "grade_value", e.target.value)}
                    disabled={isAbsent}
                    className={`px-3 py-2 rounded-lg text-sm w-[90px] ${
                      isAbsent
                        ? "bg-[#FEF2F2] border border-[#FECACA] text-eo-placeholder"
                        : "bg-white border border-eo-border text-eo-text-primary"
                    }`}
                  >
                    <option value="">선택</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                )}
                {scoringMethod === "check" && (
                  <label className={`flex items-center gap-2 cursor-pointer ${isAbsent ? "opacity-40" : ""}`}>
                    <input
                      type="checkbox"
                      checked={s.check_value}
                      onChange={(e) => updateField(i, "check_value", e.target.checked)}
                      disabled={isAbsent}
                      className="w-5 h-5 rounded border-eo-border text-eo-primary focus:ring-eo-primary"
                    />
                    <span className="text-sm text-eo-text-primary">
                      {s.check_value ? "완료" : "미완료"}
                    </span>
                  </label>
                )}
              </div>

              <div className="w-[120px]">
                <select
                  value={s.status}
                  onChange={(e) => updateStatus(i, e.target.value)}
                  className={`text-xs font-semibold px-2 py-1 rounded cursor-pointer ${statusStyles[s.status] ?? "bg-[#F1F5F9] text-[#6B7280]"}`}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="w-[160px]">
                <input
                  type="text"
                  value={s.note}
                  onChange={(e) => updateField(i, "note", e.target.value)}
                  placeholder="-"
                  className={`text-[13px] bg-transparent outline-none w-full ${
                    isAbsent ? "text-eo-danger" : "text-eo-text-secondary"
                  }`}
                />
              </div>
            </div>
          );
        })}
        {scores.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            대상 학생이 없습니다.
          </div>
        )}
      </div>
    </>
  );
}
