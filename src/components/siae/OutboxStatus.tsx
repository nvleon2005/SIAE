"use client";

import { useOutbox } from "@/src/modules/outbox/use-outbox";

export function OutboxStatus() {
  const { items, pendingCount, retryNow } = useOutbox();
  const latestSent = [...items].reverse().find((item) => item.estado === "enviado");

  if (pendingCount === 0 && !latestSent) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-amber-400/60 bg-amber-500/10 p-4 text-sm text-amber-100" aria-live="polite" aria-label="Estado de envío">
      <p className="font-semibold">
        {pendingCount > 0 ? `☁️↑ ${pendingCount} emergencia${pendingCount === 1 ? "" : "s"} pendiente${pendingCount === 1 ? "" : "s"}` : "☁️ Emergencia enviada"}
      </p>
      <p className="mt-1 text-amber-200">
        {pendingCount > 0 ? "Se enviará al recuperar la red." : "Tu emergencia se ha enviado correctamente."}
      </p>
      {pendingCount > 0 ? (
        <button type="button" className="mt-3 min-h-12 rounded-lg border border-amber-200 px-3 py-2 font-medium text-amber-50" onClick={() => void retryNow()}>
          Reintentar ahora
        </button>
      ) : null}
    </section>
  );
}
