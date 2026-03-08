"use client";

import { useMemo } from "react";

type Props = {
  studentName: string;
  academyName: string;
  attendance: { date: string; status: string; subject_name: string }[];
  assignments: { title: string; due_date: string; status: string; subject_name: string }[];
  records: { record_date: string; category: string; label: string; value: string; numeric_value: number }[];
  scores: { assessment_name: string; assessment_date: string; assessment_type: string; score: number; total_points: number; status: string; subject_name: string }[];
  payments: { description: string; amount: number; due_date: string; status: string; paid_at: string }[];
};

export function ParentReportClient({
  studentName,
  academyName,
  attendance,
  assignments,
  records,
  scores,
  payments,
}: Props) {
  // Calculate summary stats
  const attendanceRate = useMemo(() => {
    if (attendance.length === 0) return null;
    const present = attendance.filter(a => a.status === "출석" || a.status === "인정결석").length;
    return Math.round((present / attendance.length) * 100);
  }, [attendance]);

  const assignmentRate = useMemo(() => {
    if (assignments.length === 0) return null;
    const submitted = assignments.filter(a => a.status === "submitted").length;
    return Math.round((submitted / assignments.length) * 100);
  }, [assignments]);

  const avgScore = useMemo(() => {
    const scored = scores.filter(s => s.score !== null && s.total_points > 0);
    if (scored.length === 0) return null;
    const avg = scored.reduce((sum, s) => sum + (s.score / s.total_points) * 100, 0) / scored.length;
    return Math.round(avg);
  }, [scores]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const formatMoney = (amount: number) => {
    return amount.toLocaleString("ko-KR") + "원";
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "출석": return "text-emerald-600 bg-emerald-50";
      case "지각": return "text-amber-600 bg-amber-50";
      case "결석": return "text-red-600 bg-red-50";
      case "인정결석": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const assignmentStatusLabel = (status: string) => {
    switch (status) {
      case "submitted": return { text: "제출완료", color: "text-emerald-600 bg-emerald-50" };
      case "pending": return { text: "미제출", color: "text-amber-600 bg-amber-50" };
      case "not_submitted": return { text: "미제출", color: "text-red-600 bg-red-50" };
      case "resubmit": return { text: "재제출", color: "text-orange-600 bg-orange-50" };
      default: return { text: status, color: "text-gray-600 bg-gray-50" };
    }
  };

  const paymentStatusLabel = (status: string) => {
    switch (status) {
      case "paid": return { text: "납부완료", color: "text-emerald-600 bg-emerald-50" };
      case "pending": return { text: "미납", color: "text-amber-600 bg-amber-50" };
      case "overdue": return { text: "연체", color: "text-red-600 bg-red-50" };
      case "cancelled": return { text: "취소", color: "text-gray-400 bg-gray-50" };
      default: return { text: status, color: "text-gray-600 bg-gray-50" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white px-4 pt-12 pb-8">
        <div className="max-w-lg mx-auto">
          <p className="text-indigo-200 text-xs font-medium mb-1">{academyName}</p>
          <h1 className="text-2xl font-bold">{studentName} 학습 리포트</h1>
          <p className="text-indigo-200 text-sm mt-1">최근 30일 학습 현황</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard
            label="출석률"
            value={attendanceRate !== null ? `${attendanceRate}%` : "-"}
            sub={attendance.length > 0 ? `${attendance.length}일 기준` : "데이터 없음"}
            color={attendanceRate !== null && attendanceRate >= 90 ? "emerald" : attendanceRate !== null && attendanceRate >= 70 ? "amber" : "red"}
          />
          <SummaryCard
            label="과제 이행률"
            value={assignmentRate !== null ? `${assignmentRate}%` : "-"}
            sub={assignments.length > 0 ? `${assignments.length}건 기준` : "데이터 없음"}
            color={assignmentRate !== null && assignmentRate >= 90 ? "emerald" : assignmentRate !== null && assignmentRate >= 70 ? "amber" : "red"}
          />
          <SummaryCard
            label="평가 평균"
            value={avgScore !== null ? `${avgScore}점` : "-"}
            sub={scores.length > 0 ? `${scores.length}회 기준` : "데이터 없음"}
            color={avgScore !== null && avgScore >= 80 ? "emerald" : avgScore !== null && avgScore >= 60 ? "amber" : "red"}
          />
        </div>

        {/* Attendance Section */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">&#x2713;</span>
            출결 현황
          </h2>
          {attendance.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">최근 출결 기록이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {attendance.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">{formatDate(a.date)}</span>
                    <span className="text-sm text-gray-700">{a.subject_name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(a.status)}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Assignments Section */}
        <section className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">&#x1F4CB;</span>
            과제 현황
          </h2>
          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">최근 과제가 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {assignments.map((a, i) => {
                const st = assignmentStatusLabel(a.status);
                return (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{a.title}</p>
                      <p className="text-xs text-gray-400">{a.subject_name} · 마감 {formatDate(a.due_date)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${st.color}`}>
                      {st.text}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Records Section */}
        {records.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-xs">&#x1F4DD;</span>
              수시 기록
            </h2>
            <div className="space-y-2">
              {records.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-12">{formatDate(r.record_date)}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium">{r.category}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {r.value || (r.numeric_value !== null ? `${r.numeric_value}점` : "-")}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Assessment Scores Section */}
        {scores.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs">&#x1F4CA;</span>
              평가 성적
            </h2>
            <div className="space-y-3">
              {scores.map((s, i) => {
                const pct = s.total_points > 0 ? Math.round((s.score / s.total_points) * 100) : null;
                return (
                  <div key={i} className="py-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{s.assessment_name}</p>
                        <p className="text-xs text-gray-400">{s.subject_name} · {formatDate(s.assessment_date)}</p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className="text-sm font-bold text-gray-900">
                          {s.score !== null ? `${s.score}/${s.total_points}` : s.status}
                        </span>
                        {pct !== null && (
                          <span className={`block text-xs font-medium ${pct >= 80 ? "text-emerald-600" : pct >= 60 ? "text-amber-600" : "text-red-600"}`}>
                            {pct}%
                          </span>
                        )}
                      </div>
                    </div>
                    {pct !== null && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Payment Section */}
        {payments.length > 0 && (
          <section className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs">&#x1F4B0;</span>
              수납 현황
            </h2>
            <div className="space-y-2">
              {payments.map((p, i) => {
                const st = paymentStatusLabel(p.status);
                return (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{p.description}</p>
                      <p className="text-xs text-gray-400">납부기한 {formatDate(p.due_date)}</p>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-bold text-gray-900">{formatMoney(p.amount)}</p>
                      <span className={`text-xs font-medium ${st.color} px-1.5 py-0.5 rounded-full`}>
                        {st.text}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-6">
          <p className="text-xs text-gray-400">
            {academyName} · EduOps
          </p>
          <p className="text-[10px] text-gray-300 mt-1">
            이 리포트는 자동 생성되었습니다
          </p>
        </footer>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "emerald" | "amber" | "red";
}) {
  const textColor = {
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    red: "text-red-700",
  }[color];

  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm text-center">
      <p className="text-[10px] text-gray-500 font-medium mb-1">{label}</p>
      <p className={`text-xl font-bold ${value === "-" ? "text-gray-300" : textColor}`}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
