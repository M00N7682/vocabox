"use client";

import { useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { markAsRead, deleteNotification } from "@/lib/actions/notifications";

export function NotificationActions({
  id,
  isRead,
}: {
  id: string;
  isRead: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1">
      {!isRead && (
        <button
          onClick={() => startTransition(async () => { await markAsRead(id); })}
          disabled={isPending}
          className="p-1 rounded hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
          title="읽음 처리"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
      {isRead && (
        <span className="text-[10px] text-green-600 font-medium">읽음</span>
      )}
      <button
        onClick={() => startTransition(async () => { await deleteNotification(id); })}
        disabled={isPending}
        className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
        title="삭제"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
