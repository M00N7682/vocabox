"use client";

import { useState, useTransition, useEffect } from "react";
import { Plus, X, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import { linkTextbookToClass, unlinkTextbookFromClass } from "@/lib/actions/textbooks";
import { updateChapterStatus } from "@/lib/actions/textbooks";

type TextbookItem = { id: string; name: string; year: number | null; grade: string | null; subjects?: { name: string } | null };
type ChapterItem = { id: string; title: string; status: string; children?: ChapterItem[] };

type Props = {
  classId: string;
  linkedTextbooks: TextbookItem[];
  chaptersMap: Record<string, ChapterItem[]>;
};

const statusConfig: Record<string, { color: string; dotColor: string }> = {
  완료: { color: "text-eo-success", dotColor: "bg-eo-success" },
  진행중: { color: "text-eo-primary", dotColor: "bg-eo-primary" },
  미진행: { color: "text-eo-text-secondary", dotColor: "bg-[#E5E7EB]" },
};

export function ClassTextbooksTab({ classId, linkedTextbooks, chaptersMap }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [activeTextbookId, setActiveTextbookId] = useState<string>(linkedTextbooks[0]?.id ?? "");

  function toggleExpand(id: string) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function getProgress(chs: ChapterItem[]): { completed: number; total: number } {
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

  const activeTextbook = linkedTextbooks.find((t) => t.id === activeTextbookId);
  const chapters = chaptersMap[activeTextbookId] ?? [];
  const progress = getProgress(chapters);
  const progressPct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-eo-text-primary">
          연결된 교재 ({linkedTextbooks.length}개)
        </span>
        <button
          onClick={() => setShowLinkDialog(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-eo-primary hover:bg-[#4338CA] rounded-lg"
        >
          <Plus className="w-4 h-4" />
          교재 연결
        </button>
      </div>

      {linkedTextbooks.length > 0 ? (
        <div className="flex gap-4">
          {/* Textbook sidebar */}
          <div className="flex flex-col gap-2 w-[240px] shrink-0">
            {linkedTextbooks.map((tb) => {
              const isActive = tb.id === activeTextbookId;
              const tbChapters = chaptersMap[tb.id] ?? [];
              const tbProgress = getProgress(tbChapters);
              const tbPct = tbProgress.total > 0 ? Math.round((tbProgress.completed / tbProgress.total) * 100) : 0;
              return (
                <div
                  key={tb.id}
                  onClick={() => setActiveTextbookId(tb.id)}
                  className={`flex flex-col gap-1 p-3 rounded-lg cursor-pointer ${
                    isActive ? "bg-eo-primary text-white" : "bg-white border border-eo-border hover:border-eo-border-strong"
                  }`}
                >
                  <span className={`text-sm font-medium ${isActive ? "text-white" : "text-eo-text-primary"}`}>
                    {tb.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isActive ? "text-white/70" : "text-eo-text-secondary"}`}>
                      진도 {tbPct}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`"${tb.name}" 교재 연결을 해제하시겠습니까?`)) {
                          startTransition(async () => {
                            await unlinkTextbookFromClass(classId, tb.id);
                          });
                        }
                      }}
                      className={`ml-auto text-xs ${isActive ? "text-white/60 hover:text-white" : "text-eo-text-tertiary hover:text-eo-danger"}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chapter tree */}
          <div className="flex-1 bg-white rounded-xl border border-eo-border p-5">
            {activeTextbook ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-eo-text-primary">{activeTextbook.name}</span>
                  <span className="text-sm text-eo-text-secondary">
                    {progress.completed}/{progress.total} 완료 ({progressPct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#E5E7EB]">
                  <div className="h-full rounded-full bg-eo-primary transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="flex flex-col mt-2">
                  {chapters.map((ch) => {
                    const isExpanded = expandedChapters.has(ch.id);
                    const chProgress = getProgress(ch.children ?? []);
                    return (
                      <div key={ch.id}>
                        <div
                          className="flex items-center gap-2 py-2 cursor-pointer"
                          onClick={() => toggleExpand(ch.id)}
                        >
                          {(ch.children?.length ?? 0) > 0 ? (
                            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 text-eo-text-secondary" />
                          ) : (
                            <div className="w-4" />
                          )}
                          <span className="text-sm font-semibold text-eo-text-primary">{ch.title}</span>
                          <span className="text-xs text-eo-text-secondary">
                            {chProgress.completed}/{chProgress.total} 완료
                          </span>
                        </div>
                        {isExpanded && ch.children?.map((sub) => {
                          const cfg = statusConfig[sub.status] ?? statusConfig["미진행"];
                          const nextStatus = sub.status === "미진행" ? "진행중" : sub.status === "진행중" ? "완료" : "미진행";
                          return (
                            <div key={sub.id} className="flex items-center gap-2 py-1.5 pl-8">
                              <div className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
                              <span className={`text-[13px] flex-1 ${
                                sub.status === "진행중" ? "font-medium text-eo-primary" : sub.status === "미진행" ? "text-eo-text-secondary" : "text-eo-text-primary"
                              }`}>
                                {sub.title}
                              </span>
                              <button
                                onClick={() => startTransition(async () => {
                                  await updateChapterStatus(sub.id, nextStatus as "완료" | "진행중" | "미진행");
                                })}
                                disabled={isPending}
                                className={`text-[11px] cursor-pointer hover:underline ${cfg.color}`}
                              >
                                {sub.status}
                              </button>
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
              </div>
            ) : (
              <span className="text-sm text-eo-text-secondary">교재를 선택해주세요.</span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 gap-3 bg-white rounded-xl border border-eo-border">
          <BookOpen className="w-8 h-8 text-eo-text-tertiary" />
          <span className="text-sm text-eo-text-secondary">연결된 교재가 없습니다.</span>
          <span className="text-xs text-eo-text-tertiary">
            &quot;교재 연결&quot; 버튼으로 이 반에서 사용할 교재를 연결하세요.
          </span>
        </div>
      )}

      {/* Link Textbook Dialog */}
      {showLinkDialog && (
        <LinkTextbookDialog
          classId={classId}
          linkedIds={new Set(linkedTextbooks.map((t) => t.id))}
          onClose={() => setShowLinkDialog(false)}
        />
      )}
    </div>
  );
}

function LinkTextbookDialog({
  classId,
  linkedIds,
  onClose,
}: {
  classId: string;
  linkedIds: Set<string>;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [textbooks, setTextbooks] = useState<TextbookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/textbooks")
      .then((r) => r.json())
      .then((data) => {
        setTextbooks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const available = textbooks.filter((t) => !linkedIds.has(t.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl w-[480px] max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-eo-border">
          <h2 className="text-lg font-bold text-eo-text-primary">교재 연결</h2>
          <button onClick={onClose} className="text-eo-text-secondary hover:text-eo-text-primary">&times;</button>
        </div>
        <div className="flex flex-col gap-2 px-6 py-5">
          {loading ? (
            <span className="text-sm text-eo-text-secondary">로딩중...</span>
          ) : available.length > 0 ? (
            available.map((tb) => (
              <button
                key={tb.id}
                onClick={() => {
                  startTransition(async () => {
                    await linkTextbookToClass(classId, tb.id);
                    onClose();
                  });
                }}
                disabled={isPending}
                className="flex items-center gap-3 p-3 rounded-lg border border-eo-border hover:border-eo-primary hover:bg-eo-bg-page/50 text-left"
              >
                <BookOpen className="w-4 h-4 text-eo-text-secondary" />
                <div className="flex flex-col gap-0.5 flex-1">
                  <span className="text-sm font-medium text-eo-text-primary">{tb.name}</span>
                  <span className="text-xs text-eo-text-secondary">
                    {tb.subjects?.name ?? "-"} · {tb.year} · {tb.grade ?? "-"}
                  </span>
                </div>
              </button>
            ))
          ) : (
            <span className="text-sm text-eo-text-secondary py-4">연결 가능한 교재가 없습니다.</span>
          )}
        </div>
      </div>
    </div>
  );
}
