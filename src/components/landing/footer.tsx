import { GraduationCap } from "lucide-react";

const columns = [
  {
    title: "제품",
    links: [
      { label: "기능", href: "#features" },
      { label: "요금제", href: "#pricing" },
      { label: "업데이트", href: "#" },
    ],
  },
  {
    title: "지원",
    links: [
      { label: "도움말 센터", href: "#" },
      { label: "문의하기", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "법적 고지",
    links: [
      { label: "이용약관", href: "#" },
      { label: "개인정보처리방침", href: "#" },
      { label: "쿠키 정책", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-8 h-8 bg-eo-primary rounded-lg">
                <GraduationCap className="w-[18px] h-[18px] text-white" />
              </div>
              <span className="font-bold text-lg text-white">EduOps</span>
            </div>
            <p className="text-sm leading-relaxed">
              학원 운영의 모든 것을 하나의 플랫폼에서 관리하는 종합 학원 관리 시스템
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-sm text-center">
          &copy; {new Date().getFullYear()} EduOps. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
