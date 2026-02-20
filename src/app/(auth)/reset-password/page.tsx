"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/actions/auth";
import { useState } from "react";
import { GraduationCap, CheckCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirm = formData.get("passwordConfirm") as string;

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await updatePassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setDone(true);
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left - Branding */}
      <div className="flex-1 flex flex-col justify-between bg-[#111827] p-12">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 bg-[#4F46E5] rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EduOps</span>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-white text-4xl font-bold leading-[1.3] whitespace-pre-line">
            {"새 비밀번호를\n설정하세요"}
          </h2>
          <p className="text-[#9CA3AF] text-base leading-relaxed">
            안전한 비밀번호로 변경하세요
          </p>
        </div>

        <p className="text-[#9CA3AF] text-xs">
          © 2026 EduOps. All rights reserved.
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center w-[520px] bg-white px-[60px] py-12">
        {done ? (
          <div className="flex flex-col items-center gap-6 w-full text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-[#ECFDF5] rounded-full">
              <CheckCircle className="w-8 h-8 text-[#10B981]" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-bold text-[#111827]">
                비밀번호 변경 완료
              </h1>
              <p className="text-[15px] text-[#6B7280]">
                새 비밀번호로 로그인하세요.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full h-12 flex items-center justify-center bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[15px] font-semibold rounded-lg transition-colors"
            >
              로그인하기
            </Link>
          </div>
        ) : (
          <form action={handleSubmit} className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-bold text-[#111827]">
                새 비밀번호 설정
              </h1>
              <p className="text-[15px] text-[#6B7280]">
                새로운 비밀번호를 입력하세요
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#111827]">
                  새 비밀번호 (6자 이상)
                </label>
                <Input
                  name="password"
                  type="password"
                  placeholder="새 비밀번호를 입력하세요"
                  className="h-11"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#111827]">
                  비밀번호 확인
                </label>
                <Input
                  name="passwordConfirm"
                  type="password"
                  placeholder="비밀번호를 다시 입력하세요"
                  className="h-11"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[15px] font-semibold rounded-lg"
            >
              {loading ? "변경 중..." : "비밀번호 변경"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
