"use client";

import { useOnline } from "@/src/lib/use-online";
import { useSyncExternalStore } from "react";
import { useOutbox } from "@/src/modules/outbox/use-outbox";

export function OfflineBanner() {
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const online = useOnline();
  const { pendingCount, retryNow } = useOutbox();

  if (!mounted || (online && pendingCount === 0)) {
    return null;
  }

  return (
    <aside
      className="sticky top-0 z-40 border-b border-amber-300 bg-amber-100 px-4 py-3 text-sm font-medium text-amber-950"
      role={online ? "status" : "alert"}
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <span>
          {online
            ? `${pendingCount} emergencia${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"}`
            : "Estás sin conexión. Tu emergencia se enviará al reconectar."}
        </span>
        <button type="button" className="min-h-12 shrink-0 rounded-lg border border-amber-800 px-3 py-2" onClick={() => void retryNow()}>
          Reintentar
        </button>
      </div>
    </aside>
  );
}
