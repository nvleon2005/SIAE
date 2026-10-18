import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardOperator, DashboardQueueItem } from "../types";
import { liveCalls } from "../data";

interface DashboardPersonalTabProps {
  operators: DashboardOperator[];
  queue: DashboardQueueItem[];
}

export function DashboardPersonalTab({ operators, queue }: DashboardPersonalTabProps) {
  return (
    <div className="grid grid-cols-12 gap-4 h-full min-h-[580px]">
      {/* Operadores de Guardia (6 Cols) */}
      <section aria-label="Operadores en turno C4" className="col-span-12 lg:col-span-6 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Operadores en Turno C4
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-bold">
            {operators.length > 0 ? `${operators.filter((o) => o.status === "Disponible").length} Disponibles` : "Sin datos"}
          </span>
        </div>

        <div className="flex-1 p-3 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
          {operators.map((op) => (
            <div key={op.name} className="py-2.5 first:pt-0 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300">
                  {op.name.charAt(0)}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">{op.name}</span>
                  <span className="text-[11px] text-slate-500">{op.shift} · Ext. {op.ext}</span>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  op.status === "Disponible"
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300"
                    : op.status === "En atención"
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300"
                }`}
              >
                {op.status}
              </span>
            </div>
          ))}
          {operators.length === 0 && (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400" role="status">
              No se recibieron datos de turnos desde el backend.
            </p>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
          <Link
            href="/admin/usuarios"
            className="font-bold text-[var(--accent)] hover:underline flex items-center justify-between"
          >
            <span>Gestionar Roles y Puestos Operativos</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* Cola ACD & Llamadas en Directo (6 Cols) */}
      <section aria-label="Cola ACD y tráfico de llamadas en directo" className="col-span-12 lg:col-span-6 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Cola ACD y Tráfico en Vivo
          </span>
          <span className="font-mono text-xs font-bold text-amber-600">
            {queue.length > 0 ? `${queue.length} en espera` : "Sin datos"}
          </span>
        </div>

        <div className="flex-1 p-3 space-y-3 overflow-y-auto">
          <div className="space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Llamadas en Cola de Espera:
            </span>
            <div className="space-y-1 text-xs">
              {queue.map((q) => (
                <div
                  key={q.caller}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                >
                  <div>
                    <strong className="text-slate-900 dark:text-white font-bold">{q.caller}</strong>
                    <span className="text-slate-500 text-[11px] block">{q.type} · Canal: {q.channel}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs font-bold text-rose-600 block">Espera {q.wait}</span>
                    <span className="text-[10px] font-bold text-amber-700">{q.priority}</span>
                  </div>
                </div>
              ))}
              {queue.length === 0 && (
                <p className="p-3 text-sm text-slate-500 dark:text-slate-400" role="status">
                  El backend no proporcionó datos de la cola ACD.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Comunicaciones en Atención Directa:
            </span>
            <div className="space-y-1 text-xs">
              {liveCalls.map((call) => (
                <div
                  key={call.caller}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{call.caller}</span>
                    <span className="text-[11px] text-slate-500 block">{call.operator} · {call.channel}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-xs text-sky-600 font-bold block">{call.duration}</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">{call.status}</span>
                  </div>
                </div>
              ))}
              {liveCalls.length === 0 && (
                <p className="p-3 text-sm text-slate-500 dark:text-slate-400" role="status">
                  No se recibieron comunicaciones en curso.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
          <Link
            href="/operador"
            className="font-bold text-[var(--accent)] hover:underline flex items-center justify-between"
          >
            <span>Ir a Consola del Operador de Triaje</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
