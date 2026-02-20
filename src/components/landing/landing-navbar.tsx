"use client";

import { useState, useEffect } from "react";
import { GraduationCap, Menu, X } from "lucide-react";
import Link from "next/link";

const navLinks = [
  { href: "#features", label: "기능" },
  { href: "#pricing", label: "요금제" },
];

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 backdrop-blur shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-eo-primary rounded-lg">
              <GraduationCap className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="font-bold text-lg text-eo-text-primary">
              EduOps
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-eo-text-secondary hover:text-eo-text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-eo-text-secondary hover:text-eo-text-primary transition-colors"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-eo-primary px-4 py-2 text-sm font-medium text-white hover:bg-eo-primary-hover transition-colors"
            >
              무료로 시작하기
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-eo-text-secondary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-eo-border">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="block text-sm font-medium text-eo-text-secondary hover:text-eo-text-primary"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 border-t border-eo-border space-y-2">
              <Link
                href="/login"
                className="block text-sm font-medium text-eo-text-secondary"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center rounded-lg bg-eo-primary px-4 py-2 text-sm font-medium text-white hover:bg-eo-primary-hover"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
