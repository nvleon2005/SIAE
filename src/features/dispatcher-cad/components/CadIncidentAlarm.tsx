import React from "react";
import { BellRing, BellOff, ChevronRight } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface CadIncidentAlarmProps {
  urgentUnassigned: DemandaItem;
  alertDismissedForId: string | null;
  onDismiss: (id: string) => void;
  onSelectAndManage: (id: string) => void;
}

export function CadIncidentAlarm({
  urgentUnassigned,
  alertDismissedForId,
  onDismiss,
  onSelectAndManage,
}: CadIncidentAlarmProps) {
  if (alertDismissedForId === urgentUnassigned.id) return null;

  return (
    <aside
      role="alert"
      aria-live="assertive"
      className="border-b border-rose-500/50 bg-rose-700 text-white px-4 py-1.5 shadow-sm transition-all shrink-0 z-30"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-1 rounded-md bg-white/20 flex items-center justify-center shrink-0">
            <BellRing className="h-3.5 w-3.5 animate-pulse" />
          </span>
          <div className="flex items-center gap-2 truncate text-xs">
            <span className="font-black uppercase tracking-wider bg-black/40 text-amber-300 px-1.5 py-0.5 rounded text-[11px] shrink-0">
              {urgentUnassigned.priority} · {urgentUnassigned.id}
            </span>
            <span className="font-bold truncate text-white">
              {urgentUnassigned.type} — {urgentUnassigned.location}
            </span>
            <span className="font-mono text-rose-200 text-[11px] shrink-0 font-bold">
              (Espera: {urgentUnassigned.wait})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onDismiss(urgentUnassigned.id)}
            className="rounded-lg border border-white/30 bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
          >
            <BellOff className="h-3 w-3" /> Silenciar
          </button>
          <button
            type="button"
            onClick={() => onSelectAndManage(urgentUnassigned.id)}
            className="rounded-lg bg-white hover:bg-slate-100 text-rose-800 px-3 py-1 text-xs font-black shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <span>GESTIONAR</span>
            <ChevronRight className="h-3.5 w-3.5 text-rose-700" />
          </button>
        </div>
      </div>
    </aside>
  );
}
