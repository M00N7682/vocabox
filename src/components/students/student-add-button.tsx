"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStudent } from "@/lib/actions/students";

export function StudentAddButton() {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createStudent(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(null);
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        학생 추가
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form action={handleSubmit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
                <h2 className="text-lg font-bold text-eo-text-primary">
                  학생 추가
                </h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
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
                    이름 *
                  </label>
                  <Input name="name" placeholder="학생 이름" required />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    영문 이름
                  </label>
                  <Input name="english_name" placeholder="English name" />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      학교
                    </label>
                    <Input name="school" placeholder="학교명" />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      학년
                    </label>
                    <Input name="grade" placeholder="예: 중2" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      연락처
                    </label>
                    <Input name="phone" placeholder="010-0000-0000" />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      학부모 연락처
                    </label>
                    <Input name="parent_phone" placeholder="010-0000-0000" />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    PIN 코드
                  </label>
                  <Input
                    name="pin_code"
                    placeholder="출결용 PIN 코드 (4자리)"
                    maxLength={4}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    메모
                  </label>
                  <Input name="memo" placeholder="특이사항 메모" />
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-eo-border gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-eo-primary hover:bg-[#4338CA] text-white"
                >
                  {isPending ? "저장중..." : "추가"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
