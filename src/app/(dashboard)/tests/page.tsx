"use client";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Eye, Download, Printer } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { recordTestPrint } from "@/lib/actions/tests";
import type { Student, VocabBook, VocabWord } from "@/types/database";

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
  const [shuffledWords, setShuffledWords] = useState<VocabWord[]>([]);
  const [showAllWords, setShowAllWords] = useState(false);

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
      .then(({ data }) => {
        const w = (data ?? []) as VocabWord[];
        setWords(w);
        setShuffledWords(shuffle ? shuffleArray(w) : w);
      });
  }, [selectedBook, shuffle]);

  const selectedStudentName =
    students.find((s) => s.id === selectedStudent)?.name ?? "";
  const selectedBookTitle =
    books.find((b) => b.id === selectedBook)?.title ?? "";

  const displayWords = shuffle ? shuffledWords : words;

  const handleGeneratePreview = useCallback(() => {
    if (shuffle) {
      setShuffledWords(shuffleArray(words));
    }
  }, [shuffle, words]);

  const handlePrint = useCallback(async () => {
    // Record the print action
    if (selectedStudent && selectedBook) {
      recordTestPrint({
        studentId: selectedStudent,
        vocabBookId: selectedBook,
        testType,
        isShuffled: shuffle,
      });
    }

    // Show all words for printing, then trigger print
    setShowAllWords(true);
    // Use requestAnimationFrame to ensure state update is rendered before printing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
        // Reset after print dialog closes
        setShowAllWords(false);
      });
    });
  }, [selectedStudent, selectedBook, testType, shuffle]);

  const previewLimit = 10;
  const wordsToShow = showAllWords
    ? displayWords
    : displayWords.slice(0, previewLimit);

  return (
    <>
      <Header title="시험지 생성" />
      <div className="flex gap-8 p-8 test-page-container">
        {/* Left - Form */}
        <div className="w-[480px] shrink-0 bg-white rounded-xl border border-eo-border p-8 test-settings-panel">
          <h2 className="text-lg font-semibold text-eo-text-primary mb-6">
            시험지 설정
          </h2>

          <div className="flex flex-col gap-6">
            {/* Step 1 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-eo-primary">
                Step 1. 학생 선택
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="h-10 px-3 rounded-lg border border-eo-border bg-white text-sm text-eo-text-primary"
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
              <label className="text-sm font-semibold text-eo-primary">
                Step 2. 단어장 선택
              </label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="h-10 px-3 rounded-lg border border-eo-border bg-white text-sm text-eo-text-primary"
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
              <label className="text-sm font-semibold text-eo-primary">
                Step 3. 시험 유형
              </label>
              <div className="flex flex-col gap-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    testType === "eng_to_kor"
                      ? "border-2 border-eo-primary bg-eo-primary-light"
                      : "border border-eo-border hover:bg-eo-bg-muted"
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
                        ? "border-eo-primary"
                        : "border-eo-border"
                    }`}
                  >
                    {testType === "eng_to_kor" && (
                      <div className="w-2 h-2 rounded-full bg-eo-primary" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      testType === "eng_to_kor"
                        ? "font-medium text-eo-primary"
                        : "text-eo-text-secondary"
                    }`}
                  >
                    영어 → 한글
                  </span>
                </label>
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                    testType === "kor_to_eng"
                      ? "border-2 border-eo-primary bg-eo-primary-light"
                      : "border border-eo-border hover:bg-eo-bg-muted"
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
                        ? "border-eo-primary"
                        : "border-eo-border"
                    }`}
                  >
                    {testType === "kor_to_eng" && (
                      <div className="w-2 h-2 rounded-full bg-eo-primary" />
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      testType === "kor_to_eng"
                        ? "font-medium text-eo-primary"
                        : "text-eo-text-secondary"
                    }`}
                  >
                    한글 → 영어
                  </span>
                </label>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-eo-primary">
                Step 4. 옵션 설정
              </label>
              <label className="flex items-center gap-2 text-sm text-eo-text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffle}
                  onChange={(e) => setShuffle(e.target.checked)}
                  className="w-4 h-4 rounded border-eo-border text-eo-primary"
                />
                랜덤 셔플
              </label>
              <span className="text-sm text-eo-text-secondary">
                출제 범위: 전체 ({words.length}문항)
              </span>
            </div>

            <Button
              onClick={handleGeneratePreview}
              className="w-full h-11 bg-eo-primary hover:bg-eo-primary-hover text-white gap-2 text-[15px]"
            >
              <Eye className="w-4 h-4" />
              미리보기 생성
            </Button>
          </div>
        </div>

        {/* Right - Preview */}
        <div className="flex-1 bg-white rounded-xl border border-eo-border p-8 test-preview-panel">
          <div className="flex items-center justify-between mb-6 test-preview-toolbar">
            <h2 className="text-lg font-semibold text-eo-text-primary">
              시험지 미리보기
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[13px]"
                onClick={handlePrint}
                title="PDF로 저장하려면 인쇄 대화상자에서 'PDF로 저장'을 선택하세요"
              >
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-[13px]"
                onClick={handlePrint}
              >
                <Printer className="w-4 h-4" />
                인쇄
              </Button>
            </div>
          </div>

          {/* Preview Sheet */}
          <div className="bg-eo-bg-muted rounded-lg p-8 test-preview-sheet">
            <div className="text-center mb-6">
              <h3 className="text-base font-bold text-eo-text-primary mb-1">
                단어 시험지
              </h3>
              <p className="text-sm text-eo-text-secondary mb-4">
                {selectedBookTitle} (
                {testType === "eng_to_kor" ? "영→한" : "한→영"})
              </p>
              <div className="flex items-center justify-between text-sm text-eo-text-secondary">
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

            <div className="border-t border-eo-border pt-6">
              <div className="flex flex-col gap-4">
                {displayWords.length === 0 ? (
                  <p className="text-sm text-eo-text-tertiary text-center py-4">
                    단어장을 선택하면 미리보기가 표시됩니다.
                  </p>
                ) : (
                  wordsToShow.map((w, i) => (
                    <div key={w.id} className="flex items-center gap-4">
                      <span className="text-sm text-eo-text-tertiary w-6">
                        {i + 1}.
                      </span>
                      <span className="text-sm font-medium text-eo-text-primary w-[160px]">
                        {testType === "eng_to_kor" ? w.english : w.korean}
                      </span>
                      <div className="flex-1 border-b border-eo-border" />
                    </div>
                  ))
                )}
                {!showAllWords && displayWords.length > previewLimit && (
                  <p className="text-xs text-eo-text-tertiary text-center">
                    ... 외 {displayWords.length - previewLimit}문항
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
