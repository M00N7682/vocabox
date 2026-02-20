"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { login } from "@/lib/actions/auth";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap } from "lucide-react";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const [error, setError] = useState<string | null>(callbackError);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left - Hero / Branding */}
      <div className="flex-1 flex flex-col justify-between bg-[#111827] p-12">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-10 h-10 bg-[#4F46E5] rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EduOps</span>
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-white text-4xl font-bold leading-[1.3] whitespace-pre-line">
            {"학원 운영의\n모든 것을 하나로"}
          </h2>
          <p className="text-[#9CA3AF] text-base leading-relaxed whitespace-pre-line">
            {"학습 관리, 평가, 분석, 출결까지\n종합학원 ERP 솔루션"}
          </p>
        </div>

        <p className="text-[#9CA3AF] text-xs">
          © 2026 EduOps. All rights reserved.
        </p>
      </div>

      {/* Right - Login Form */}
      <div className="flex items-center justify-center w-[520px] bg-white px-[60px] py-12">
        <form action={handleSubmit} className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-[28px] font-bold text-[#111827]">로그인</h1>
            <p className="text-[15px] text-[#6B7280]">
              학원 계정으로 로그인하세요
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

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[#111827]">
                  비밀번호
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#4F46E5] hover:underline"
                >
                  비밀번호 찾기
                </Link>
              </div>
              <Input
                name="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
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
            {loading ? "로그인 중..." : "로그인"}
          </Button>

          <p className="text-[13px] text-center text-[#6B7280]">
            아직 계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="font-semibold text-[#4F46E5] hover:underline"
            >
              학원 등록하기
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
