"use client";

import { useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { addStudentToClass, removeStudentFromClass } from "@/lib/actions/classes";
import { addStudentToSubject, removeStudentFromSubject } from "@/lib/actions/subjects";

type ClassItem = { id: string; name: string };
type SubjectItem = { id: string; name: string; color: string };

type Props = {
  studentId: string;
  enrolledClasses: ClassItem[];
  enrolledSubjects: SubjectItem[];
  allClasses: ClassItem[];
  allSubjects: SubjectItem[];
};

export function StudentEnrollmentManager({
  studentId,
  enrolledClasses,
  enrolledSubjects,
  allClasses,
  allSubjects,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const enrolledClassIds = new Set(enrolledClasses.map((c) => c.id));
  const enrolledSubjectIds = new Set(enrolledSubjects.map((s) => s.id));
  const availableClasses = allClasses.filter((c) => !enrolledClassIds.has(c.id));
  const availableSubjects = allSubjects.filter((s) => !enrolledSubjectIds.has(s.id));

  function handleAddClass(classId: string) {
    startTransition(async () => {
      await addStudentToClass(classId, studentId);
      setShowClassPicker(false);
    });
  }

  function handleRemoveClass(classId: string) {
    startTransition(async () => {
      await removeStudentFromClass(classId, studentId);
    });
  }

  function handleAddSubject(subjectId: string) {
    startTransition(async () => {
      await addStudentToSubject(subjectId, studentId);
      setShowSubjectPicker(false);
    });
  }

  function handleRemoveSubject(subjectId: string) {
    startTransition(async () => {
      await removeStudentFromSubject(subjectId, studentId);
    });
  }

  return (
    <>
      {/* 소속 반 */}
      <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-eo-border">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-eo-text-primary">소속 반</span>
          {availableClasses.length > 0 && (
            <button
              onClick={() => setShowClassPicker(!showClassPicker)}
              disabled={isPending}
              className="flex items-center gap-1 text-[11px] font-medium text-eo-primary hover:text-[#4338CA]"
            >
              <Plus className="w-3 h-3" />
              추가
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {enrolledClasses.length > 0 ? (
            enrolledClasses.map((cls) => (
              <span
                key={cls.id}
                className="inline-flex items-center gap-1 text-[13px] font-medium px-3 py-1.5 rounded-md bg-[#EEF2FF] text-[#4F46E5]"
              >
                {cls.name}
                <button
                  onClick={() => handleRemoveClass(cls.id)}
                  disabled={isPending}
                  className="hover:text-[#DC2626] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-eo-text-secondary">소속 반 없음</span>
          )}
        </div>
        {showClassPicker && (
          <div className="flex flex-col gap-1 mt-1 p-2 bg-eo-bg-page rounded-lg border border-eo-border">
            {availableClasses.map((cls) => (
              <button
                key={cls.id}
                onClick={() => handleAddClass(cls.id)}
                disabled={isPending}
                className="text-left text-[13px] px-3 py-2 rounded hover:bg-white transition-colors text-eo-text-primary"
              >
                {cls.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 수강 과목 */}
      <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-eo-border">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold text-eo-text-primary">수강 과목</span>
          {availableSubjects.length > 0 && (
            <button
              onClick={() => setShowSubjectPicker(!showSubjectPicker)}
              disabled={isPending}
              className="flex items-center gap-1 text-[11px] font-medium text-eo-primary hover:text-[#4338CA]"
            >
              <Plus className="w-3 h-3" />
              추가
            </button>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {enrolledSubjects.length > 0 ? (
            enrolledSubjects.map((sub) => (
              <span
                key={sub.id}
                className="inline-flex items-center gap-1 text-[13px] font-medium px-3 py-1.5 rounded-md"
                style={{ backgroundColor: `${sub.color}20`, color: sub.color }}
              >
                {sub.name}
                <button
                  onClick={() => handleRemoveSubject(sub.id)}
                  disabled={isPending}
                  className="hover:text-[#DC2626] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-sm text-eo-text-secondary">수강 과목 없음</span>
          )}
        </div>
        {showSubjectPicker && (
          <div className="flex flex-col gap-1 mt-1 p-2 bg-eo-bg-page rounded-lg border border-eo-border">
            {availableSubjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleAddSubject(sub.id)}
                disabled={isPending}
                className="flex items-center gap-2 text-left text-[13px] px-3 py-2 rounded hover:bg-white transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: sub.color }}
                />
                <span className="text-eo-text-primary">{sub.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
