"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  paramKey?: string;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({
  paramKey = "search",
  placeholder = "검색...",
  debounceMs = 300,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramKey) || "");

  useEffect(() => {
    setValue(searchParams.get(paramKey) || "");
  }, [searchParams, paramKey]);

  const updateSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set(paramKey, term);
      } else {
        params.delete(paramKey);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams, paramKey]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get(paramKey) || "";
      if (value !== current) {
        updateSearch(value);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, debounceMs, updateSearch, searchParams, paramKey]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-eo-text-tertiary" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full pl-9 pr-3 rounded-lg border border-eo-border bg-white text-sm text-eo-text-primary placeholder:text-eo-text-tertiary focus:outline-none focus:ring-2 focus:ring-eo-primary/20 focus:border-eo-primary"
      />
    </div>
  );
}
