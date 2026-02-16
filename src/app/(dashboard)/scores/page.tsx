"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { saveBulkScores } from "@/lib/actions/scores";
import type { Student, VocabBook } from "@/types/database";

type ClassOption = { id: string; name: string };

export default function ScoresPage() {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [books, setBooks] = useState<VocabBook[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [testType, setTestType] = useState<"eng_to_kor" | "kor_to_eng">(
    "eng_to_kor"
  );
  const [testDate, setTestDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [scoreInputs, setScoreInputs] = useState<Record<string, number>>({});
  const [totalCount, setTotalCount] = useState(30);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("classes").select("*").order("sort_order"),
      supabase.from("vocab_books").select("*").order("title"),
    ]).then(([classesRes, booksRes]) => {
      const cls = (classesRes.data ?? []) as { id: string; name: string }[];
      const bks = (booksRes.data ?? []) as VocabBook[];
      setClasses(cls);
      setBooks(bks);
      if (cls[0]) setSelectedClass(cls[0].id);
      if (bks[0]) {
        setSelectedBook(bks[0].id);
        setTotalCount(bks[0].word_count || 30);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const supabase = createClient();
    supabase
      .from("class_students")
      .select("student_id, students(*)")
      .eq("class_id", selectedClass)
      .then(({ data }) => {
        const studs = ((data ?? []) as unknown as { student_id: string; students: Student }[])
          .map((cs) => cs.students)
          .filter(Boolean);
        setStudents(studs);
        setScoreInputs({});
      });
  }, [selectedClass]);

  useEffect(() => {
    const book = books.find((b) => b.id === selectedBook);
    if (book) setTotalCount(book.word_count || 30);
  }, [selectedBook, books]);

  async function handleSave() {
    setSaving(true);
    const scores = students
      .filter((s) => scoreInputs[s.id] !== undefined)
      .map((s) => ({
        studentId: s.id,
        vocabBookId: selectedBook,
        testDate,
        correctCount: scoreInputs[s.id],
        totalCount,
        testType,
      }));

    if (scores.length > 0) {
      await saveBulkScores(scores);
    }
    setSaving(false);
  }

  return (
    <>
      <Header title="점수 입력" />
      <div className="flex flex-col gap-6 p-8">
        {/* Filter bar */}
        <div className="flex items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              날짜
            </label>
            <Input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="h-10 w-[200px]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              반
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="h-10 px-3 rounded-lg border border-vb-border bg-white text-sm text-vb-text-primary w-[200px]"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              단어장
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="h-10 px-3 rounded-lg border border-vb-border bg-white text-sm text-vb-text-primary w-[240px]"
            >
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              유형
            </label>
            <select
              value={testType}
              onChange={(e) =>
                setTestType(e.target.value as "eng_to_kor" | "kor_to_eng")
              }
              className="h-10 px-3 rounded-lg border border-vb-border bg-white text-sm text-vb-text-primary w-[160px]"
            >
              <option value="eng_to_kor">영→한</option>
              <option value="kor_to_eng">한→영</option>
            </select>
          </div>
          <div className="flex-1" />
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2 h-10"
          >
            <Save className="w-4 h-4" />
            {saving ? "저장 중..." : "일괄 저장"}
          </Button>
        </div>

        {/* Score Table */}
        <div className="bg-white rounded-xl border border-vb-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-vb-bg-muted">
                <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  학생명
                </th>
                <th className="text-center px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  맞은 수
                </th>
                <th className="text-center px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  전체
                </th>
                <th className="text-right px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                  점수
                </th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-vb-text-tertiary"
                  >
                    반을 선택하면 학생 목록이 표시됩니다.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const correct = scoreInputs[s.id] ?? 0;
                  const pct =
                    totalCount > 0
                      ? Math.round((correct / totalCount) * 1000) / 10
                      : 0;
                  const color =
                    pct >= 90
                      ? "text-vb-success"
                      : pct >= 80
                        ? "text-vb-warning"
                        : "text-vb-danger";
                  return (
                    <tr key={s.id} className="border-t border-vb-border">
                      <td className="px-5 py-3 text-sm font-medium text-vb-text-primary">
                        {s.name}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <Input
                          type="number"
                          min={0}
                          max={totalCount}
                          value={scoreInputs[s.id] ?? ""}
                          onChange={(e) =>
                            setScoreInputs((prev) => ({
                              ...prev,
                              [s.id]: Number(e.target.value),
                            }))
                          }
                          className="w-[120px] mx-auto text-center h-9"
                        />
                      </td>
                      <td className="px-5 py-3 text-sm text-center text-vb-text-primary">
                        {totalCount}
                      </td>
                      <td
                        className={`px-5 py-3 text-sm font-bold text-right ${color}`}
                      >
                        {scoreInputs[s.id] !== undefined ? `${pct}%` : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
