"use client";

import { useEffect } from "react";
import { listOutboxItems } from "@/src/lib/profile-db";
import { syncOutbox } from "@/src/modules/emergency/use-create-emergency";
import { useOnline } from "@/src/lib/use-online";

const RETRY_DELAYS = [5_000, 15_000, 60_000];

export function useOutboxSync() {
  const online = useOnline();

  useEffect(() => {
    if (!online) {
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      await syncOutbox();
      if (cancelled) {
        return;
      }

      const pending = (await listOutboxItems()).filter((item) => item.estado !== "enviado");
      if (pending.length === 0) {
        return;
      }

      const maxTries = Math.max(...pending.map((item) => item.tries));
      const delay = RETRY_DELAYS[Math.min(maxTries, RETRY_DELAYS.length - 1)];
      timeoutId = setTimeout(() => void run(), delay);
    };

    void run();

    const handleOutboxUpdated = () => {
      void run();
    };

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "siae-outbox-sync") {
        void run();
      }
    };

    window.addEventListener("siae-outbox-updated", handleOutboxUpdated);
    navigator.serviceWorker?.addEventListener("message", handleServiceWorkerMessage);

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener("siae-outbox-updated", handleOutboxUpdated);
      navigator.serviceWorker?.removeEventListener("message", handleServiceWorkerMessage);
    };
  }, [online]);
}
