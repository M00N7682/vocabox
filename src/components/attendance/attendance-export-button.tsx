"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type AttendanceRecord = {
  id: string;
  date: string;
  status: string;
  check_in_time: string | null;
  check_method: string | null;
  reason: string | null;
  students: { name: string } | null;
  subjects: { name: string } | null;
};

export function AttendanceExportButton({
  records,
}: {
  records: AttendanceRecord[];
}) {
  function handleExport() {
    const header = "날짜,학생,과목,상태,체크인시간,방법,사유";
    const rows = records.map((r) => {
      const checkin = r.check_in_time
        ? new Date(r.check_in_time).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        : "";
      const methodLabels: Record<string, string> = {
        qr: "QR",
        pin: "PIN",
        manual: "수동",
      };
      return [
        r.date,
        r.students?.name ?? "",
        r.subjects?.name ?? "",
        r.status,
        checkin,
        methodLabels[r.check_method ?? "manual"] ?? r.check_method ?? "",
        r.reason ?? "",
      ]
        .map((v) => `"${v}"`)
        .join(",");
    });

    const csv = "\uFEFF" + [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `출결_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="outline" className="gap-2" onClick={handleExport}>
      <Download className="w-4 h-4" />
      내보내기
    </Button>
  );
}
