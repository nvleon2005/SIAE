import React from "react";
import { LiveMetricsData } from "../types";

interface DashboardHudMetricsProps {
  liveMetrics: LiveMetricsData | null;
}

export function DashboardHudMetrics({ liveMetrics }: DashboardHudMetricsProps) {
  return (
    <section aria-label="Métricas clave en tiempo real" className="bg-[var(--card-bg)]/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 px-4 py-2.5 shrink-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Emergencias Activas</span>
            <span className="text-lg font-black text-slate-950 dark:text-white leading-none">
              {liveMetrics?.resumen?.totalEmergencias ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Cola de Espera ACD</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400 leading-none">
              {liveMetrics?.resumen?.enEspera ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Despachos CAD en Ruta</span>
            <span className="text-lg font-black text-[var(--accent)] dark:text-sky-400 leading-none">
              {liveMetrics?.resumen?.despachadas ?? "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">T. Medio de Respuesta</span>
            <span className="text-lg font-black text-slate-950 dark:text-white leading-none font-mono">
              {liveMetrics?.resumen?.tiempoMedioRespuesta ?? "—"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
