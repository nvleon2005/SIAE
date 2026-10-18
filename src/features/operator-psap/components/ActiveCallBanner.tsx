import React from "react";
import { PhoneCall, Clock, Mic, MicOff, Languages, ArrowRightLeft, PhoneOff } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface ActiveCallBannerProps {
  callSession: {
    active: boolean;
    demandId: string;
    elapsedSeconds: number;
    isMuted: boolean;
  };
  selectedItem?: DemandaItem;
  onToggleMute: () => void;
  onSummonCint: (demandId: string) => void;
  onTransferToDispatch: (demandId: string) => void;
  onEndCall: () => void;
  formatCallDuration: (seconds: number) => string;
}

export function ActiveCallBanner({
  callSession,
  selectedItem,
  onToggleMute,
  onSummonCint,
  onTransferToDispatch,
  onEndCall,
  formatCallDuration,
}: ActiveCallBannerProps) {
  return (
    <aside
      role="region"
      aria-label="Llamada de emergencia en curso"
      className="border-b border-emerald-500/50 bg-[#0c2238] dark:bg-[#071625] text-white px-5 py-2.5 shadow-md shrink-0 transition-all"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <PhoneCall className="h-5 w-5 animate-pulse" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>EN LÍNEA CON ALERTANTE · {callSession.demandId}</span>
              </span>
              <span className="text-sm font-mono font-bold text-emerald-200 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Duración: {formatCallDuration(callSession.elapsedSeconds)}</span>
              </span>
            </div>
            <p className="text-sm font-black text-white truncate mt-0.5">
              {selectedItem?.caller || "María L. (V-18.492.102)"} · {selectedItem?.type || "Médico · Dolor torácico agudo"}
            </p>
            <p className="text-xs text-slate-300 font-medium truncate">
              Canal: {selectedItem?.channel || "LSV + RTT"} · Sector: {selectedItem?.location || "Maturín Centro"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              callSession.isMuted
                ? "bg-rose-500/20 text-rose-300 border-rose-400/40"
                : "bg-white/10 text-white border-white/20 hover:bg-white/20"
            }`}
          >
            {callSession.isMuted ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : <Mic className="h-3.5 w-3.5" />}
            <span>{callSession.isMuted ? "Mic Silenciado" : "Silenciar Mic"}</span>
          </button>

          <button
            type="button"
            onClick={() => onSummonCint(callSession.demandId)}
            className="rounded-xl border border-sky-400/40 bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Languages className="h-3.5 w-3.5 text-sky-300" />
            <span>Sumar CINT LSV</span>
          </button>

          <button
            type="button"
            onClick={() => onTransferToDispatch(callSession.demandId)}
            className="rounded-xl border border-amber-400/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 px-3 py-1.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowRightLeft className="h-3.5 w-3.5 text-amber-300" />
            <span>Transferir a Despacho CAD</span>
          </button>

          <button
            type="button"
            onClick={onEndCall}
            className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-black shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneOff className="h-3.5 w-3.5" />
            <span>Concluir Atención</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
