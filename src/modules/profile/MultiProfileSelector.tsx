"use client";

import { AlertCircle } from "lucide-react";

export function MultiProfileSelector() {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        La gestión de perfiles de familiares todavía no está conectada al backend.
        Solo se enviará la información del perfil individual; no se usarán perfiles
        locales que no estén sincronizados.
      </p>
    </div>
  );
}
