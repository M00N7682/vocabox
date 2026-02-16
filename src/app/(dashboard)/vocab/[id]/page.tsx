import { Header } from "@/components/layout/header";
import { getVocabBook, getVocabWords } from "@/lib/actions/vocab";
import { VocabDetailClient } from "@/components/vocab/vocab-detail-client";
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
      <VocabDetailClient book={book} words={words} />
    </>
  );
}
