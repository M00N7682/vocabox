"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { checkInByPin } from "@/lib/actions/attendance";
import { QrCode, KeyRound, CheckCircle, XCircle } from "lucide-react";

type Props = {
  subjects: { id: string; name: string; color: string }[];
};

export function AttendanceCheckClient({ subjects }: Props) {
  const [mode, setMode] = useState<"pin" | "qr">("pin");
  const [pinCode, setPinCode] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handlePinSubmit() {
    if (!pinCode || !subjectId) return;
    startTransition(async () => {
      const res = await checkInByPin(pinCode, subjectId);
      if (res.error) {
        setResult({ success: false, message: res.error });
      } else {
        setResult({ success: true, message: `출석 체크 완료!` });
      }
      setPinCode("");
      setTimeout(() => setResult(null), 3000);
    });
  }

  return (
    <div className="flex flex-col items-center gap-8 max-w-[480px] mx-auto">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-eo-bg-surface rounded-lg">
        <button
          onClick={() => setMode("pin")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "pin" ? "bg-white text-eo-primary shadow-sm" : "text-eo-text-secondary"}`}
        >
          <KeyRound className="w-4 h-4" />
          PIN 입력
        </button>
        <button
          onClick={() => setMode("qr")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "qr" ? "bg-white text-eo-primary shadow-sm" : "text-eo-text-secondary"}`}
        >
          <QrCode className="w-4 h-4" />
          QR 스캔
        </button>
      </div>

      {/* Subject Selection */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-sm font-medium text-eo-text-primary">수업 과목</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="h-10 px-3 rounded-lg border border-eo-border text-sm"
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {mode === "pin" ? (
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-eo-text-primary">PIN 번호</label>
            <Input
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="PIN 번호를 입력하세요"
              className="h-14 text-center text-2xl tracking-widest"
              maxLength={6}
              onKeyDown={(e) => e.key === "Enter" && handlePinSubmit()}
            />
          </div>
          <Button
            onClick={handlePinSubmit}
            disabled={isPending || !pinCode}
            className="bg-eo-primary hover:bg-[#4338CA] text-white h-12 text-base"
          >
            {isPending ? "확인중..." : "출석 체크"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full p-8 bg-eo-bg-surface rounded-xl border-2 border-dashed border-eo-border">
          <QrCode className="w-16 h-16 text-eo-text-tertiary" />
          <p className="text-sm text-eo-text-secondary text-center">
            QR 스캐너 기능은 준비중입니다.<br />
            PIN 입력 방식을 이용해주세요.
          </p>
        </div>
      )}

      {/* Result Feedback */}
      {result && (
        <div className={`flex items-center gap-3 w-full px-5 py-4 rounded-xl ${result.success ? "bg-[#ECFDF5] border border-[#A7F3D0]" : "bg-[#FEF2F2] border border-[#FECACA]"}`}>
          {result.success ? <CheckCircle className="w-5 h-5 text-eo-success" /> : <XCircle className="w-5 h-5 text-eo-danger" />}
          <span className={`text-sm font-medium ${result.success ? "text-[#065F46]" : "text-[#991B1B]"}`}>
            {result.message}
          </span>
        </div>
      )}
    </div>
  );
}
