"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Library,
  ClipboardList,
  Users,
  School,
  PencilLine,
  BarChart3,
  CalendarCheck,
  FileText,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { Logo } from "./logo";
import { logout } from "@/lib/actions/auth";

const navSections = [
  {
    items: [
      { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "학습 관리",
    items: [
      { label: "과목 관리", href: "/subjects", icon: BookOpen },
      { label: "교재/단원", href: "/textbooks", icon: Library },
      { label: "평가 관리", href: "/assessments", icon: ClipboardList },
    ],
  },
  {
    label: "관리",
    items: [
      { label: "학생 관리", href: "/students", icon: Users },
      { label: "반 관리", href: "/classes", icon: School },
    ],
  },
  {
    label: "성적/분석",
    items: [
      { label: "성적 관리", href: "/scores", icon: PencilLine },
      { label: "분석/리포트", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "운영",
    items: [
      { label: "출결 관리", href: "/attendance", icon: CalendarCheck },
      { label: "과제 관리", href: "/assignments", icon: FileText },
      { label: "알림", href: "/notifications", icon: Bell, badge: true },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [riskCount, setRiskCount] = useState(0);

  useEffect(() => {
    fetch("/api/risk-count")
      .then((r) => r.json())
      .then((d) => setRiskCount(d.count ?? 0))
      .catch(() => {});
  }, [pathname]);

  return (
    <aside className="flex flex-col w-[260px] h-full bg-eo-bg-sidebar px-5 py-6 shrink-0">
      <div className="pb-6">
        <Logo variant="dark" />
      </div>

      <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className={section.label ? "pt-4" : ""}>
            {section.label && (
              <span className="block px-4 pb-2 text-[11px] font-semibold tracking-wider text-eo-sidebar-text-muted uppercase">
                {section.label}
              </span>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                const showBadge = "badge" in item && item.badge && riskCount > 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-white/10 text-white font-semibold"
                        : "text-eo-sidebar-text hover:bg-eo-bg-sidebar-hover"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    <span>{item.label}</span>
                    {showBadge && (
                      <Link
                        href="/analytics/risks"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#EF4444] text-white text-[10px] font-bold hover:bg-[#DC2626] transition-colors"
                      >
                        {riskCount > 99 ? "99+" : riskCount}
                      </Link>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-1 pt-4 border-t border-white/10">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
            pathname.startsWith("/settings")
              ? "bg-white/10 text-white font-semibold"
              : "text-eo-sidebar-text hover:bg-eo-bg-sidebar-hover"
          }`}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          <span>설정</span>
        </Link>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-eo-primary">
            <span className="text-white text-[13px] font-semibold">김</span>
          </div>
          <span className="text-[13px] font-medium text-eo-sidebar-text">김원장</span>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-eo-sidebar-text hover:bg-eo-bg-sidebar-hover transition-colors w-full text-left"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
