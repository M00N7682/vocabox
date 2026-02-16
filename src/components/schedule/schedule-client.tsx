"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  createSchedule,
  updateScheduleStatus,
  deleteSchedule,
} from "@/lib/actions/schedules";
import type { ScheduleWithRelations } from "@/lib/actions/schedules";

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

const statusColors: Record<string, string> = {
  scheduled: "bg-vb-primary",
  in_progress: "bg-vb-warning",
  completed: "bg-vb-success",
  missed: "bg-vb-danger",
};

const statusLabels: Record<string, string> = {
  scheduled: "예정",
  in_progress: "진행 중",
  completed: "완료",
  missed: "미완료",
};

const statusBadgeColors: Record<string, string> = {
  scheduled: "bg-vb-primary/10 text-vb-primary",
  in_progress: "bg-vb-warning/10 text-vb-warning",
  completed: "bg-vb-success/10 text-vb-success",
  missed: "bg-vb-danger/10 text-vb-danger",
};

interface ScheduleClientProps {
  schedules: ScheduleWithRelations[];
  month: string;
  year: number;
  mon: number;
  prevMonth: string;
  nextMonth: string;
}

interface StudentOption {
  id: string;
  name: string;
}

interface BookOption {
  id: string;
  title: string;
}

export function ScheduleClient({
  schedules,
  month,
  year,
  mon,
  prevMonth,
  nextMonth,
}: ScheduleClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Assign task dialog state
  const [assignOpen, setAssignOpen] = useState(false);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [books, setBooks] = useState<BookOption[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [note, setNote] = useState("");
  const [assignError, setAssignError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Day detail dialog state
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Fetch students and books when assign dialog opens
  useEffect(() => {
    if (!assignOpen) return;

    const supabase = createClient();

    async function fetchOptions() {
      const [studentsRes, booksRes] = await Promise.all([
        supabase.from("students").select("id, name").eq("is_active", true),
        supabase.from("vocab_books").select("id, title"),
      ]);

      if (studentsRes.data) {
        setStudents(studentsRes.data);
      }
      if (booksRes.data) {
        setBooks(booksRes.data);
      }
    }

    fetchOptions();
  }, [assignOpen]);

  // Build calendar
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const now = new Date();
  const today =
    now.getFullYear() === year && now.getMonth() + 1 === mon
      ? now.getDate()
      : -1;

  // Group schedules by day
  const schedulesByDay: Record<number, ScheduleWithRelations[]> = {};
  for (const s of schedules) {
    const day = parseInt(s.scheduled_date.split("-")[2], 10);
    if (!schedulesByDay[day]) schedulesByDay[day] = [];
    schedulesByDay[day].push(s);
  }

  const weeks: (number | null)[][] = [];
  let currentDay = 1;
  const firstWeek: (number | null)[] = [];
  for (let i = 0; i < 7; i++) {
    if (i < firstDay) firstWeek.push(null);
    else firstWeek.push(currentDay++);
  }
  weeks.push(firstWeek);
  while (currentDay <= daysInMonth) {
    const week: (number | null)[] = [];
    for (let i = 0; i < 7; i++) {
      if (currentDay <= daysInMonth) week.push(currentDay++);
      else week.push(null);
    }
    weeks.push(week);
  }

  // Handlers
  function handleMonthNav(target: string) {
    startTransition(() => {
      router.push(`/schedule?month=${target}`);
    });
  }

  function handleDayClick(day: number) {
    if (schedulesByDay[day] && schedulesByDay[day].length > 0) {
      setSelectedDay(day);
      setDayDetailOpen(true);
    }
  }

  function handleOpenAssign() {
    setSelectedStudentId("");
    setSelectedBookId("");
    setScheduledDate("");
    setNote("");
    setAssignError("");
    setAssignOpen(true);
  }

  async function handleAssignSubmit() {
    if (!selectedStudentId || !selectedBookId || !scheduledDate) {
      setAssignError("학생, 교재, 날짜를 모두 선택해주세요.");
      return;
    }

    setIsSubmitting(true);
    setAssignError("");

    const result = await createSchedule({
      studentId: selectedStudentId,
      vocabBookId: selectedBookId,
      scheduledDate,
      note: note || undefined,
    });

    setIsSubmitting(false);

    if (result.error) {
      setAssignError(result.error);
    } else {
      setAssignOpen(false);
      startTransition(() => {
        router.refresh();
      });
    }
  }

  async function handleStatusChange(
    id: string,
    status: "scheduled" | "in_progress" | "completed" | "missed"
  ) {
    const result = await updateScheduleStatus(id, status);
    if (!result.error) {
      startTransition(() => {
        router.refresh();
      });
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteSchedule(id);
    if (!result.error) {
      // Close dialog if no more schedules for this day
      const remaining = selectedDay
        ? (schedulesByDay[selectedDay] || []).filter((s) => s.id !== id)
        : [];
      if (remaining.length === 0) {
        setDayDetailOpen(false);
      }
      startTransition(() => {
        router.refresh();
      });
    }
  }

  const selectedDaySchedules = selectedDay
    ? schedulesByDay[selectedDay] || []
    : [];

  return (
    <>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            className="p-1 hover:bg-vb-bg-muted rounded disabled:opacity-50"
            onClick={() => handleMonthNav(prevMonth)}
            disabled={isPending}
          >
            <ChevronLeft className="w-5 h-5 text-vb-text-secondary" />
          </button>
          <h2 className="text-lg font-semibold text-vb-text-primary">
            {year}년 {mon}월
          </h2>
          <button
            className="p-1 hover:bg-vb-bg-muted rounded disabled:opacity-50"
            onClick={() => handleMonthNav(nextMonth)}
            disabled={isPending}
          >
            <ChevronRight className="w-5 h-5 text-vb-text-secondary" />
          </button>
        </div>
        <Button
          className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2"
          onClick={handleOpenAssign}
        >
          <Plus className="w-4 h-4" />
          과제 배정
        </Button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 border-b border-vb-border">
        {dayNames.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-[13px] font-medium text-vb-text-tertiary"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {weeks.flat().map((day, i) => {
          const isToday = day === today;
          const isWeekend = i % 7 === 0 || i % 7 === 6;
          const daySchedules = day ? schedulesByDay[day] : undefined;

          return (
            <div
              key={i}
              className={`min-h-[100px] p-2 border-b border-r border-vb-border cursor-pointer hover:bg-vb-bg-muted/50 ${
                isToday ? "bg-vb-primary-light border-vb-primary" : ""
              }`}
              onClick={() => day && handleDayClick(day)}
            >
              {day && (
                <>
                  <span
                    className={`text-sm ${
                      isToday
                        ? "font-bold text-vb-primary"
                        : isWeekend
                          ? "text-vb-text-secondary"
                          : "text-vb-text-primary"
                    }`}
                  >
                    {day}
                  </span>
                  {daySchedules && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {daySchedules.map((s) => (
                        <div
                          key={s.id}
                          className={`w-2 h-2 rounded-full ${statusColors[s.status] ?? "bg-vb-primary"}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Task Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>과제 배정</DialogTitle>
            <DialogDescription>
              학생에게 단어장 과제를 배정합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Student Select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-vb-text-primary">
                학생
              </label>
              <Select
                value={selectedStudentId}
                onValueChange={setSelectedStudentId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="학생을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Book Select */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-vb-text-primary">
                단어장
              </label>
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="단어장을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {books.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-vb-text-primary">
                날짜
              </label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>

            {/* Note */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-vb-text-primary">
                메모 (선택)
              </label>
              <textarea
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none min-h-[80px] resize-none"
                placeholder="메모를 입력하세요"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            {assignError && (
              <p className="text-sm text-vb-danger">{assignError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignOpen(false)}
              disabled={isSubmitting}
            >
              취소
            </Button>
            <Button
              className="bg-vb-primary hover:bg-vb-primary-hover text-white"
              onClick={handleAssignSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "배정하기"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Day Detail Dialog */}
      <Dialog open={dayDetailOpen} onOpenChange={setDayDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {year}년 {mon}월 {selectedDay}일 스케줄
            </DialogTitle>
            <DialogDescription>
              이 날의 과제 목록입니다. 상태를 변경하거나 삭제할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 max-h-[400px] overflow-y-auto">
            {selectedDaySchedules.length === 0 ? (
              <p className="text-sm text-vb-text-tertiary text-center py-4">
                스케줄이 없습니다.
              </p>
            ) : (
              selectedDaySchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-vb-border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-vb-text-primary truncate">
                      {schedule.students?.name ?? "알 수 없음"}
                    </p>
                    <p className="text-xs text-vb-text-secondary truncate">
                      {schedule.vocab_books?.title ?? "알 수 없음"}
                    </p>
                    {schedule.note && (
                      <p className="text-xs text-vb-text-tertiary mt-1 truncate">
                        {schedule.note}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Badge / Select */}
                    <Select
                      value={schedule.status}
                      onValueChange={(value) =>
                        handleStatusChange(
                          schedule.id,
                          value as
                            | "scheduled"
                            | "in_progress"
                            | "completed"
                            | "missed"
                        )
                      }
                    >
                      <SelectTrigger
                        className={`h-7 text-xs px-2 border-0 shadow-none rounded-full ${statusBadgeColors[schedule.status] ?? "bg-vb-primary/10 text-vb-primary"}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">예정</SelectItem>
                        <SelectItem value="in_progress">진행 중</SelectItem>
                        <SelectItem value="completed">완료</SelectItem>
                        <SelectItem value="missed">미완료</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="text-vb-text-tertiary hover:text-vb-danger"
                      onClick={() => handleDelete(schedule.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
