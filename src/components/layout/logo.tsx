"use client";

import { GraduationCap } from "lucide-react";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "dark" ? "text-white" : "text-eo-text-primary";

  return (
    <div className="flex items-center gap-2.5 px-1 py-2">
      <div className="flex items-center justify-center w-8 h-8 bg-eo-primary rounded-lg">
        <GraduationCap className="w-[18px] h-[18px] text-white" />
      </div>
      <span className={`${textColor} font-bold text-lg`}>EduOps</span>
    </div>
  );
}
