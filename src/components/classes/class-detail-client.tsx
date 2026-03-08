"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, BookOpen, ClipboardList, Calendar, FileText, BarChart3, Grid3X3, Send, Copy, Check, ExternalLink } from "lucide-react";
import { generateClassReportTokens } from "@/lib/actions/parent-report";
import { ClassStudentsTab } from "./class-students-tab";
import { ClassAssessmentsTab } from "./class-assessments-tab";
import { ClassAttendanceTab } from "./class-attendance-tab";
import { ClassAssignmentsTab } from "./class-assignments-tab";
import { ClassTextbooksTab } from "./class-textbooks-tab";
import { ClassQuickRecordsTab } from "./class-quick-records-tab";

type StudentItem = { id: string; name: string; grade: string | null };

const tabs = [
  { id: "overview", label: "개요", icon: BarChart3 },
  { id: "students", label: "학생", icon: Users },
  { id: "textbooks", label: "교재", icon: BookOpen },
  { id: "assessments", label: "평가/성적", icon: ClipboardList },
  { id: "attendance", label: "출결", icon: Calendar },
  { id: "assignments", label: "과제", icon: FileText },
  { id: "records", label: "수시기록", icon: Grid3X3 },
];

type AssessmentScore = { student_id: string; score: number | null; status: string };
type AssessmentItem = {
  id: string; name: string; date: string; type: string;
  total_points: number; status: string;
  assessment_scores?: AssessmentScore[];
};
type AssignmentStudent = { student_id: string; status: string; submitted_at: string | null };
type AssignmentItem = {
  id: string; title: string; due_date: string | null;
  difficulty: string | null; is_required: boolean; created_at: string | null;
  assignment_students?: AssignmentStudent[];
};
type AttendanceItem = { student_id: string; date: string; status: string };
type TextbookItem = { id: string; name: string; year: number | null; grade: string | null; subjects?: { name: string } | null };
type ChapterItem = { id: string; title: string; status: string; children?: ChapterItem[] };
type QuickRecordItem = { student_id: string; record_date: string; category: string; value: string | null };

type Props = {
  classId: string;
  className: string;
  subjectId: string | null;
  students: (StudentItem & { school: string | null; is_active: boolean })[];
  allStudents: StudentItem[];
  assessments: AssessmentItem[];
  assignments: AssignmentItem[];
  attendance: AttendanceItem[];
  textbooks: TextbookItem[];
  chaptersMap: Record<string, ChapterItem[]>;
  quickRecords: QuickRecordItem[];
  categories: string[];
  dateFrom: string;
  dateTo: string;
  initialTab: string;
};

