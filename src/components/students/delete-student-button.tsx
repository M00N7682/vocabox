"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteStudent } from "@/lib/actions/students";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DeleteStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteStudent(studentId);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/students");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
        삭제
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-eo-text-primary">
              학생 삭제
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <p className="text-sm text-eo-text-secondary">
              <span className="font-semibold text-eo-text-primary">{studentName}</span> 학생을 삭제하시겠습니까?
            </p>
            <p className="text-xs text-red-500">
              성적, 출결, 과제 등 모든 관련 데이터가 영구적으로 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </p>
            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-md">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isPending ? "삭제 중..." : "삭제"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
