import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { getTemplates } from "@/lib/actions/assessments";
import { getSubjects } from "@/lib/actions/subjects";
import { FilterDropdown } from "@/components/shared/filter-dropdown";
import { TemplatesClient } from "./templates-client";

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;

  const [templates, subjects] = await Promise.all([
    getTemplates({
      subjectId: subject || undefined,
    }),
    getSubjects(),
  ]);

  const subjectOptions = subjects.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  return (
    <div className="flex flex-col gap-7 p-10 flex-1 overflow-auto">
      <PageHeader
        title="반복 평가 템플릿"
        description="주기적으로 반복되는 평가 템플릿을 관리합니다."
      />

      <div className="flex items-center justify-between">
        <Suspense>
          <FilterDropdown
            paramKey="subject"
            label="과목"
            allLabel="과목: 전체"
            options={subjectOptions}
          />
        </Suspense>
      </div>

      <TemplatesClient
        templates={templates}
        subjects={subjects.map((s) => ({ id: s.id, name: s.name }))}
      />
    </div>
  );
}
