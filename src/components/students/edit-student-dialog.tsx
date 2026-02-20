"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateStudent } from "@/lib/actions/students";

type StudentWithClasses = {
  id: string;
  name: string;
  english_name: string | null;
  phone: string | null;
  parent_phone: string | null;
  school: string | null;
  grade: string | null;
  memo: string | null;
  is_active: boolean;
  class_students: { class_id: string; classes: { name: string } | null }[];
};

interface EditStudentDialogProps {
  student: StudentWithClasses;
}

export function EditStudentDialog({ student }: EditStudentDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(student.is_active);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("is_active", isActive ? "true" : "false");

    startTransition(async () => {
      const result = await updateStudent(student.id, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-[13px]">
          <Pencil className="w-4 h-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-eo-text-primary">학생 수정</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-eo-text-secondary">
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              name="name"
              required
              defaultValue={student.name}
              placeholder="학생 이름"
              className="border-eo-border"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-eo-text-secondary">
              영어이름
            </label>
            <Input
              name="english_name"
              defaultValue={student.english_name ?? ""}
              placeholder="English Name"
              className="border-eo-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-secondary">
                연락처
              </label>
              <Input
                name="phone"
                defaultValue={student.phone ?? ""}
                placeholder="010-0000-0000"
                className="border-eo-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-secondary">
                학부모연락처
              </label>
              <Input
                name="parent_phone"
                defaultValue={student.parent_phone ?? ""}
                placeholder="010-0000-0000"
                className="border-eo-border"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-secondary">
                학교
              </label>
              <Input
                name="school"
                defaultValue={student.school ?? ""}
                placeholder="학교명"
                className="border-eo-border"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-eo-text-secondary">
                학년
              </label>
              <Input
                name="grade"
                defaultValue={student.grade ?? ""}
                placeholder="예: 중1"
                className="border-eo-border"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-eo-text-secondary">
              메모
            </label>
            <textarea
              name="memo"
              rows={3}
              defaultValue={student.memo ?? ""}
              placeholder="메모를 입력하세요"
              className="flex w-full rounded-md border border-eo-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-eo-border text-eo-primary focus:ring-eo-primary"
              />
              <span className="text-sm font-medium text-eo-text-secondary">
                재원 (체크 해제 시 퇴원 처리)
              </span>
            </label>
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
              className="bg-eo-primary hover:bg-eo-primary-hover text-white"
            >
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
