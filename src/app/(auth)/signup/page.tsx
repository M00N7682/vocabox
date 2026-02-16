"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signup } from "@/lib/actions/auth";
import { useState } from "react";

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    const password = formData.get("password") as string;
    const confirm = formData.get("passwordConfirm") as string;

    if (password !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    setError(null);
    const result = await signup(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left - Branding */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-vb-primary p-12">
        <div className="flex items-center gap-3">
          <div className="relative bg-white rounded-xl w-14 h-14">
            <span className="text-vb-primary font-black text-2xl absolute left-2 top-3">
              VB
            </span>
            <div className="absolute bottom-0 left-0 w-full h-[5px] bg-blue-300 rounded-b-xl" />
          </div>
          <span className="text-white font-bold text-[32px]">Voca Box</span>
        </div>
        <p className="text-white/80 text-lg text-center">
          영어학원 학생 관리의 새로운 기준
        </p>
        <p className="text-white/60 text-[15px] text-center leading-relaxed">
          단어장 관리부터 시험지 출력, 점수 관리까지
          <br />
          하나의 플랫폼에서 간편하게
        </p>
      </div>

      {/* Right - Signup Form */}
      <div className="flex items-center justify-center w-[520px] bg-white px-[60px] py-12 overflow-y-auto">
        <form action={handleSubmit} className="flex flex-col gap-6 w-full">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-vb-text-primary">
              회원가입
            </h1>
            <p className="text-sm text-vb-text-secondary">
              학원 관리를 시작하세요
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-sm text-vb-danger">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              이메일
            </label>
            <Input
              name="email"
              type="email"
              placeholder="name@academy.com"
              className="h-10"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              비밀번호 (8자 이상)
            </label>
            <Input
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              className="h-10"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              비밀번호 확인
            </label>
            <Input
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              className="h-10"
              required
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              학원명
            </label>
            <Input
              name="academyName"
              placeholder="학원명을 입력하세요"
              className="h-10"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              관리자 이름
            </label>
            <Input
              name="ownerName"
              placeholder="이름을 입력하세요"
              className="h-10"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-vb-text-primary">
              학원 연락처 (선택)
            </label>
            <Input name="phone" placeholder="02-XXX-XXXX" className="h-10" />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-vb-primary hover:bg-vb-primary-hover text-white text-[15px] font-medium"
          >
            {loading ? "가입 중..." : "회원가입"}
          </Button>

          <p className="text-[13px] text-center text-vb-text-secondary">
            이미 계정이 있으신가요?{" "}
            <Link
              href="/login"
              className="font-semibold text-vb-primary hover:underline"
            >
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
