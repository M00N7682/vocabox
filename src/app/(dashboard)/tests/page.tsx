"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Eye, Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Student, VocabBook, VocabWord } from "@/types/database";

export default function TestsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<VocabBook[]>([]);
  const [words, setWords] = useState<VocabWord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBook, setSelectedBook] = useState("");
  const [testType, setTestType] = useState<"eng_to_kor" | "kor_to_eng">(
    "eng_to_kor"
  );
  const [shuffle, setShuffle] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("students")
        .select("*")
        .eq("is_active", true)
        .order("name"),
      supabase.from("vocab_books").select("*").order("title"),
    ]).then(([studentsRes, booksRes]) => {
      const studs = (studentsRes.data ?? []) as Student[];
      const bks = (booksRes.data ?? []) as VocabBook[];
      setStudents(studs);
      setBooks(bks);
      if (studs[0]) setSelectedStudent(studs[0].id);
      if (bks[0]) setSelectedBook(bks[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedBook) return;
    const supabase = createClient();
    supabase
      .from("vocab_words")
      .select("*")
      .eq("vocab_book_id", selectedBook)
      .order("sort_order")
      .then(({ data }) => setWords((data ?? []) as VocabWord[]));
  }, [selectedBook]);

  const selectedStudentName =
    students.find((s) => s.id === selectedStudent)?.name ?? "";
  const selectedBookTitle =
    books.find((b) => b.id === selectedBook)?.title ?? "";

  const displayWords = shuffle ? [...words].sort(() => Math.random() - 0.5) : words;

  return (
    <>
      <Header title="시험지 생성" />
      <div className="flex gap-8 p-8">
        {/* Left - Form */}
        <div className="w-[480px] shrink-0 bg-white rounded-xl border border-vb-border p-8">
          <h2 className="text-lg font-semibold text-vb-text-primary mb-6">
            시험지 설정
          </h2>

          <div className="flex flex-col gap-6">
            {/* Step 1 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-vb-primary">
                Step 1. 학생 선택
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="h-10 px-3 rounded-lg border border-vb-border bg-white text-sm text-vb-text-primary"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-vb-primary">
                Step 2. 단어장 선택
              </label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="h-10 px-3 rounded-lg border border-vb-border bg-white text-sm text-vb-text-primary"
              >
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-vb-primary">
                Step 3. 시험 유형
              </label>
              <div className="flex flex-col gap-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    testType === "eng_to_kor"
                      ? "border-2 border-vb-primary bg-vb-primary-light"
                      : "border border-vb-border hover:bg-vb-bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="testType"
                    checked={testType === "eng_to_kor"}
                    onChange={() => setTestType("eng_to_kor")}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      testType === "eng_to_kor"
                        ? "border-vb-primary"
                        : "border-vb-border"
                    }`}
                  >
                    {testType === "eng_to_kor" && (
                      <div className="w-2 h-2 rounded-full bg-vb-primary" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      testType === "eng_to_kor"
                        ? "font-medium text-vb-primary"
                        : "text-vb-text-secondary"
                    }`}
                  >
                    영어 → 한글
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    testType === "kor_to_eng"
                      ? "border-2 border-vb-primary bg-vb-primary-light"
                      : "border border-vb-border hover:bg-vb-bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="testType"
                    checked={testType === "kor_to_eng"}
                    onChange={() => setTestType("kor_to_eng")}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      testType === "kor_to_eng"
                        ? "border-vb-primary"
                        : "border-vb-border"
                    }`}
                  >
                    {testType === "kor_to_eng" && (
                      <div className="w-2 h-2 rounded-full bg-vb-primary" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      testType === "kor_to_eng"
                        ? "font-medium text-vb-primary"
                        : "text-vb-text-secondary"
                    }`}
                  >
                    한글 → 영어
                  </span>
                </label>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-vb-primary">
                Step 4. 옵션 설정
              </label>
              <label className="flex items-center gap-2 text-sm text-vb-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                  className="w-4 h-4 rounded border-vb-border text-vb-primary"
                />
                랜덤 셔플
              </label>
              <span className="text-sm text-vb-text-secondary">
                출제 범위: 전체 ({words.length}문항)
              </span>
            </div>

            <Button className="w-full h-11 bg-vb-primary hover:bg-vb-primary-hover text-white gap-2 text-[15px]">
              <Eye className="w-4 h-4" />
              미리보기 생성
            </Button>
          </div>
        </div>

        {/* Right - Preview */}
        <div className="flex-1 bg-white rounded-xl border border-vb-border p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-vb-text-primary">
              시험지 미리보기
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[13px]"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[13px]"
              >
                <Printer className="w-4 h-4" />
                인쇄
              </Button>
            </div>
          </div>

          {/* Preview Sheet */}
          <div className="bg-vb-bg-muted rounded-lg p-8">
            <div className="text-center mb-6">
              <h3 className="text-base font-bold text-vb-text-primary mb-1">
                단어 시험지
              </h3>
              <p className="text-sm text-vb-text-secondary mb-4">
                {selectedBookTitle} (
                {testType === "eng_to_kor" ? "영→한" : "한→영"})
              </p>
              <div className="flex items-center justify-between text-sm text-vb-text-secondary">
                <span>이름: {selectedStudentName}</span>
                <span>
                  날짜:{" "}
                  {new Date().toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="border-t border-vb-border pt-6">
              <div className="flex flex-col gap-4">
                {displayWords.length === 0 ? (
                  <p className="text-sm text-vb-text-tertiary text-center py-4">
                    단어장을 선택하면 미리보기가 표시됩니다.
                  </p>
                ) : (
                  displayWords.slice(0, 10).map((w, i) => (
                    <div key={w.id} className="flex items-center gap-4">
                      <span className="text-sm text-vb-text-tertiary w-6">
                        {i + 1}.
                      </span>
                      <span className="text-sm font-medium text-vb-text-primary w-[160px]">
                        {testType === "eng_to_kor" ? w.english : w.korean}
                      </span>
                      <div className="flex-1 border-b border-vb-border" />
                    </div>
                  ))
                )}
                {displayWords.length > 10 && (
                  <p className="text-xs text-vb-text-tertiary text-center">
                    ... 외 {displayWords.length - 10}문항
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
