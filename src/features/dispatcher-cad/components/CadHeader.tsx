import React from "react";
import {
  Layers,
  Lock,
  Inbox,
  Navigation,
  CheckCircle2,
  Volume2,
  VolumeX,
  Clock,
} from "lucide-react";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";

export interface CadHeaderProps {
  bandejaCount: number;
  enRutaCount: number;
  cerradosCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hlvTime: string;
  showQueueList?: boolean;
  onToggleQueueList?: () => void;
}

export function CadHeader({
  bandejaCount,
  enRutaCount,
  cerradosCount,
  soundEnabled,
  onToggleSound,
  hlvTime,
  showQueueList,
  onToggleQueueList,
}: CadHeaderProps) {
  return (
    <header className="fluent-acrylic border-b border-slate-200/80 dark:border-slate-800 px-3.5 sm:px-4 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-2.5 shrink-0 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] font-black text-white shadow-xs">
          <Layers className="h-4.5 w-4.5" />
        </div>
        <div>
          <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#32577a] dark:text-sky-400 block leading-tight">
            REPÚBLICA BOLIVARIANA DE VENEZUELA · VEN 911 MATURÍN (MONAGAS)
          </span>
          <h1 className="text-xs sm:text-sm font-black tracking-tight text-[var(--accent-hover)] dark:text-white leading-tight mt-0.5 flex items-center gap-2">
            Consola Táctica CAD — Despachador
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-[var(--accent)] dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2 py-0.2 text-[9.5px] font-black uppercase tracking-wide">
              <Lock className="h-2.5 w-2.5" />
              Mesa Táctica CAD
            </span>
            <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.2 text-[9.5px] font-bold text-slate-700 dark:text-slate-300">
              Despachador: Tte. Marcos Pérez
            </span>
            <span className="hidden lg:inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/40 text-[var(--accent)] dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-2 py-0.2 text-[9.5px] font-bold">
              Articulación Interinstitucional (Flotas & AVL)
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* KPIs en cabecera */}
        <div className="hidden xl:flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
            <Inbox className="h-3.5 w-3.5 text-[var(--accent)] dark:text-sky-400" />
            <span>{bandejaCount} en bandeja</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
            <Navigation className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{enRutaCount} en ruta</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{cerradosCount} cerrados</span>
          </span>
        </div>

        {/* Control de Alternancia de Bandeja / Enfoque de Despacho */}
        {onToggleQueueList && (
          <button
            type="button"
            onClick={onToggleQueueList}
            className={`h-9 px-3 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
              showQueueList
                ? "border-sky-400 bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-200"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            title="Alternar entre modo de atención táctica a pantalla completa y vista con lista de incidentes"
          >
            <Layers className="h-3.5 w-3.5 text-sky-500" />
            <span>{showQueueList ? "Ocultar Bandeja" : "Mostrar Bandeja"}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
              {bandejaCount}
            </span>
          </button>
        )}

        <a
          href="/admin"
          target="_blank"
          rel="noreferrer"
          className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hidden md:flex items-center gap-1 transition"
          title="Abrir la cola administrativa general en pestaña independiente"
        >
          <span>Cola General</span>
          <span>↗</span>
        </a>

        {/* Audio */}
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundEnabled}
          aria-label={soundEnabled ? "Audio alerta activo" : "Audio silenciado"}
          className={`h-9 rounded-xl border px-3 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
            soundEnabled
              ? "border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-[var(--accent)] dark:text-sky-300 font-bold"
              : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500"
          }`}
        >
          {soundEnabled ? (
            <Volume2 className="h-3.5 w-3.5 text-[var(--accent)] dark:text-sky-400" />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-slate-400" />
          )}
          <span className="hidden sm:inline">{soundEnabled ? "Audio" : "Silenciado"}</span>
        </button>

        {/* Reloj HLV */}
        <span className="h-9 rounded-xl bg-slate-900 text-sky-200 border border-slate-700 px-3 text-xs font-mono font-black flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-sky-400" />
          <span suppressHydrationWarning>{hlvTime} HLV</span>
        </span>

        <ThemeToggle />
      </div>
    </header>
  );
}
