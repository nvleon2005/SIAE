import React from "react";
import {
  responseMatrix,
  zoneStats,
  executiveSummary,
  systemStatus,
} from "../data";

export function DashboardKpisTab() {
  return (
    <div className="grid grid-cols-12 gap-4 h-full min-h-[580px]">
      {/* Matriz de Respuesta por Organismo (6 Cols) */}
      <section aria-label="Capacidad y despliegue por organismo" className="col-span-12 lg:col-span-6 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Capacidad y Despliegue por Organismo
          </h3>
          <span className="text-[10px] font-bold text-slate-500">Datos del backend</span>
        </div>

        <div className="space-y-3">
          {responseMatrix.map((item) => (
            <div key={item.team} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-800 dark:text-slate-200">{item.team}</span>
                <span className="text-slate-500 font-mono">{item.state} ({item.progress}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-full"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
          {responseMatrix.length === 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400" role="status">
              No se recibieron métricas de organismos.
            </p>
          )}
        </div>

        {/* Visión Regional por Zonas de Maturín */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Estadísticas Regionales de Monitoreo
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {zoneStats.map((z) => (
              <div key={z.zone} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{z.zone}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white leading-tight block mt-1">
                  {z.incidents}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 block">
                  {z.resolve} resolución
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resumen Ejecutivo & Señales Críticas (6 Cols) */}
      <section aria-label="Resumen ejecutivo y SLAs de operación" className="col-span-12 lg:col-span-6 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Resumen Ejecutivo & SLAs de Operación
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Datos del backend</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {executiveSummary.map((sum) => (
            <div key={sum.label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">{sum.label}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white mt-1 block">
                {sum.value}
              </span>
            </div>
          ))}
          {executiveSummary.length === 0 && (
            <p className="col-span-2 text-sm text-slate-500 dark:text-slate-400" role="status">
              No se recibió un resumen ejecutivo.
            </p>
          )}
        </div>

        {/* Estado de Enlaces y Auditoría */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Telemetría de Red y Servicios Críticos
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {systemStatus.map((st) => (
              <div key={st.label} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">{st.label}</span>
                <span className={`font-bold text-[11px] ${st.tone}`}>{st.state}</span>
              </div>
            ))}
            {systemStatus.length === 0 && (
              <p className="col-span-2 text-sm text-slate-500 dark:text-slate-400" role="status">
                El estado de los servicios no está disponible desde el backend.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
