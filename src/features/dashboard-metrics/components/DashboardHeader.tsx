import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="fluent-acrylic border-b border-slate-200/80 dark:border-slate-800 px-3.5 sm:px-4 py-1.5 sm:py-2 shrink-0 z-20 backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] font-black text-white shadow-xs">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#32577a] dark:text-sky-400 block leading-tight">
                REPÚBLICA BOLIVARIANA DE VENEZUELA · VEN 911 MATURÍN (MONAGAS)
              </span>
            </div>
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-[var(--accent-hover)] dark:text-white truncate flex items-center gap-2">
              Panel Operativo Corporativo · Consola Estratégica VEN 911
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[var(--accent)] dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2 py-0.2 text-[9.5px] font-black uppercase tracking-wide">
                Administrador General SIAE
              </span>
            </h1>
          </div>
        </div>

        {/* Indicador Central y Accesos rápidos del Administrador */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 text-xs">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/40 px-3 py-1 text-xs font-semibold text-[var(--accent)] dark:text-sky-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>Centro de Mando 24/7</span>
          </div>

          <Link
            href="/admin/usuarios"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:border-sky-300 hover:text-[var(--accent)] font-semibold transition shadow-2xs"
          >
            👥 Usuarios
          </Link>
          <Link
            href="/admin/cuadrantes"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:border-sky-300 hover:text-[var(--accent)] font-semibold transition shadow-2xs"
          >
            🗺️ Cuadrantes
          </Link>
          <Link
            href="/admin/organismos"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:border-sky-300 hover:text-[var(--accent)] font-semibold transition shadow-2xs"
          >
            🚒 Organismos
          </Link>
          <Link
            href="/admin/auditoria"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:border-sky-300 hover:text-[var(--accent)] font-semibold transition shadow-2xs"
          >
            🔐 Auditoría no disponible
          </Link>
          <Link
            href="/admin/tipificaciones"
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:border-sky-300 hover:text-[var(--accent)] font-semibold transition shadow-2xs"
          >
            🏷️ Catálogo & SLAs
          </Link>
          <Link
            href="/operador"
            className="rounded-xl bg-gradient-to-r from-[#163f66] to-[#1e5a8a] hover:opacity-95 text-white px-3 py-1 font-bold transition shadow-xs flex items-center gap-1"
          >
            <span>⚡ Consola PSAP</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
