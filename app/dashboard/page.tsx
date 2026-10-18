"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Coherencia semántica: /admin es el Dashboard de Mando Principal
    router.replace("/admin");
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--background)] text-slate-400 text-sm">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <span>Redirigiendo a Panel de Control /admin...</span>
      </div>
    </div>
  );
}
