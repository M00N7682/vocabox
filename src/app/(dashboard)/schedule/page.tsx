import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { getSchedules } from "@/lib/actions/schedules";
import Link from "next/link";

const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

const statusColors: Record<string, string> = {
  scheduled: "bg-vb-primary",
  in_progress: "bg-vb-warning",
  completed: "bg-vb-success",
  missed: "bg-vb-danger",
};

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = params.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, mon] = month.split("-").map(Number);

  const schedules = await getSchedules({ month });

  // Build calendar
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const today = now.getFullYear() === year && now.getMonth() + 1 === mon ? now.getDate() : -1;

  // Group schedules by day
  const schedulesByDay: Record<number, typeof schedules> = {};
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

  const prevMonth = mon === 1 ? `${year - 1}-12` : `${year}-${String(mon - 1).padStart(2, "0")}`;
  const nextMonth = mon === 12 ? `${year + 1}-01` : `${year}-${String(mon + 1).padStart(2, "0")}`;

  return (
    <>
      <Header title="스케줄 관리" />
      <div className="p-8 flex-1">
        <div className="bg-white rounded-xl border border-vb-border p-6 h-full">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/schedule?month=${prevMonth}`}>
                <button className="p-1 hover:bg-vb-bg-muted rounded">
                  <ChevronLeft className="w-5 h-5 text-vb-text-secondary" />
                </button>
              </Link>
              <h2 className="text-lg font-semibold text-vb-text-primary">
                {year}년 {mon}월
              </h2>
              <Link href={`/schedule?month=${nextMonth}`}>
                <button className="p-1 hover:bg-vb-bg-muted rounded">
                  <ChevronRight className="w-5 h-5 text-vb-text-secondary" />
                </button>
              </Link>
            </div>
            <Button className="bg-vb-primary hover:bg-vb-primary-hover text-white gap-2">
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
        </div>
      </div>
    </>
  );
}
