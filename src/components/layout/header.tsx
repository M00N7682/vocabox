"use client";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-10 py-8 shrink-0">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-eo-text-primary">{title}</h1>
        {description && (
          <p className="text-sm text-eo-text-secondary">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2.5">{children}</div>
      )}
    </header>
  );
}
