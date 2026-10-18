"use client";

import { AlertTriangle } from "lucide-react";

export function CadFleetBoard({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Disponibilidad de flotas CAD"
      className={`rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100 ${className}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h3 className="text-sm font-bold">Flotas no disponibles</h3>
          <p className="mt-1 text-xs leading-relaxed">
            No hay una integración backend de unidades y flotas. No se muestran
            unidades, ubicaciones, estados ni tiempos estimados simulados.
          </p>
        </div>
      </div>
    </section>
  );
}
