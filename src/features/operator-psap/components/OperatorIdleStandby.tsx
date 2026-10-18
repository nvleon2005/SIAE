import React from "react";
import { UserCheck, Headphones, Signal, PhoneCall, CheckCircle2 } from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface OperatorIdleStandbyProps {
  userName?: string;
  callsHandledCount: number;
  queue: DemandaItem[];
  onAnswerAcdCall: (item: DemandaItem) => void;
  onViewHandled?: () => void;
}

export function OperatorIdleStandby({
  userName,
  callsHandledCount,
  queue,
  onAnswerAcdCall,
  onViewHandled,
}: OperatorIdleStandbyProps) {
  const waitingDemands = queue.filter((q) => q.status === "Sin asignar");

  return (
    <div className="w-full flex flex-col gap-2.5 pb-6">
      {/* Cinta Operativa Soberana - Ancho Completo con Fluent Depth */}
      <div className="w-full rounded-2xl border border-[var(--accent)]/20 dark:border-sky-800/40 fluent-hero-gradient px-4 py-2 text-white shadow-lg flex flex-wrap items-center justify-between gap-2.5 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/20 text-white shrink-0">
            <UserCheck className="h-4 w-4 text-emerald-300" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="fluent-badge !bg-sky-950/50 !text-sky-200 border border-sky-400/30 text-[10px] uppercase tracking-wider">
                PUESTO OPERATIVO PSAP (CALL-TAKER) · MONAGAS 24/7
              </span>
              <span className="h-1 w-1 rounded-full bg-emerald-400" />
              <span className="text-[11px] font-mono text-emerald-300">RFC 4103</span>
            </div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
              {userName ? `Bienvenido, ${userName}` : "Operador"}
            </h2>
          </div>
        </div>

        {/* Fila de Estadísticas Rápidas con Chips Fluent Card */}
        <div className="flex items-center gap-2 sm:gap-3 border-t sm:border-t-0 sm:border-l border-white/20 pt-1 sm:pt-0 sm:pl-3">
          <button
            type="button"
            onClick={onViewHandled}
            className="fluent-card !bg-white/10 hover:!bg-white/20 !border-white/15 !shadow-none !rounded-xl px-2.5 py-1 text-left transition-all cursor-pointer"
            title="Ver incidencias atendidas en la guardia"
          >
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-white font-mono leading-none">{callsHandledCount}</span>
              <span className="text-[10px] sm:text-[10.5px] text-sky-200 uppercase font-bold tracking-wider">Atendidas</span>
            </div>
          </button>
          <div className="fluent-card !bg-white/10 !border-white/15 !shadow-none hover:!bg-white/15 !rounded-xl px-2.5 py-1 text-left transition-all">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-white font-mono leading-none">01:42</span>
              <span className="text-[10px] sm:text-[10.5px] text-sky-200 uppercase font-bold tracking-wider">T. Promedio</span>
            </div>
          </div>
          <div className="fluent-card !bg-white/10 !border-white/15 !shadow-none hover:!bg-white/15 !rounded-xl px-2.5 py-1 text-left transition-all">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-300 font-mono leading-none">
                {waitingDemands.length}
              </span>
              <span className="text-[10px] sm:text-[10.5px] text-sky-200 uppercase font-bold tracking-wider">En Cola</span>
            </div>
          </div>
          <div className="fluent-card !bg-white/10 !border-white/15 !shadow-none hover:!bg-white/15 !rounded-xl px-2.5 py-1 text-left transition-all hidden md:block">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-white font-mono leading-none">&lt; 280ms</span>
              <span className="text-[10px] sm:text-[10.5px] text-sky-200 uppercase font-bold tracking-wider">RTT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Central de Monitor de Escucha y Cola Inmediata */}
      <div className="fluent-card w-full p-3 sm:p-4 flex flex-col space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Headphones className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Distribución Automática de Llamadas (ACD) · Monagas
              </h3>
              <span className="text-[10px] text-slate-500">
                Canal NATS en escucha activa permanente para llamadas y demandas ciudadanas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="fluent-badge bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              PUESTO DISPONIBLE
            </span>
          </div>
        </div>

        {/* Monitor Central de Escucha Activa ACD — Optimizado Ergonómicamente */}
        <div className="flex-1 flex flex-col items-center justify-center text-center p-2 sm:p-3 space-y-2.5 my-auto">
          {/* Radar Animado Proporcionado */}
          <div className="relative flex items-center justify-center">
            <span className="absolute w-16 h-16 rounded-full bg-emerald-500/10 animate-ping duration-1000" />
            <span className="absolute w-12 h-12 rounded-full bg-sky-500/15 animate-pulse" />
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 border border-white/20">
              <Headphones className="h-5 w-5 text-white" />
            </div>
          </div>

          <div className="max-w-md space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[10.5px] font-black uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Estación en Escucha Activa · Guardia Asignada</span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
              Puesto Preparado para Atención Inmediata
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
              El motor <strong className="text-slate-800 dark:text-slate-200">ACD (Distribución Automática de Llamadas)</strong> canaliza de forma automática la próxima llamada ciudadana prioritaria con apertura <strong className="text-sky-600 dark:text-sky-400">Screen-Pop</strong>.
            </p>
            <div className="rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 p-2 text-[10.5px] text-sky-900 dark:text-sky-200 text-left">
              <span className="font-bold block text-sky-950 dark:text-sky-100 mb-0.5">Doctrina de Puesto · Operador Call-Taker:</span>
              El operador atiende la llamada/video, realiza la contención y levanta información clínica, geográfica y evidencias. Su función culmina derivando el expediente estructurado a la consola del <strong>Despachador CAD</strong>.
            </div>
          </div>

          {/* Estado de Cola Central y Acceso Separado */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <div className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-sky-500" />
              <span>Centro PSAP: <strong className="font-mono text-slate-900 dark:text-white">{waitingDemands.length}</strong> {waitingDemands.length === 1 ? "demanda en cola" : "demandas en cola"}</span>
            </div>

            <button
              type="button"
              onClick={onViewHandled}
              className="px-3 py-1 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/70 dark:hover:bg-sky-900/60 text-sky-900 dark:text-sky-200 border border-sky-300 dark:border-sky-800 text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Consultar historial de incidencias atendidas en esta guardia"
            >
              <CheckCircle2 className="h-3 w-3 text-sky-600 dark:text-sky-400" />
              <span>Incidencias Atendidas en Guardia ({callsHandledCount})</span>
            </button>
          </div>
        </div>

        {/* Barra inferior de estado de red */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10.5px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5 font-medium">
            <Signal className="h-3 w-3 text-emerald-500" />
            LiveKit WebRTC + NATS JetStream en Escucha Continua
          </span>
          <span className="font-mono text-slate-400">C4 Monagas · VEN 911</span>
        </div>
      </div>
    </div>
  );
}
