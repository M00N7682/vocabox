"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type StudentItem = { id: string; name: string; grade: string | null };

type Props = {
  classId: string;
  students: StudentItem[];
  attendance: any[];
  dateFrom: string;
  dateTo: string;
};

const statusEmoji: Record<string, string> = {
  출석: "O",
  지각: "△",
  결석: "X",
  인정결석: "◎",
};

const statusColor: Record<string, string> = {
  출석: "text-eo-success bg-[#ECFDF5]",
  지각: "text-eo-warning bg-[#FEF3C7]",
  결석: "text-eo-danger bg-[#FEE2E2]",
  인정결석: "text-[#3B82F6] bg-[#EFF6FF]",
};

function getWeekDates(dateFrom: string): string[] {
  const dates: string[] = [];
  const start = new Date(dateFrom);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const dayNames = ["월", "화", "수", "목", "금", "토", "일"];

export function ClassAttendanceTab({ classId, students, attendance, dateFrom, dateTo }: Props) {
  const weekDates = getWeekDates(dateFrom);

  // Build lookup: studentId -> date -> status
  const attendanceMap = new Map<string, Map<string, string>>();
  for (const r of attendance) {
    if (!attendanceMap.has(r.student_id)) {
      attendanceMap.set(r.student_id, new Map());
    }
    attendanceMap.get(r.student_id)!.set(r.date, r.status);
  }

  // Compute per-student stats
  const studentStats = students.map((s) => {
    const records = attendanceMap.get(s.id);
    let present = 0, late = 0, absent = 0, excused = 0;
    if (records) {
      for (const status of records.values()) {
        if (status === "출석") present++;
        else if (status === "지각") late++;
        else if (status === "결석") absent++;
        else if (status === "인정결석") excused++;
      }
    }
    return { ...s, present, late, absent, excused, total: present + late + absent + excused };
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-eo-text-primary">
          주간 출결 현황
        </span>
        <div className="flex items-center gap-4 text-sm text-eo-text-secondary">
          <span>{dateFrom} ~ {dateTo}</span>
          <Link href="/attendance" className="text-xs text-eo-primary hover:text-[#4338CA]">
            출결 관리 →
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-eo-text-secondary">
        <span className="flex items-center gap-1"><span className="w-5 h-5 flex items-center justify-center rounded bg-[#ECFDF5] text-eo-success text-[11px] font-bold">O</span> 출석</span>
        <span className="flex items-center gap-1"><span className="w-5 h-5 flex items-center justify-center rounded bg-[#FEF3C7] text-eo-warning text-[11px] font-bold">△</span> 지각</span>
        <span className="flex items-center gap-1"><span className="w-5 h-5 flex items-center justify-center rounded bg-[#FEE2E2] text-eo-danger text-[11px] font-bold">X</span> 결석</span>
        <span className="flex items-center gap-1"><span className="w-5 h-5 flex items-center justify-center rounded bg-[#EFF6FF] text-[#3B82F6] text-[11px] font-bold">◎</span> 인정결석</span>
      </div>

      {/* Matrix Table */}
      <div className="bg-white rounded-xl border border-eo-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-eo-bg-surface border-b border-eo-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-eo-text-secondary w-[140px] sticky left-0 bg-eo-bg-surface">
                학생
              </th>
              {weekDates.map((date, i) => (
                <th key={date} className="text-center px-2 py-3 text-xs font-semibold text-eo-text-secondary min-w-[60px]">
                  <div>{dayNames[i]}</div>
                  <div className="text-[10px] font-normal text-eo-text-tertiary">{date.slice(5)}</div>
                </th>
              ))}
              <th className="text-center px-3 py-3 text-xs font-semibold text-eo-text-secondary w-[60px]">출석</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-eo-text-secondary w-[60px]">지각</th>
              <th className="text-center px-3 py-3 text-xs font-semibold text-eo-text-secondary w-[60px]">결석</th>
            </tr>
          </thead>
          <tbody>
            {studentStats.map((s, i) => (
              <tr key={s.id} className={i < studentStats.length - 1 ? "border-b border-eo-border" : ""}>
                <td className="px-4 py-2.5 sticky left-0 bg-white">
                  <Link href={`/students/${s.id}`} className="text-[13px] font-medium text-eo-text-primary hover:text-eo-primary">
                    {s.name}
                  </Link>
                  <span className="text-xs text-eo-text-tertiary ml-1">{s.grade ?? ""}</span>
                </td>
                {weekDates.map((date) => {
                  const status = attendanceMap.get(s.id)?.get(date);
                  return (
                    <td key={date} className="text-center px-2 py-2.5">
                      {status ? (
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded text-[11px] font-bold ${statusColor[status] ?? ""}`}>
                          {statusEmoji[status] ?? "-"}
                        </span>
                      ) : (
                        <span className="text-xs text-eo-text-tertiary">-</span>
                      )}
                    </td>
                  );
                })}
                <td className="text-center px-3 py-2.5 text-[13px] text-eo-success font-medium">{s.present || "-"}</td>
                <td className="text-center px-3 py-2.5 text-[13px] text-eo-warning font-medium">{s.late || "-"}</td>
                <td className="text-center px-3 py-2.5 text-[13px] text-eo-danger font-medium">{s.absent || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {students.length === 0 && (
          <div className="flex items-center justify-center py-12 text-sm text-eo-text-secondary">
            배정된 학생이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}
