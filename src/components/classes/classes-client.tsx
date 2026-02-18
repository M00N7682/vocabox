"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createClass,
  updateClass,
  type ClassWithStudents,
} from "@/lib/actions/classes";

type Props = {
  classes: ClassWithStudents[];
  subjects: { id: string; name: string }[];
};

export function ClassesClient({ classes, subjects }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editClass, setEditClass] = useState<ClassWithStudents | null>(null);

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
          return (
            <div
              key={cls.id}
              onClick={() => {
                setEditClass(cls);
                setDialogOpen(true);
              }}
              className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border w-[340px] cursor-pointer hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-eo-text-primary">
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
  const isEdit = !!cls;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      if (isEdit) {
        await updateClass(cls!.id, formData);
      } else {
        await createClass(formData);
      }
      onClose();
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
