"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { createVocabBook } from "@/lib/actions/vocab";

export function AddBookDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const title = formData.get("title") as string;
    if (!title.trim()) {
      setError("단어장 이름을 입력해주세요.");
      setLoading(false);
      return;
    }

    const result = await createVocabBook(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success && result.id) {
      setOpen(false);
      router.push(`/vocab/${result.id}`);
    }

    setLoading(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        className="bg-eo-primary hover:bg-eo-primary-hover text-white gap-2"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        단어장 추가
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>단어장 추가</DialogTitle>
          <DialogDescription>
            새로운 단어장의 이름과 설명을 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="add-book-title"
              className="text-sm font-medium text-eo-text-primary"
            >
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="add-book-title"
              name="title"
              placeholder="단어장 이름을 입력하세요"
              required
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="add-book-desc"
              className="text-sm font-medium text-eo-text-primary"
            >
              설명
            </label>
            <Input
              id="add-book-desc"
              name="description"
              placeholder="설명을 입력하세요 (선택)"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="bg-eo-primary hover:bg-eo-primary-hover text-white"
              disabled={loading}
            >
              {loading ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
