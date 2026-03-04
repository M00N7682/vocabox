import { PageHeader } from "@/components/shared/page-header";
import { getTextbooks, getTextbookChapters } from "@/lib/actions/textbooks";
import { getSubjects } from "@/lib/actions/subjects";
import { TextbooksClient } from "@/components/textbooks/textbooks-client";
import { TextbookAddButton } from "@/components/textbooks/textbook-add-button";
import { createClient } from "@/lib/supabase/server";
import type { ChapterWithChildren } from "@/lib/actions/textbooks";

export default async function TextbooksPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("academy_id")
    .single();

  const [textbooks, subjects] = await Promise.all([
    getTextbooks(),
    getSubjects({ isActive: true }),
  ]);

  // Fetch chapters for all textbooks in parallel
  const chaptersEntries = await Promise.all(
    textbooks.map(async (tb) => {
      const chapters = await getTextbookChapters(tb.id);
      return [tb.id, chapters] as [string, ChapterWithChildren[]];
    })
  );
  const chaptersMap = Object.fromEntries(chaptersEntries);

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader title="교재/단원 관리" description="교재별 단원 구성과 진도를 관리합니다">
        <TextbookAddButton
          subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
          academyId={profile?.academy_id ?? ""}
        />
      </PageHeader>

      {textbooks.length > 0 ? (
        <TextbooksClient
          textbooks={textbooks}
          chaptersMap={chaptersMap}
          subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
        />
      ) : (
        <div className="flex items-center justify-center py-20 text-sm text-eo-text-secondary">
          등록된 교재가 없습니다. 교재를 추가해주세요.
        </div>
      )}
    </div>
  );
}
