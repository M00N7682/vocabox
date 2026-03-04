"use client";

import { useState, useTransition } from "react";
import { Plus, X, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createClass,
  updateClass,
  addStudentToClass,
  removeStudentFromClass,
  type ClassWithStudents,
} from "@/lib/actions/classes";
import Link from "next/link";

type StudentItem = { id: string; name: string; grade: string | null };

type Props = {
  classes: ClassWithStudents[];
  subjects: { id: string; name: string }[];
  students: StudentItem[];
};

export function ClassesClient({ classes, subjects, students }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassWithStudents | null>(null);
  const [studentManagerOpen, setStudentManagerOpen] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-eo-text-secondary">
          총 {classes.length}개
        </span>
        <Button
          onClick={() => {
            setEditClass(null);
            setDialogOpen(true);
          }}
          className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          반 추가
        </Button>
      </div>

      <div className="flex gap-5 flex-wrap">
        {classes.map((cls) => {
          const studentCount = cls.class_students?.length ?? 0;
          const isExpanded = studentManagerOpen === cls.id;
          const enrolledIds = new Set(cls.class_students?.map((cs) => cs.student_id) ?? []);
          const enrolledStudents = students.filter((s) => enrolledIds.has(s.id));

          return (
            <div
              key={cls.id}
              className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border w-[340px] hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-lg font-bold text-eo-text-primary cursor-pointer hover:text-eo-primary"
                  onClick={() => {
                    setEditClass(cls);
                    setDialogOpen(true);
                  }}
                >
                  {cls.name}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#DBEAFE] text-[#1E40AF]">
                  {studentCount}명
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-eo-text-secondary">설명</span>
                <span className="text-[13px] text-eo-text-primary">
                  {cls.description || "-"}
                </span>
              </div>
              <button
                onClick={() => setStudentManagerOpen(isExpanded ? null : cls.id)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-eo-primary hover:text-[#4338CA]"
              >
                <Users className="w-3.5 h-3.5" />
                {isExpanded ? "학생 관리 닫기" : "학생 관리"}
              </button>
              {isExpanded && (
                <ClassStudentManager
                  classId={cls.id}
                  enrolledStudents={enrolledStudents}
                  allStudents={students}
                  enrolledIds={enrolledIds}
                />
              )}
            </div>
          );
        })}
        {classes.length === 0 && (
          <div className="flex items-center justify-center w-full py-20 text-eo-text-secondary text-sm">
            등록된 반이 없습니다. 반을 추가해주세요.
          </div>
        )}
      </div>

      {dialogOpen && (
        <ClassFormDialog
          cls={editClass}
          subjects={subjects}
          onClose={() => {
            setDialogOpen(false);
            setEditClass(null);
          }}
        />
      )}
    </>
  );
}

function ClassStudentManager({
  classId,
  enrolledStudents,
  allStudents,
  enrolledIds,
}: {
  classId: string;
  enrolledStudents: StudentItem[];
  allStudents: StudentItem[];
  enrolledIds: Set<string>;
}) {
  const [isPending, startTransition] = useTransition();
  const [showPicker, setShowPicker] = useState(false);
  const available = allStudents.filter((s) => !enrolledIds.has(s.id));

  return (
    <div className="flex flex-col gap-2 pt-2 border-t border-eo-border">
      {enrolledStudents.map((s) => (
        <div key={s.id} className="flex items-center justify-between text-[13px]">
          <Link href={`/students/${s.id}`} className="text-eo-text-primary hover:text-eo-primary">
            {s.name} <span className="text-eo-text-tertiary">{s.grade ?? ""}</span>
          </Link>
          <button
            onClick={() => startTransition(async () => { await removeStudentFromClass(classId, s.id); })}
            disabled={isPending}
            className="text-eo-text-tertiary hover:text-eo-danger"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {enrolledStudents.length === 0 && (
        <span className="text-[12px] text-eo-text-secondary">배정된 학생이 없습니다</span>
      )}
      {available.length > 0 && (
        <>
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center gap-1 text-[12px] text-eo-primary hover:text-[#4338CA] mt-1"
          >
            <Plus className="w-3 h-3" />
            학생 추가
          </button>
          {showPicker && (
            <div className="flex flex-col gap-0.5 p-2 bg-eo-bg-page rounded-lg border border-eo-border max-h-[200px] overflow-auto">
              {available.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    startTransition(async () => {
                      await addStudentToClass(classId, s.id);
                      setShowPicker(false);
                    });
                  }}
                  disabled={isPending}
                  className="text-left text-[12px] px-2 py-1.5 rounded hover:bg-white text-eo-text-primary"
                >
                  {s.name} <span className="text-eo-text-tertiary">{s.grade ?? ""}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ClassFormDialog({
  cls,
  subjects,
  onClose,
}: {
  cls: ClassWithStudents | null;
  subjects: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!cls;

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEdit
        ? await updateClass(cls!.id, formData)
        : await createClass(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <form action={handleSubmit}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
            <h2 className="text-lg font-bold text-eo-text-primary">
              {isEdit ? "반 수정" : "반 추가"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-eo-text-secondary hover:text-eo-text-primary"
            >
              &times;
            </button>
          </div>

          <div className="flex flex-col gap-4 px-6 py-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-sm text-eo-danger">{error}</div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">
                반 이름 *
              </label>
              <Input
                name="name"
                defaultValue={cls?.name ?? ""}
                placeholder="반 이름을 입력하세요"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-primary">
                설명
              </label>
              <Input
                name="description"
                defaultValue={cls?.description ?? ""}
                placeholder="반에 대한 설명"
              />
            </div>
          </div>

          <div className="flex items-center justify-end px-6 py-4 border-t border-eo-border gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-eo-primary hover:bg-[#4338CA] text-white"
            >
              {isPending ? "저장중..." : isEdit ? "수정" : "추가"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
