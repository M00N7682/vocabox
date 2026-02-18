"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAssignment } from "@/lib/actions/assignments";

type Props = {
  subjects: { id: string; name: string }[];
};

export function AssignmentAddButton({ subjects }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      await createAssignment(formData);
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
        과제 추가
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-[520px] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form action={handleSubmit}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
                <h2 className="text-lg font-bold text-eo-text-primary">
                  과제 추가
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
                    과제명 *
                  </label>
                  <Input
                    name="title"
                    placeholder="과제 제목을 입력하세요"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
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
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      마감일 *
                    </label>
                    <Input type="date" name="due_date" required />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    설명
                  </label>
                  <Input name="description" placeholder="과제에 대한 설명" />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      제출 방식
                    </label>
                    <select
                      name="submission_type"
                      defaultValue="check"
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="check">체크</option>
                      <option value="photo">사진</option>
                      <option value="file">파일</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      난이도
                    </label>
                    <select
                      name="difficulty"
                      defaultValue=""
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="">미지정</option>
                      <option value="easy">하</option>
                      <option value="medium">중</option>
                      <option value="hard">상</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_required"
                    value="true"
                    defaultChecked
                    id="assignment_is_required"
                  />
                  <label
                    htmlFor="assignment_is_required"
                    className="text-sm text-eo-text-primary"
                  >
                    필수 과제
                  </label>
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
