"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { resolveAlert } from "@/lib/actions/risk-alerts";

export function RiskResolveButton({ alertId }: { alertId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => startTransition(async () => { await resolveAlert(alertId); })}
      className="self-start shrink-0"
    >
      {isPending ? "처리중..." : "해결 처리"}
    </Button>
  );
}
