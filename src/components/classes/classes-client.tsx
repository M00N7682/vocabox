"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  createClass,
  updateClass,
  type ClassWithStudents,
} from "@/lib/actions/classes";

interface ClassesClientProps {
  classes: ClassWithStudents[];
}

export function ClassesClient({ classes }: ClassesClientProps) {
  const [open, setOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassWithStudents | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function openAddDialog() {
    setEditingClass(null);
    setError(null);
    setOpen(true);
  }

  function openEditDialog(cls: ClassWithStudents) {
    setEditingClass(cls);
    setError(null);
    setOpen(true);
  }

  function handleOpenChange(value: boolean) {
    if (!value) {
      setEditingClass(null);
      setError(null);
    }
    setOpen(value);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = editingClass
        ? await updateClass(editingClass.id, formData)
        : await createClass(formData);

      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setEditingClass(null);
      }
    });
  }

  const isEditing = editingClass !== null;

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-vb-text-primary">
          전체 반 목록
        </h2>
        <Button
          onClick={openAddDialog}
          className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          반 추가
        </Button>
      </div>

      {/* Card Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-xl border border-vb-border p-12 text-center">
          <p className="text-sm text-vb-text-tertiary">
            등록된 반이 없습니다. 반을 추가해주세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {classes.map((cls) => {
            const studentCount = cls.class_students?.length ?? 0;
            return (
              <div
                key={cls.id}
                onClick={() => openEditDialog(cls)}
                className="bg-white rounded-xl border border-vb-border p-6 cursor-pointer hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-vb-text-primary">
                    {cls.name}
                  </h3>
                  <Badge className="bg-vb-info-light text-vb-info border-0 text-xs">
                    {studentCount}명
                  </Badge>
                </div>
                <p className="text-sm text-vb-text-secondary mb-4">
                  {cls.description || "설명 없음"}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-vb-text-primary">
              {isEditing ? "반 수정" : "반 추가"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-vb-text-secondary">
                반 이름 <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                required
                placeholder="반 이름을 입력하세요"
                defaultValue={editingClass?.name ?? ""}
                key={editingClass?.id ?? "new"}
                className="border-vb-border"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-vb-text-secondary">
                설명
              </label>
              <Input
                name="description"
                placeholder="반에 대한 설명을 입력하세요"
                defaultValue={editingClass?.description ?? ""}
                key={`desc-${editingClass?.id ?? "new"}`}
                className="border-vb-border"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-vb-primary hover:bg-vb-primary-hover text-white"
              >
                {isPending
                  ? isEditing
                    ? "수정 중..."
                    : "추가 중..."
                  : isEditing
                    ? "수정"
                    : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