export function ClassDetailClient({
  classId,
  className: clsName,
  subjectId,
  students,
  allStudents,
  assessments,
  assignments,
  attendance,
  textbooks,
  chaptersMap,
  quickRecords,
  categories,
  dateFrom,
  dateTo,
  initialTab,
}: Props) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportTokens, setReportTokens] = useState<{ studentId: string; studentName: string; parentPhone: string | null; token: string }[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const router = useRouter();

  function handleTabChange(tabId: string) {
    setActiveTab(tabId);
    router.replace(`/classes/${classId}?tab=${tabId}`, { scroll: false });
  }

  // Overview stats
  const totalAssessments = assessments.length;
  const completedAssessments = assessments.filter((a) => a.status === "완료").length;
  const totalAssignments = assignments.length;
  const overdueAssignments = assignments.filter((a) => {
    const today = new Date().toISOString().split("T")[0];
    return a.due_date && a.due_date < today;
  }).length;
  const attendancePresent = attendance.filter((a) => a.status === "출석" || a.status === "지각").length;
  const attendanceTotal = attendance.length;
  const attendanceRate = attendanceTotal > 0 ? Math.round((attendancePresent / attendanceTotal) * 100) : 0;

  const handleGenerateReports = () => {
    startGenerating(async () => {
      const result = await generateClassReportTokens(classId);
      if (result.success && result.tokens) {
        setReportTokens(result.tokens);
        setReportDialogOpen(true);
      } else {
        alert(result.error || "리포트 생성에 실패했습니다.");
      }
    });
  };

  const getReportUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/report/${token}`;
    }
    return `/report/${token}`;
  };

  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(getReportUrl(token));
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyAll = () => {
    const messages = reportTokens.map(t => {
      const url = getReportUrl(t.token);
      return `[${clsName}] ${t.studentName} 학부모님\n학습 리포트: ${url}`;
    }).join("\n\n");
    navigator.clipboard.writeText(messages);
    alert("전체 링크가 클립보드에 복사되었습니다.");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-eo-border">
        <div className="flex items-center gap-1 flex-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-eo-primary text-eo-primary"
                  : "border-transparent text-eo-text-secondary hover:text-eo-text-primary"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
        </div>
        <button
          onClick={handleGenerateReports}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-eo-primary hover:bg-eo-primary-light rounded-lg transition-colors disabled:opacity-50 mb-1"
        >
          <Send className="w-3.5 h-3.5" />
          {isGenerating ? "생성 중..." : "학부모 리포트"}
        </button>
      </div>

      {/* Report Links Dialog */}
      {reportDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setReportDialogOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-eo-text-primary">학부모 리포트 링크</h2>
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-eo-primary hover:bg-eo-primary-hover rounded-lg"
              >
                <Copy className="w-3.5 h-3.5" />
                전체 복사
              </button>
            </div>
            <p className="text-xs text-eo-text-secondary mb-4">
              각 링크를 카카오톡이나 문자로 학부모님께 전달해주세요.
            </p>
            <div className="flex-1 overflow-auto space-y-2">
              {reportTokens.map((t) => (
                <div key={t.studentId} className="flex items-center gap-3 p-3 rounded-lg border border-eo-border hover:bg-eo-bg-page">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-eo-text-primary">{t.studentName}</p>
                    {t.parentPhone && (
                      <p className="text-xs text-eo-text-tertiary">{t.parentPhone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyLink(t.token)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium border border-eo-border rounded-lg hover:bg-gray-50 shrink-0"
                  >
                    {copiedToken === t.token ? (
                      <><Check className="w-3.5 h-3.5 text-eo-success" /> 복사됨</>
                    ) : (
                      <><Copy className="w-3.5 h-3.5" /> 링크 복사</>
                    )}
                  </button>
                  <a
                    href={getReportUrl(t.token)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-gray-100 text-eo-text-tertiary"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4 pt-3 border-t border-eo-border">
              <button
                onClick={() => setReportDialogOpen(false)}
                className="px-4 py-2 text-sm border border-eo-border rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-eo-border">
              <span className="text-xs text-eo-text-secondary">학생 수</span>
              <span className="text-2xl font-bold text-eo-text-primary">{students.length}명</span>
            </div>
            <div className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-eo-border">
              <span className="text-xs text-eo-text-secondary">평가 현황</span>
              <span className="text-2xl font-bold text-eo-text-primary">
                {completedAssessments}/{totalAssessments}
              </span>
              <span className="text-[11px] text-eo-text-tertiary">완료</span>
            </div>
            <div className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-eo-border">
              <span className="text-xs text-eo-text-secondary">이번 주 출석률</span>
              <span className="text-2xl font-bold text-eo-text-primary">{attendanceRate}%</span>
              <span className="text-[11px] text-eo-text-tertiary">{attendancePresent}/{attendanceTotal}건</span>
            </div>
            <div className="flex flex-col gap-2 p-5 bg-white rounded-xl border border-eo-border">
              <span className="text-xs text-eo-text-secondary">과제</span>
              <span className="text-2xl font-bold text-eo-text-primary">{totalAssignments}건</span>
              {overdueAssignments > 0 && (
                <span className="text-[11px] text-eo-danger">{overdueAssignments}건 마감 초과</span>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4">
            {/* Linked Textbooks */}
            <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-eo-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-eo-text-primary">연결된 교재</span>
                <button
                  onClick={() => handleTabChange("textbooks")}
                  className="text-xs text-eo-primary hover:text-[#4338CA]"
                >
                  관리 →
                </button>
              </div>
              {textbooks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {textbooks.slice(0, 3).map((tb) => (
                    <div key={tb.id} className="flex items-center gap-2 text-[13px]">
                      <BookOpen className="w-3.5 h-3.5 text-eo-text-secondary" />
                      <span className="text-eo-text-primary">{tb.name}</span>
                      <span className="text-eo-text-tertiary text-xs">{tb.year} · {tb.grade ?? "-"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-eo-text-secondary">연결된 교재가 없습니다.</span>
              )}
            </div>

            {/* Recent Assessments */}
            <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-eo-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-eo-text-primary">최근 평가</span>
                <button
                  onClick={() => handleTabChange("assessments")}
                  className="text-xs text-eo-primary hover:text-[#4338CA]"
                >
                  전체 보기 →
                </button>
              </div>
              {assessments.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {assessments.slice(0, 3).map((a) => {
                    const statusStyle = a.status === "완료" ? "text-eo-success" : a.status === "진행중" ? "text-eo-warning" : "text-eo-text-secondary";
                    return (
                      <div key={a.id} className="flex items-center gap-2 text-[13px]">
                        <span className="text-eo-text-primary flex-1">{a.name}</span>
                        <span className="text-xs text-eo-text-tertiary">{a.date}</span>
                        <span className={`text-xs font-medium ${statusStyle}`}>{a.status}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-xs text-eo-text-secondary">등록된 평가가 없습니다.</span>
              )}
            </div>
          </div>

          {/* Student List Preview */}
          <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-eo-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-eo-text-primary">학생 목록</span>
              <button
                onClick={() => handleTabChange("students")}
                className="text-xs text-eo-primary hover:text-[#4338CA]"
              >
                관리 →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {students.map((s) => (
                <span
                  key={s.id}
                  className="text-[12px] px-2.5 py-1 rounded-full bg-eo-bg-surface text-eo-text-primary"
                >
                  {s.name} <span className="text-eo-text-tertiary">{s.grade ?? ""}</span>
                </span>
              ))}
              {students.length === 0 && (
                <span className="text-xs text-eo-text-secondary">배정된 학생이 없습니다.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <ClassStudentsTab
          classId={classId}
          students={students}
          allStudents={allStudents}
        />
      )}

      {activeTab === "textbooks" && (
        <ClassTextbooksTab
          classId={classId}
          linkedTextbooks={textbooks}
          chaptersMap={chaptersMap}
        />
      )}

      {activeTab === "assessments" && (
        <ClassAssessmentsTab
          classId={classId}
          assessments={assessments}
          students={students}
        />
      )}

      {activeTab === "attendance" && (
        <ClassAttendanceTab
          classId={classId}
          students={students}
          attendance={attendance}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      )}

      {activeTab === "assignments" && (
        <ClassAssignmentsTab
          assignments={assignments}
          students={students}
        />
      )}

      {activeTab === "records" && (
        <ClassQuickRecordsTab
          classId={classId}
          students={students}
          records={quickRecords}
          categories={categories}
          dateFrom={dateFrom}
          dateTo={dateTo}
        />
      )}
    </div>
  );
}
