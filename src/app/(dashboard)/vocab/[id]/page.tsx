import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { getVocabBook, getVocabWords } from "@/lib/actions/vocab";
import { notFound } from "next/navigation";

export default async function VocabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let book;
  try {
    book = await getVocabBook(id);
  } catch {
    notFound();
  }

  const words = await getVocabWords(id);

  return (
    <>
      <Header title="단어장 상세" />
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
            <Button className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2 text-[13px] h-9">
              <Plus className="w-4 h-4" />
              단어 추가
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-[13px]"
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
                        <button className="text-vb-text-tertiary hover:text-vb-text-secondary">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button className="text-vb-text-tertiary hover:text-vb-danger">
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
      </div>
    </>
  );
}
