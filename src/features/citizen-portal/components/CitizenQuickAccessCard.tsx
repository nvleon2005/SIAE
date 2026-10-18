import React from "react";
import Link from "next/link";
import { User, ShieldAlert, History, Settings, BadgeCheck } from "lucide-react";

export function CitizenQuickAccessCard() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
      {/* Accesos Rápidos */}
      <div className="lg:col-span-8 fluent-card p-5 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">
            Accesos Rápidos del Solicitante
          </p>
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/perfil"
              className="flex items-center gap-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition"
            >
              <User className="h-3.5 w-3.5" />
              <span>Mi Ficha Completa</span>
            </Link>
            <Link
              href="/camino-seguro"
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
              <span>Camino Seguro</span>
            </Link>
            <Link
              href="/historial"
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <History className="h-3.5 w-3.5 text-slate-400" />
              <span>Historial de Incidentes</span>
            </Link>
            <Link
              href="/ajustes"
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" />
              <span>Ajustes y Accesibilidad</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Red de Auxilio VEN 911 */}
      <div className="lg:col-span-4 fluent-card p-5 bg-gradient-to-br from-slate-50 to-sky-50/60 dark:from-slate-900/80 dark:to-sky-950/30 border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 shrink-0">
            <BadgeCheck className="h-4.5 w-4.5" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Centro de Comando VEN 911</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Sede Maturín &middot; Monagas</p>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Cuadrante de Paz:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Asignación Directa</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-200/60 dark:border-slate-800/60 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Operatividad:</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Activo 24 Horas
            </span>
          </div>
          <div className="flex items-center justify-between py-1 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">Canales RTT / LSV:</span>
            <span className="font-bold text-sky-700 dark:text-sky-300">Prioridad Asistida</span>
          </div>
        </div>
      </div>
    </div>
  );
}
