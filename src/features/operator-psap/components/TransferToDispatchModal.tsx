import React from "react";
import { ArrowRightLeft, X } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface TransferToDispatchModalProps {
  isOpen: boolean;
  activeCallDemand: DemandaItem;
  triageNotes: string;
  onClose: () => void;
  onConfirmTransfer: () => Promise<void>;
}

export function TransferToDispatchModal({
  isOpen,
  activeCallDemand,
  triageNotes,
  onClose,
  onConfirmTransfer,
}: TransferToDispatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
      <div className="fluent-acrylic w-full max-w-lg rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 bg-white/95 dark:bg-slate-900/95">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-xs">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Derivar Expediente a Despacho CAD
              </h3>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                Pase de guardia directo hacia la mesa de coordinación táctica
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Aviso Doctrinal VEN 911 */}
        <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-3 text-xs text-sky-900 dark:text-sky-200">
          <span className="font-bold block mb-0.5">Mando Operativo CAD:</span>
          <p className="text-[11px] leading-relaxed">
            El despachador CAD recibirá este expediente en su tablero táctico para evaluar la disponibilidad de cuadrillas en el cuadrante, contactar a los entes de respuesta (Policía, Bomberos, Ambulancias, PCAD) y monitorear sus tiempos de arribo (ETA).
          </p>
        </div>

        {/* Resumen del Triaje */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {activeCallDemand.caller} · {activeCallDemand.type}
            </span>
            <span className="fluent-badge font-bold !bg-red-600 !text-white text-[10px]">
              {activeCallDemand.priority}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            <strong>Ubicación:</strong> {activeCallDemand.location} ({activeCallDemand.telemetry?.quadrant || "Cuadrante no informado"})
          </p>
          {triageNotes && (
            <div className="pt-1 border-t border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Observaciones Clínicas / Triaje:</span>
              <p className="text-[11px] italic text-slate-700 dark:text-slate-300 mt-0.5 bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                &quot;{triageNotes}&quot;
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="fluent-btn fluent-btn-subtle !h-8 !px-3.5 !text-xs font-semibold cursor-pointer"
          >
            Volver al Triaje
          </button>
          <button
            type="button"
            onClick={onConfirmTransfer}
            className="fluent-btn fluent-btn-accent !h-8 !px-4 !text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            <span>Confirmar Transferencia y Liberar Puesto</span>
          </button>
        </div>
      </div>
    </div>
  );
}
