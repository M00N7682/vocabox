import { GraduationCap } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-eo-bg-page">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-eo-primary mb-4 animate-pulse">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>
        <div className="h-1.5 w-24 mx-auto rounded-full bg-eo-border overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-eo-primary animate-[loading_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
