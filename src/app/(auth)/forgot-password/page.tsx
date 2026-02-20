"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/actions/auth";
import { useState } from "react";
import { GraduationCap, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await resetPassword(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setSent(true);
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
            {"비밀번호를\n잊으셨나요?"}
          </h2>
          <p className="text-[#9CA3AF] text-base leading-relaxed whitespace-pre-line">
            {"가입하신 이메일로\n비밀번호 재설정 링크를 보내드립니다"}
          </p>
        </div>

        <p className="text-[#9CA3AF] text-xs">
          © 2026 EduOps. All rights reserved.
        </p>
      </div>

      {/* Right - Form */}
      <div className="flex items-center justify-center w-[520px] bg-white px-[60px] py-12">
        {sent ? (
          <div className="flex flex-col items-center gap-6 w-full text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-[#EEF2FF] rounded-full">
              <Mail className="w-8 h-8 text-[#4F46E5]" />
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-bold text-[#111827]">
                이메일을 확인하세요
              </h1>
              <p className="text-[15px] text-[#6B7280] leading-relaxed">
                비밀번호 재설정 링크가 이메일로 발송되었습니다.
                <br />
                이메일의 링크를 클릭하여 새 비밀번호를 설정하세요.
              </p>
            </div>
            <Link
              href="/login"
              className="flex items-center gap-2 text-[15px] font-semibold text-[#4F46E5] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              로그인으로 돌아가기
            </Link>
          </div>
        ) : (
          <form action={handleSubmit} className="flex flex-col gap-8 w-full">
            <div className="flex flex-col gap-2">
              <h1 className="text-[28px] font-bold text-[#111827]">
                비밀번호 재설정
              </h1>
              <p className="text-[15px] text-[#6B7280]">
                가입하신 이메일 주소를 입력하세요
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-sm text-[#EF4444]">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#111827]">
                이메일
              </label>
              <Input
                name="email"
                type="email"
                placeholder="name@academy.com"
                className="h-11"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white text-[15px] font-semibold rounded-lg"
            >
              {loading ? "전송 중..." : "재설정 링크 보내기"}
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-[13px] text-[#6B7280] hover:text-[#4F46E5]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              로그인으로 돌아가기
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
