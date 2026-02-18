"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilterDropdownProps {
  paramKey: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}

export function FilterDropdown({
  paramKey,
  label,
  options,
  allLabel = "전체",
}: FilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get(paramKey) || "";

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(paramKey, value);
      } else {
        params.delete(paramKey);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, paramKey]
  );

  return (
    <select
      value={current}
      onChange={(e) => handleChange(e.target.value)}
      aria-label={label}
      className="h-9 px-3 rounded-lg border border-eo-border bg-white text-sm text-eo-text-primary focus:outline-none focus:ring-2 focus:ring-eo-primary/20 focus:border-eo-primary"
    >
      <option value="">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
