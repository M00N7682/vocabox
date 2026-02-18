"use client";

import { useState, useTransition } from "react";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createChapter } from "@/lib/actions/textbooks";
import type { ChapterWithChildren, TextbookWithSubject } from "@/lib/actions/textbooks";

type Props = {
  textbooks: TextbookWithSubject[];
  chaptersMap: Record<string, ChapterWithChildren[]>;
};

const statusConfig: Record<string, { color: string; dotColor: string }> = {
  완료: { color: "text-eo-success", dotColor: "bg-eo-success" },
  진행중: { color: "text-eo-primary", dotColor: "bg-eo-primary" },
  미진행: { color: "text-eo-text-secondary", dotColor: "bg-[#E5E7EB]" },
};

export function TextbooksClient({ textbooks, chaptersMap }: Props) {
  const [activeId, setActiveId] = useState<string>(textbooks[0]?.id ?? "");
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeTextbook = textbooks.find((t) => t.id === activeId);
  const chapters = chaptersMap[activeId] ?? [];

  const filteredTextbooks = searchQuery
    ? textbooks.filter((t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : textbooks;

  function toggleExpand(id: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function getProgress(chs: ChapterWithChildren[]): { completed: number; total: number } {
    let completed = 0;
    let total = 0;
    for (const ch of chs) {
      if (ch.children && ch.children.length > 0) {
        const sub = getProgress(ch.children);
        completed += sub.completed;
        total += sub.total;
      } else {
        total++;
        if (ch.status === "완료") completed++;
      }
    }
    return { completed, total };
  }

  const overallProgress = getProgress(chapters);
  const progressPct =
    overallProgress.total > 0
      ? Math.round((overallProgress.completed / overallProgress.total) * 100)
      : 0;

  return (
    <div className="flex gap-6 flex-1">
      {/* Left: Textbook List */}
      <div className="flex flex-col gap-3 w-[360px] shrink-0">
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-white border border-eo-border">
          <Search className="w-4 h-4 text-eo-placeholder" />
          <input
            type="text"
            placeholder="교재명 검색..."
            className="text-sm bg-transparent outline-none flex-1 text-eo-text-primary placeholder:text-eo-placeholder"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {filteredTextbooks.map((tb) => {
          const isActive = tb.id === activeId;
          const subjectColor = tb.subjects?.color ?? "#6B7280";
          const tbProgress = chaptersMap[tb.id] ? getProgress(chaptersMap[tb.id]) : { completed: 0, total: 0 };
          const tbPct = tbProgress.total > 0 ? Math.round((tbProgress.completed / tbProgress.total) * 100) : 0;

          return (
            <div
              key={tb.id}
              onClick={() => setActiveId(tb.id)}
              className={`flex flex-col gap-2 p-4 rounded-xl cursor-pointer ${
                isActive
                  ? "bg-eo-primary border-2 border-eo-primary"
                  : "bg-white border border-eo-border hover:border-eo-border-strong"
              }`}
            >
              <span className={`text-sm font-semibold ${isActive ? "text-white" : "text-eo-text-primary"}`}>
                {tb.name}
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    isActive ? "bg-white/20 text-white" : ""
                  }`}
                  style={
                    !isActive
                      ? { backgroundColor: `${subjectColor}20`, color: subjectColor }
                      : undefined
                  }
                >
                  {tb.subjects?.name ?? "-"}
                </span>
                <span className={`text-xs ${isActive ? "text-white/70" : "text-eo-text-secondary"}`}>
                  {tb.year} · {tb.grade ?? "-"}
                </span>
                <span className={`text-xs font-semibold ${isActive ? "text-white" : "text-eo-primary"}`}>
                  진도 {tbPct}%
                </span>
              </div>
            </div>
          );
        })}

        {filteredTextbooks.length === 0 && (
          <span className="text-sm text-eo-text-secondary text-center py-4">교재가 없습니다.</span>
        )}
      </div>

      {/* Right: Chapter Tree */}
      <div className="flex flex-col gap-4 p-6 bg-white rounded-xl border border-eo-border flex-1">
        {activeTextbook ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-base font-bold text-eo-text-primary">{activeTextbook.name}</span>
                <span className="text-[13px] text-eo-text-secondary">
                  {activeTextbook.subjects?.name ?? "-"} · {activeTextbook.year} · {activeTextbook.grade ?? "-"} · 전체 {overallProgress.total}단원
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setChapterDialogOpen(true)}>단원 추가</Button>
            </div>

            <div className="h-px bg-eo-border" />

            <div className="flex flex-col">
              {chapters.map((ch) => {
                const isExpanded = expandedChapters.has(ch.id);
                const chProgress = getProgress(ch.children ?? []);
                const chPct = chProgress.total > 0
                  ? Math.round((chProgress.completed / chProgress.total) * 100)
                  : 0;

                return (
                  <div key={ch.id} className="flex flex-col">
                    <div
                      className="flex items-center gap-2 py-2.5 cursor-pointer"
                      onClick={() => toggleExpand(ch.id)}
                    >
                      {ch.children && ch.children.length > 0 ? (
                        isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-eo-text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-eo-text-secondary" />
                        )
                      ) : (
                        <div className="w-4" />
                      )}
                      <span className="text-sm font-semibold text-eo-text-primary">{ch.title}</span>
                      <span className="text-xs text-eo-text-secondary">
                        {chProgress.completed}/{chProgress.total} 완료
                      </span>
                      <div className="w-[100px] h-1 rounded-full bg-[#E5E7EB] ml-2">
                        <div
                          className="h-full rounded-full bg-eo-primary"
                          style={{ width: `${chPct}%` }}
                        />
                      </div>
                    </div>
                    {isExpanded &&
                      ch.children?.map((sub) => {
                        const cfg = statusConfig[sub.status] ?? statusConfig["미진행"];
                        return (
                          <div key={sub.id} className="flex items-center gap-2 py-2 pl-8">
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                            <span
                              className={`text-[13px] ${
                                sub.status === "진행중"
                                  ? "font-medium text-eo-primary"
                                  : sub.status === "미진행"
                                    ? "text-eo-text-secondary"
                                    : "text-eo-text-primary"
                              }`}
                            >
                              {sub.title}
                            </span>
                            <span className={`text-[11px] ml-auto ${cfg.color}`}>{sub.status}</span>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
              {chapters.length === 0 && (
                <span className="text-sm text-eo-text-secondary py-4">단원이 없습니다.</span>
              )}
            </div>
          </>
        ) : (
          <span className="text-sm text-eo-text-secondary">교재를 선택해주세요.</span>
        )}
      </div>

      {chapterDialogOpen && activeTextbook && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setChapterDialogOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-[440px] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              action={(formData) => {
                startTransition(async () => {
                  await createChapter(formData);
                  setChapterDialogOpen(false);
                });
              }}
            >
              <input type="hidden" name="textbook_id" value={activeTextbook.id} />

              <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
                <h2 className="text-lg font-bold text-eo-text-primary">
                  단원 추가
                </h2>
                <button
                  type="button"
                  onClick={() => setChapterDialogOpen(false)}
                  className="text-eo-text-secondary hover:text-eo-text-primary"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col gap-4 px-6 py-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    단원명 *
                  </label>
                  <Input
                    name="title"
                    placeholder="단원 제목을 입력하세요"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      단계
                    </label>
                    <select
                      name="level"
                      defaultValue="major"
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="major">대단원</option>
                      <option value="middle">중단원</option>
                      <option value="minor">소단원</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-sm font-medium text-eo-text-primary">
                      상위 단원
                    </label>
                    <select
                      name="parent_chapter_id"
                      defaultValue=""
                      className="h-10 px-3 rounded-lg border border-eo-border text-sm"
                    >
                      <option value="">없음 (최상위)</option>
                      {chapters.map((ch) => (
                        <option key={ch.id} value={ch.id}>
                          {ch.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-eo-text-primary">
                    정렬 순서
                  </label>
                  <Input
                    type="number"
                    name="sort_order"
                    defaultValue={chapters.length}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end px-6 py-4 border-t border-eo-border gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChapterDialogOpen(false)}
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
    </div>
  );
}
