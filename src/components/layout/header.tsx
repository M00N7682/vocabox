"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function Header({ title, children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-8 bg-white border-b border-vb-border shrink-0">
      <h1 className="text-xl font-bold text-vb-text-primary">{title}</h1>
      <div className="flex items-center gap-3">
        {children}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-vb-primary text-white text-xs font-semibold">
              관리자
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-vb-text-secondary">관리자</span>
        </div>
      </div>
    </header>
  );
}
