"use client";

import { useState, useTransition } from "react";
import { Plus, Save } from "lucide-react";
import { bulkSaveQuickRecords } from "@/lib/actions/quick-records";

type StudentItem = { id: string; name: string; grade: string | null };

type Props = {
  classId: string;
  students: StudentItem[];
  records: any[];
  categories: string[];
  dateFrom: string;
  dateTo: string;
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

const defaultCategories = ["단어시험", "숙제", "수행", "기타"];

export function ClassQuickRecordsTab({
  classId,
  students,
  records,
  categories: existingCategories,
  dateFrom,
  dateTo,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState(existingCategories[0] ?? "단어시험");
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const weekDates = getWeekDates(dateFrom);

  const allCategories = Array.from(new Set([...defaultCategories, ...existingCategories]));

  // Build lookup: studentId -> date -> value
  const valueMap = new Map<string, string>();
  for (const r of records) {
    if (r.category === activeCategory) {
      const key = `${r.student_id}_${r.record_date}`;
      valueMap.set(key, r.value ?? "");
    }
  }

  // Local state for edits
  const [editedValues, setEditedValues] = useState<Map<string, string>>(new Map());

  function getCellValue(studentId: string, date: string): string {
    const key = `${studentId}_${date}`;
    if (editedValues.has(key)) return editedValues.get(key)!;
    return valueMap.get(key) ?? "";
  }

  function setCellValue(studentId: string, date: string, value: string) {
    const key = `${studentId}_${date}`;
    setEditedValues((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }

  function handleSave() {
    if (editedValues.size === 0) return;

    const records: {
      class_id: string;
      student_id: string;
      record_date: string;
      category: string;
      value: string;
    }[] = [];

    editedValues.forEach((value, key) => {
      const [studentId, date] = key.split("_");
      if (value.trim()) {
        records.push({
          class_id: classId,
          student_id: studentId,
          record_date: date,
          category: activeCategory,
          value: value.trim(),
        });
      }
    });

    if (records.length === 0) return;

    startTransition(async () => {
      await bulkSaveQuickRecords(records);
      setEditedValues(new Map());
    });
  }

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setEditedValues(new Map());
  }

  const hasChanges = editedValues.size > 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-eo-text-primary">수시 기록</span>
          <span className="text-xs text-eo-text-secondary">{dateFrom} ~ {dateTo}</span>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending || !hasChanges}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg ${
            hasChanges
              ? "text-white bg-eo-primary hover:bg-[#4338CA]"
              : "text-eo-text-tertiary bg-eo-bg-surface cursor-not-allowed"
          }`}
        >
          <Save className="w-4 h-4" />
          {isPending ? "저장중..." : "저장"}
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        {allCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 text-sm rounded-lg ${
              activeCategory === cat
                ? "bg-eo-primary text-white"
                : "bg-white border border-eo-border text-eo-text-secondary hover:text-eo-text-primary"
            }`}
          >
            {cat}
          </button>
        ))}
        {showNewCategory ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newCategory.trim()) {
                handleCategoryChange(newCategory.trim());
                setNewCategory("");
                setShowNewCategory(false);
              }
            }}
            className="flex items-center gap-1"
          >
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="카테고리명"
              className="h-8 px-2 text-sm border border-eo-border rounded-lg w-[100px]"
              autoFocus
            />
            <button type="submit" className="text-xs text-eo-primary">추가</button>
            <button type="button" onClick={() => setShowNewCategory(false)} className="text-xs text-eo-text-tertiary">취소</button>
          </form>
        ) : (
          <button
            onClick={() => setShowNewCategory(true)}
            className="flex items-center gap-1 px-2 py-1.5 text-sm text-eo-text-secondary hover:text-eo-primary"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Spreadsheet Grid */}
      <div className="bg-white rounded-xl border border-eo-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-eo-bg-surface border-b border-eo-border">
              <th className="text-left px-4 py-3 text-xs font-semibold text-eo-text-secondary w-[140px] sticky left-0 bg-eo-bg-surface">
                학생
              </th>
              {weekDates.map((date, i) => (
                <th key={date} className="text-center px-1 py-3 text-xs font-semibold text-eo-text-secondary min-w-[80px]">
                  <div>{dayNames[i]}</div>
                  <div className="text-[10px] font-normal text-eo-text-tertiary">{date.slice(5)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={s.id} className={i < students.length - 1 ? "border-b border-eo-border" : ""}>
                <td className="px-4 py-2 sticky left-0 bg-white">
                  <span className="text-[13px] font-medium text-eo-text-primary">{s.name}</span>
                  <span className="text-xs text-eo-text-tertiary ml-1">{s.grade ?? ""}</span>
                </td>
                {weekDates.map((date) => {
                  const val = getCellValue(s.id, date);
                  const isEdited = editedValues.has(`${s.id}_${date}`);
                  return (
                    <td key={date} className="px-1 py-1.5">
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => setCellValue(s.id, date, e.target.value)}
                        placeholder="-"
                        className={`w-full h-8 px-2 text-center text-[13px] rounded border transition-colors ${
                          isEdited
                            ? "border-eo-primary bg-[#EEF2FF]"
                            : val
                              ? "border-eo-border bg-white"
                              : "border-transparent bg-transparent hover:border-eo-border"
                        }`}
                      />
                    </td>
                  );
                })}
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

      <div className="text-xs text-eo-text-tertiary">
        각 셀에 점수나 결과를 입력하세요 (예: &quot;18/20&quot;, &quot;85&quot;, &quot;완료&quot;). 변경 후 &quot;저장&quot; 버튼을 눌러주세요.
      </div>
    </div>
  );
}
