"use client";

import { useCallback, useEffect, useState } from "react";
import { countPendingOutboxItems, listOutboxItems, type OutboxItem } from "@/src/lib/profile-db";
import { syncOutbox } from "@/src/modules/emergency/use-create-emergency";

export function useOutbox() {
  const [items, setItems] = useState<OutboxItem[]>([]);

  const refresh = useCallback(async () => {
    setItems(await listOutboxItems());
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void refresh(), 0);
    const handleUpdate = () => void refresh();
    window.addEventListener("siae-outbox-updated", handleUpdate);
    window.addEventListener("siae-outbox-synced", handleUpdate);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener("siae-outbox-updated", handleUpdate);
      window.removeEventListener("siae-outbox-synced", handleUpdate);
    };
  }, [refresh]);

  const retryNow = useCallback(async () => {
    await syncOutbox();
    await refresh();
  }, [refresh]);

  return {
    items,
    pendingCount: items.filter((item) => item.estado !== "enviado").length,
    sentItems: items.filter((item) => item.estado === "enviado"),
    retryNow,
    refresh,
    countPending: countPendingOutboxItems,
  };
}
