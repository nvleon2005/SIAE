import React from "react";
import { BellRing, ShieldAlert, Clock, PhoneCall } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface AcdIncomingAlarmProps {
  nextAcdIncident: DemandaItem;
  onDismiss: (id: string) => void;
  onAnswer: (incident: DemandaItem) => void;
}

export function AcdIncomingAlarm({
  nextAcdIncident,
  onDismiss,
  onAnswer,
}: AcdIncomingAlarmProps) {
  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="border-b border-rose-300/40 bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white px-4 py-2.5 shrink-0 shadow-md fluent-glow-red animate-in slide-in-from-top-2 duration-200"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="p-2 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
            <BellRing className="h-5 w-5 animate-bounce" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="fluent-badge !bg-black/40 !text-amber-300 uppercase tracking-wider text-[10px] flex items-center gap-1 border border-amber-300/30">
                <ShieldAlert className="h-3 w-3" />
                <span>LLAMADA ENTRANTE ACD · {nextAcdIncident.priority}</span>
              </span>
              <span className="fluent-badge !bg-white/10 !text-rose-100 font-mono text-[11px] flex items-center gap-1 border border-white/20">
                <Clock className="h-3 w-3" />
                <span>Espera: {nextAcdIncident.wait}</span>
              </span>
              {nextAcdIncident.requiresLse && (
                <span className="fluent-badge !bg-purple-950 !text-purple-200 uppercase text-[9px] border border-purple-400">
                  Requiere LSV (Art. 81)
                </span>
              )}
            </div>
            <h3 className="text-sm font-black text-white truncate mt-0.5">
              {nextAcdIncident.id} · {nextAcdIncident.type}
            </h3>
            <p className="text-[11px] text-rose-100 font-medium truncate">
              {nextAcdIncident.caller} · {nextAcdIncident.location} · Canal: {nextAcdIncident.channel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onDismiss(nextAcdIncident.id)}
            className="fluent-btn fluent-btn-subtle !border-white/40 !bg-white/10 hover:!bg-white/20 !text-white !h-8 !px-3 !text-xs font-bold"
          >
            Silenciar
          </button>
          <button
            type="button"
            onClick={() => onAnswer(nextAcdIncident)}
            className="fluent-btn bg-white hover:bg-slate-100 text-rose-700 hover:text-rose-800 !h-8 !px-4 !text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer scale-105 active:scale-100"
          >
            <PhoneCall className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
            <span>CONTESTAR AHORA</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] bg-rose-100 text-rose-800 rounded font-mono font-bold">Espacio</kbd>
          </button>
        </div>
      </div>
    </aside>
  );
}
