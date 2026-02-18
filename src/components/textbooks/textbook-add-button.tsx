"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTextbook } from "@/lib/actions/textbooks";

type Props = {
  subjects: { id: string; name: string }[];
};

export function TextbookAddButton({ subjects }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createTextbook(formData);
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-eo-primary hover:bg-[#4338CA] text-white gap-2"
      >
        <Plus className="w-4 h-4" />
        교재 추가
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
                  교재 추가
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    교재명 *
                  </label>
                  <Input
                    name="name"
                    placeholder="교재 이름을 입력하세요"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    과목 *
                  </label>
                  <select
                    name="subject_id"
                    className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    required
                  >
                    <option value="">선택</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      출판 연도
                    </label>
                    <Input
                      type="number"
                      name="year"
                      defaultValue={new Date().getFullYear()}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      학년/수준
                    </label>
                    <Input name="grade" placeholder="예: 중2" />
                  </div>
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
