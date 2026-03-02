"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createTextbook } from "@/lib/actions/textbooks";
import { usePdfUpload } from "@/lib/hooks/use-pdf-upload";

type Props = {
  subjects: { id: string; name: string }[];
  academyId: string;
};

export function TextbookAddButton({ subjects, academyId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdf = usePdfUpload(academyId);

  function handleSubmit(formData: FormData) {
    if (pdf.storagePath) {
      formData.set("pdf_url", pdf.storagePath);
    }
    startTransition(async () => {
      await createTextbook(formData);
      pdf.reset();
      setOpen(false);
    });
  }

  async function handleClose() {
    // Clean up uploaded file if dialog is closed without saving
    if (pdf.storagePath) {
      await pdf.remove();
    }
    pdf.reset();
    setOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      pdf.upload(file);
    }
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
          onClick={handleClose}
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
                  onClick={handleClose}
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

                {/* PDF Upload */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    교재 PDF
                  </label>

                  {pdf.status === "idle" && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-2 h-20 rounded-lg border-2 border-dashed border-eo-border hover:border-eo-primary hover:bg-eo-primary/5 transition-colors text-sm text-eo-text-secondary"
                    >
                      <FileText className="w-5 h-5" />
                      PDF 파일을 선택하세요 (최대 50MB)
                    </button>
                  )}

                  {pdf.status === "uploading" && (
                    <div className="flex items-center gap-3 h-12 px-4 rounded-lg bg-eo-primary/5 border border-eo-primary/20">
                      <Loader2 className="w-4 h-4 text-eo-primary animate-spin" />
                      <span className="text-sm text-eo-primary">업로드 중...</span>
                    </div>
                  )}

                  {pdf.status === "done" && (
                    <div className="flex items-center gap-3 h-12 px-4 rounded-lg bg-green-50 border border-green-200">
                      <FileText className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 truncate flex-1">
                        {pdf.fileName}
                      </span>
                      <button
                        type="button"
                        onClick={() => pdf.remove()}
                        className="text-green-600 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {pdf.status === "error" && (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3 h-12 px-4 rounded-lg bg-red-50 border border-red-200">
                        <span className="text-sm text-red-600 flex-1">{pdf.error}</span>
                        <button
                          type="button"
                          onClick={() => {
                            pdf.reset();
                            fileInputRef.current?.click();
                          }}
                          className="text-sm text-red-600 underline hover:text-red-800"
                        >
                          다시 시도
                        </button>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-eo-border gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                >
                  취소
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || pdf.status === "uploading"}
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
