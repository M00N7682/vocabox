"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
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
import {
  addWord,
  updateVocabBook,
  updateWord,
  deleteWord,
} from "@/lib/actions/vocab";
import type { VocabBook, VocabWord } from "@/types/database";

interface VocabDetailClientProps {
  book: VocabBook;
  words: VocabWord[];
}

export function VocabDetailClient({ book, words }: VocabDetailClientProps) {
  const router = useRouter();

  // Add word dialog state
  const [addWordOpen, setAddWordOpen] = useState(false);
  const [addWordLoading, setAddWordLoading] = useState(false);
  const [addWordError, setAddWordError] = useState<string | null>(null);

  // Edit book dialog state
  const [editBookOpen, setEditBookOpen] = useState(false);
  const [editBookLoading, setEditBookLoading] = useState(false);
  const [editBookError, setEditBookError] = useState<string | null>(null);

  // Edit word dialog state
  const [editWordOpen, setEditWordOpen] = useState(false);
  const [editWordLoading, setEditWordLoading] = useState(false);
  const [editWordError, setEditWordError] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<VocabWord | null>(null);

  // Delete loading state
  const [deletingWordId, setDeletingWordId] = useState<string | null>(null);

  // --- Add Word ---
  async function handleAddWord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddWordLoading(true);
    setAddWordError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const english = (formData.get("english") as string).trim();
    const korean = (formData.get("korean") as string).trim();

    if (!english || !korean) {
      setAddWordError("영어와 한글을 모두 입력해주세요.");
      setAddWordLoading(false);
      return;
    }

    const result = await addWord(book.id, english, korean);

    if (result.error) {
      setAddWordError(result.error);
      setAddWordLoading(false);
      return;
    }

    setAddWordOpen(false);
    form.reset();
    router.refresh();
    setAddWordLoading(false);
  }

  // --- Edit Book ---
  async function handleEditBook(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEditBookLoading(true);
    setEditBookError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = (formData.get("title") as string).trim();

    if (!title) {
      setEditBookError("단어장 이름을 입력해주세요.");
      setEditBookLoading(false);
      return;
    }

    const result = await updateVocabBook(book.id, formData);

    if (result.error) {
      setEditBookError(result.error);
      setEditBookLoading(false);
      return;
    }

    setEditBookOpen(false);
    router.refresh();
    setEditBookLoading(false);
  }

  // --- Edit Word ---
  function openEditWord(word: VocabWord) {
    setEditingWord(word);
    setEditWordError(null);
    setEditWordOpen(true);
  }

  async function handleEditWord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingWord) return;

    setEditWordLoading(true);
    setEditWordError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const english = (formData.get("english") as string).trim();
    const korean = (formData.get("korean") as string).trim();

    if (!english || !korean) {
      setEditWordError("영어와 한글을 모두 입력해주세요.");
      setEditWordLoading(false);
      return;
    }

    const result = await updateWord(editingWord.id, english, korean);

    if (result.error) {
      setEditWordError(result.error);
      setEditWordLoading(false);
      return;
    }

    setEditWordOpen(false);
    setEditingWord(null);
    router.refresh();
    setEditWordLoading(false);
  }

  // --- Delete Word ---
  async function handleDeleteWord(word: VocabWord) {
    const confirmed = window.confirm(
      `"${word.english}" 단어를 삭제하시겠습니까?`
    );
    if (!confirmed) return;

    setDeletingWordId(word.id);

    const result = await deleteWord(word.id, book.id);

    if (result.error) {
      alert(result.error);
    }

    setDeletingWordId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/vocab">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-[13px]"
            >
              <ArrowLeft className="w-4 h-4" />
              뒤로
            </Button>
          </Link>
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold text-vb-text-primary">
              {book.title}
            </h2>
            <span className="text-[13px] text-vb-text-secondary">
              총 {book.word_count}개 단어
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2 text-[13px] h-9"
            onClick={() => {
              setAddWordError(null);
              setAddWordOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            단어 추가
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-[13px]"
            onClick={() => {
              setEditBookError(null);
              setEditBookOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
            편집
          </Button>
        </div>
      </div>

      {/* Word Table */}
      <div className="bg-white rounded-xl border border-vb-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-vb-bg-muted">
              <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary w-[50px]">
                #
              </th>
              <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                영어
              </th>
              <th className="text-left px-5 py-3 text-[13px] font-semibold text-vb-text-secondary">
                한글
              </th>
              <th className="text-right px-5 py-3 text-[13px] font-semibold text-vb-text-secondary w-[80px]">
                액션
              </th>
            </tr>
          </thead>
          <tbody>
            {words.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-sm text-vb-text-tertiary"
                >
                  등록된 단어가 없습니다.
                </td>
              </tr>
            ) : (
              words.map((w) => (
                <tr key={w.id} className="border-t border-vb-border">
                  <td className="px-5 py-3 text-sm text-vb-text-tertiary">
                    {w.sort_order}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-vb-text-primary">
                    {w.english}
                  </td>
                  <td className="px-5 py-3 text-sm text-vb-text-secondary">
                    {w.korean}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-vb-text-tertiary hover:text-vb-text-secondary"
                        onClick={() => openEditWord(w)}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        className="text-vb-text-tertiary hover:text-vb-danger disabled:opacity-50"
                        onClick={() => handleDeleteWord(w)}
                        disabled={deletingWordId === w.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Word Dialog */}
      <Dialog open={addWordOpen} onOpenChange={setAddWordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>단어 추가</DialogTitle>
            <DialogDescription>
              영어 단어와 한글 뜻을 입력해주세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddWord} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="add-word-english"
                className="text-sm font-medium text-vb-text-primary"
              >
                영어 <span className="text-red-500">*</span>
              </label>
              <Input
                id="add-word-english"
                name="english"
                placeholder="영어 단어를 입력하세요"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="add-word-korean"
                className="text-sm font-medium text-vb-text-primary"
              >
                한글 <span className="text-red-500">*</span>
              </label>
              <Input
                id="add-word-korean"
                name="korean"
                placeholder="한글 뜻을 입력하세요"
                required
              />
            </div>

            {addWordError && (
              <p className="text-sm text-red-500">{addWordError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddWordOpen(false)}
                disabled={addWordLoading}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-vb-primary hover:bg-vb-primary-hover text-white"
                disabled={addWordLoading}
              >
                {addWordLoading ? "추가 중..." : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Book Dialog */}
      <Dialog open={editBookOpen} onOpenChange={setEditBookOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>단어장 편집</DialogTitle>
            <DialogDescription>
              단어장의 이름과 설명을 수정해주세요.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditBook} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-book-title"
                className="text-sm font-medium text-vb-text-primary"
              >
                이름 <span className="text-red-500">*</span>
              </label>
              <Input
                id="edit-book-title"
                name="title"
                defaultValue={book.title}
                placeholder="단어장 이름을 입력하세요"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="edit-book-desc"
                className="text-sm font-medium text-vb-text-primary"
              >
                설명
              </label>
              <Input
                id="edit-book-desc"
                name="description"
                defaultValue={book.description ?? ""}
                placeholder="설명을 입력하세요 (선택)"
              />
            </div>

            {editBookError && (
              <p className="text-sm text-red-500">{editBookError}</p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditBookOpen(false)}
                disabled={editBookLoading}
              >
                취소
              </Button>
              <Button
                type="submit"
                className="bg-vb-primary hover:bg-vb-primary-hover text-white"
                disabled={editBookLoading}
              >
                {editBookLoading ? "저장 중..." : "저장"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Word Dialog */}
      <Dialog
        open={editWordOpen}
        onOpenChange={(nextOpen) => {
          setEditWordOpen(nextOpen);
          if (!nextOpen) setEditingWord(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>단어 편집</DialogTitle>
            <DialogDescription>
              영어 단어와 한글 뜻을 수정해주세요.
            </DialogDescription>
          </DialogHeader>

          {editingWord && (
            <form onSubmit={handleEditWord} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-word-english"
                  className="text-sm font-medium text-vb-text-primary"
                >
                  영어 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-word-english"
                  name="english"
                  defaultValue={editingWord.english}
                  placeholder="영어 단어를 입력하세요"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="edit-word-korean"
                  className="text-sm font-medium text-vb-text-primary"
                >
                  한글 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="edit-word-korean"
                  name="korean"
                  defaultValue={editingWord.korean}
                  placeholder="한글 뜻을 입력하세요"
                  required
                />
              </div>

              {editWordError && (
                <p className="text-sm text-red-500">{editWordError}</p>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditWordOpen(false)}
                  disabled={editWordLoading}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  className="bg-vb-primary hover:bg-vb-primary-hover text-white"
                  disabled={editWordLoading}
                >
                  {editWordLoading ? "저장 중..." : "저장"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
