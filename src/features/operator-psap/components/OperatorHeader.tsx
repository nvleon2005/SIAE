import React from "react";
import { ShieldAlert, Headphones, Coffee } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface OperatorHeaderProps {
  operatorStatus: "disponible" | "pausa" | "ocupado";
  activeCallDemand: DemandaItem | null;
  onSetStatus: (status: "disponible" | "pausa") => void;
}

export function OperatorHeader({
  operatorStatus,
  activeCallDemand,
  onSetStatus,
}: OperatorHeaderProps) {
  return (
    <header className="fluent-acrylic border-b border-slate-200/80 dark:border-slate-800 px-3.5 py-1.5 sm:py-2 shrink-0 z-10 transition-colors backdrop-blur-md">
      <div className="flex items-center justify-between gap-2.5">
        {/* Identidad Institucional */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] font-black text-white shadow-xs">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9.5px] sm:text-[10.5px] font-bold uppercase tracking-wider text-[#32577a] dark:text-sky-400 block leading-tight truncate">
              REPÚBLICA BOLIVARIANA DE VENEZUELA · VEN 911 MATURÍN (MONAGAS)
            </span>
            <h1 className="text-xs sm:text-sm font-black tracking-tight text-[var(--accent-hover)] dark:text-white leading-tight truncate">
              Puesto Operativo de Triaje y Atención de Emergencias
            </h1>
          </div>
        </div>

        {/* Controles de Estado del Operador y ACD */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Indicador ACD con cápsula institucional del Solicitante */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-sky-200 dark:border-sky-900/50 bg-sky-50 dark:bg-sky-950/40 px-3 py-1 text-xs font-semibold text-[var(--accent)] dark:text-sky-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
            <span>Distribución ACD Activa</span>
          </div>

          {/* Selector de Disponibilidad Compacto */}
          <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                if (activeCallDemand) return;
                onSetStatus("disponible");
              }}
              disabled={Boolean(activeCallDemand)}
              className={`fluent-btn !py-1 !px-2.5 !text-xs !rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                operatorStatus === "disponible" || operatorStatus === "ocupado"
                  ? "!bg-emerald-600 !text-white shadow-xs"
                  : "!bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Headphones className="h-3 w-3" />
              <span>{activeCallDemand ? "En Llamada" : "Disponible"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeCallDemand) return;
                onSetStatus("pausa");
              }}
              disabled={Boolean(activeCallDemand)}
              className={`fluent-btn !py-1 !px-2.5 !text-xs !rounded-md font-bold transition cursor-pointer flex items-center gap-1.5 ${
                operatorStatus === "pausa"
                  ? "!bg-amber-600 !text-white shadow-xs"
                  : "!bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Coffee className="h-3 w-3" />
              <span>Pausa</span>
            </button>
          </div>

          {/* Atajos ergonómicos de teclado */}
          <div className="hidden 2xl:flex items-center gap-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-800/80 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-700 dark:text-slate-200">Espacio</kbd>
            <span>Atender</span>
            <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-700 dark:text-slate-200">1</kbd>
            <span>CAD</span>
            <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-700 dark:text-slate-200">Esc</kbd>
            <span>Fin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
