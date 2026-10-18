import React from "react";
import { BellRing, ShieldAlert, Clock, BellOff, Phone } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface UrgentAlarmBannerProps {
  urgentUnassigned: DemandaItem;
  onDismissAlert: (demandId: string) => void;
  onAnswerCall: (demand: DemandaItem) => void;
}

export function UrgentAlarmBanner({
  urgentUnassigned,
  onDismissAlert,
  onAnswerCall,
}: UrgentAlarmBannerProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="border-b border-rose-500/40 bg-rose-800 text-white px-5 py-2.5 shadow-md transition-all shrink-0"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="p-2 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0">
            <BellRing className="h-5 w-5 animate-bounce" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-black/30 text-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>LLAMADA 911 ENTRANTE · {urgentUnassigned.priority} CRÍTICA</span>
              </span>
              <span className="text-sm font-mono font-bold text-white flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Espera: {urgentUnassigned.wait} (Meta &lt; 10s)</span>
              </span>
            </div>
            <p className="text-sm font-black text-white truncate mt-0.5">
              {urgentUnassigned.id} · {urgentUnassigned.type}
            </p>
            <p className="text-xs text-white font-semibold truncate">
              {urgentUnassigned.caller} · {urgentUnassigned.location} · Canal: {urgentUnassigned.channel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onDismissAlert(urgentUnassigned.id)}
            className="rounded-xl border border-white/60 bg-black/60 hover:bg-black/80 text-white px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BellOff className="h-3.5 w-3.5" />
            <span>Silenciar Alerta</span>
          </button>
          <button
            type="button"
            onClick={() => onAnswerCall(urgentUnassigned)}
            className="rounded-xl bg-white hover:bg-slate-100 text-rose-700 hover:text-rose-800 px-4 py-2 text-xs font-black shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Phone className="h-4 w-4 text-rose-600 animate-pulse" />
            <span>CONTESTAR INMEDIATAMENTE</span>
          </button>
        </div>
      </div>
    </div>
  );
}
