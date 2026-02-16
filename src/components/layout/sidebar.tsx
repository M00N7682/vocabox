"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  School,
  BookOpen,
  FileText,
  BarChart3,
  Calendar,
  TrendingUp,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "./logo";
import { logout } from "@/lib/actions/auth";

const mainNav = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "학생 관리", href: "/students", icon: Users },
  { label: "반 관리", href: "/classes", icon: School },
  { label: "단어장", href: "/vocab", icon: BookOpen },
  { label: "시험지 출력", href: "/tests", icon: FileText },
  { label: "점수 관리", href: "/scores", icon: BarChart3 },
  { label: "스케줄", href: "/schedule", icon: Calendar },
  { label: "리포트", href: "/reports", icon: TrendingUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 h-full bg-vb-bg-sidebar px-4 py-6 shrink-0">
      <div className="pb-6">
        <Logo variant="dark" />
      </div>

      <nav className="flex flex-col gap-1 py-2">
        {mainNav.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-vb-bg-sidebar-active text-white font-semibold"
                  : "text-slate-400 hover:bg-vb-bg-sidebar-hover"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <nav className="flex flex-col gap-1 py-2 mt-auto">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-vb-bg-sidebar-hover transition-colors"
        >
          <Settings className="w-5 h-5 shrink-0" />
          <span>설정</span>
        </Link>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-vb-bg-sidebar-hover transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>로그아웃</span>
        </button>
      </nav>
    </aside>
  );
}
