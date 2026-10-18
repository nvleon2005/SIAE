import React from "react";
import { Coffee, Headphones } from "lucide-react";

export interface OperatorPauseStateProps {
  onResume: () => void;
}

export function OperatorPauseState({ onResume }: OperatorPauseStateProps) {
  return (
    <div className="fluent-card flex-1 w-full border-amber-200 dark:border-amber-800/60 shadow-xs flex flex-col items-center justify-center p-6 text-center min-h-0">
      <div className="max-w-md w-full flex flex-col items-center justify-center space-y-2.5 my-auto">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center shadow-inner">
          <Coffee className="h-6 w-6" />
        </div>
        <h2 className="text-sm font-black text-slate-900 dark:text-white">Puesto Operativo en Pausa</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          La distribución automática de llamadas (ACD) ha retenido temporalmente la asignación de incidentes a esta estación.
        </p>
        <div className="pt-1">
          <button
            type="button"
            onClick={onResume}
            className="fluent-btn !bg-emerald-600 hover:!bg-emerald-500 !text-white !text-xs !py-1.5 !px-4 font-bold shadow-xs inline-flex items-center gap-1.5"
          >
            <Headphones className="h-3 w-3" />
            <span>Reanudar Turno y Pasar a Disponible</span>
          </button>
        </div>
      </div>
    </div>
  );
}
