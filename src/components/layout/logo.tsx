"use client";

export function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const textColor = variant === "dark" ? "text-white" : "text-vb-text-primary";
  const vbBg = variant === "dark" ? "bg-white" : "bg-vb-primary";
  const vbText = variant === "dark" ? "text-vb-primary" : "text-white";

  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative ${vbBg} rounded-lg w-11 h-11`}>
        <span className={`${vbText} font-black text-xl absolute left-1.5 top-2`}>
          VB
        </span>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-300 rounded-b-lg" />
      </div>
      <div className="flex items-center gap-1">
        <span className={`${textColor} font-bold text-[22px]`}>Voca</span>
        <span className="text-blue-300 font-bold text-[22px]">Box</span>
      </div>
    </div>
  );
}
