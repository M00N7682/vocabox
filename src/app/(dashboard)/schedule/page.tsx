import { Header } from "@/components/layout/header";
import { getSchedules } from "@/lib/actions/schedules";
import { ScheduleClient } from "@/components/schedule/schedule-client";

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month =
    params.month ||
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, mon] = month.split("-").map(Number);

  const schedules = await getSchedules({ month });

  const prevMonth =
    mon === 1
      ? `${year - 1}-12`
      : `${year}-${String(mon - 1).padStart(2, "0")}`;
  const nextMonth =
    mon === 12
      ? `${year + 1}-01`
      : `${year}-${String(mon + 1).padStart(2, "0")}`;

  return (
    <>
      <Header title="스케줄 관리" />
      <div className="p-8 flex-1">
        <div className="bg-white rounded-xl border border-eo-border p-6 h-full">
          <ScheduleClient
            schedules={schedules}
            month={month}
            year={year}
            mon={mon}
            prevMonth={prevMonth}
            nextMonth={nextMonth}
          />
        </div>
      </div>
    </>
  );
}
