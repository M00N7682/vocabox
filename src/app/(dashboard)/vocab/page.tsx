import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { getVocabBooks } from "@/lib/actions/vocab";
import { AddBookDialog } from "@/components/vocab/add-book-dialog";
import Link from "next/link";

export default async function VocabPage() {
  const books = await getVocabBooks();

  return (
    <>
      <Header title="단어장" />
      <div className="flex flex-col gap-6 p-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-vb-text-primary">
            전체 단어장
          </h2>
          <AddBookDialog />
        </div>

        {/* Card Grid */}
        {books.length === 0 ? (
          <div className="bg-white rounded-xl border border-vb-border p-12 text-center">
            <p className="text-sm text-vb-text-tertiary">
              등록된 단어장이 없습니다. 단어장을 추가해주세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {books.map((book) => (
              <Link key={book.id} href={`/vocab/${book.id}`}>
                <div className="bg-white rounded-xl border border-vb-border p-6 cursor-pointer hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-vb-text-primary">
                      {book.title}
                    </h3>
                    <Badge className="bg-vb-info-light text-vb-info border-0 text-xs">
                      {book.word_count}단어
                    </Badge>
                  </div>
                  <p className="text-sm text-vb-text-secondary mb-4">
                    {book.description || "설명 없음"}
                  </p>
                  <span className="text-xs text-vb-text-tertiary">
                    등록일: {book.created_at.split("T")[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
