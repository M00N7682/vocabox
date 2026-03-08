"use client";

import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { addStudentToClass, removeStudentFromClass } from "@/lib/actions/classes";
import Link from "next/link";

type StudentItem = { id: string; name: string; grade: string | null };

type Props = {
  classId: string;
  students: (StudentItem & { school: string | null; is_active: boolean })[];
  allStudents: StudentItem[];
};

export function ClassStudentsTab({ classId, students, allStudents }: Props) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");

  const enrolledIds = new Set(students.map((s) => s.id));

  const filtered = allStudents.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.grade ?? "").toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-eo-text-primary">
          학생 관리 ({students.length}명 배정)
        </span>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-eo-border w-[300px]">
        <Search className="w-4 h-4 text-eo-placeholder" />
        <input
          type="text"
          placeholder="학생 이름/학년 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm bg-transparent outline-none flex-1 text-eo-text-primary placeholder:text-eo-placeholder"
        />
      </div>

      <div className="bg-white rounded-xl border border-eo-border overflow-hidden">
        <div className="flex items-center px-5 py-3 bg-eo-bg-surface border-b border-eo-border">
          <span className="w-[40px] text-xs font-semibold text-eo-text-secondary">배정</span>
          <span className="flex-1 text-xs font-semibold text-eo-text-secondary">이름</span>
          <span className="w-[80px] text-xs font-semibold text-eo-text-secondary">학년</span>
          <span className="w-[120px] text-xs font-semibold text-eo-text-secondary">학교</span>
        </div>

        <div className="max-h-[500px] overflow-auto">
          {filtered.map((s) => {
            const isEnrolled = enrolledIds.has(s.id);
            const detail = students.find((st) => st.id === s.id);
            return (
              <label
                key={s.id}
                className="flex items-center px-5 py-2.5 border-b border-eo-border last:border-0 hover:bg-eo-bg-page/50 cursor-pointer"
              >
                <div className="w-[40px]">
                  <input
                    type="checkbox"
                    checked={isEnrolled}
                    disabled={isPending}
                    onChange={() => {
                      startTransition(async () => {
                        if (isEnrolled) {
                          await removeStudentFromClass(classId, s.id);
                        } else {
                          await addStudentToClass(classId, s.id);
                        }
                      });
                    }}
                    className="w-4 h-4 rounded border-eo-border text-eo-primary"
                  />
                </div>
                <Link href={`/students/${s.id}`} className="flex-1 text-[13px] font-medium text-eo-text-primary hover:text-eo-primary">
                  {s.name}
                </Link>
                <span className="w-[80px] text-[13px] text-eo-text-secondary">{s.grade ?? "-"}</span>
                <span className="w-[120px] text-[13px] text-eo-text-secondary">{detail?.school ?? "-"}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
