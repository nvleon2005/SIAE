import React from "react";
import Link from "next/link";
import { Clock, ArrowRight, ShieldAlert } from "lucide-react";
import { DashboardIncident } from "../types";
import { filters, responsePlan, operationalFeed } from "../data";

interface DashboardOperationsTabProps {
  filteredIncidents: DashboardIncident[];
  selectedIncident: DashboardIncident;
  selectedIncidentId: string;
  onSelectIncidentId: (id: string) => void;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function DashboardOperationsTab({
  filteredIncidents,
  selectedIncident,
  onSelectIncidentId,
  activeFilter,
  onSelectFilter,
}: DashboardOperationsTabProps) {
  return (
    <div className="grid grid-cols-12 gap-4 h-full min-h-[580px]">
      {/* Columna Izquierda: Tabla Compacta de Incidentes + Filtros (7 Cols) */}
      <section aria-label="Bandeja táctica de incidentes prioritarios" className="col-span-12 lg:col-span-7 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-[var(--card-border)] bg-slate-50/70 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Incidentes Prioritarios · Bandeja Táctica
            </h2>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              ({filteredIncidents.length} registrados)
            </span>
          </div>

          <div className="flex items-center gap-1" role="toolbar" aria-label="Filtros de incidentes">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onSelectFilter(f)}
                aria-pressed={activeFilter === f}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  activeFilter === f
                    ? "bg-[var(--accent)] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Lista tipo Tabla Operativa CAD */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--card-border)]">
          {filteredIncidents.map((inc) => {
            const isSelected = inc.id === selectedIncident.id;
            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncidentId(inc.id)}
                className={`p-3 transition cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "bg-[var(--accent)]/10 dark:bg-sky-500/15 border-l-4 border-[var(--accent)] dark:border-sky-400"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-black uppercase shrink-0 ${
                      inc.priority === "Alta"
                        ? "bg-red-600 text-white"
                        : inc.priority === "Media"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-500 text-white"
                    }`}
                  >
                    {inc.priority}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                        {inc.id}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        · {inc.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {inc.region} · {inc.teams.join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-300">
                    ETA {inc.eta}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                    {inc.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de tabla con alertas rápidas */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            Actualización periódica desde el servicio de emergencias
          </span>
          <Link
            href="/despachador"
            className="font-bold text-[var(--accent)] hover:underline flex items-center gap-1"
          >
            Abrir Mesa Táctica Despachador CAD <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>

      {/* Columna Derecha: Expediente Seleccionado + Matriz de Respuesta Inmediata (5 Cols) */}
      <section aria-label="Ficha táctica del incidente seleccionado" className="col-span-12 lg:col-span-5 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Estado del Turno · Ficha Táctica: {selectedIncident.id}
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {selectedIncident.status}
            </span>
          </div>
          {selectedIncident.coords && (
            <span className="text-xs font-mono font-bold text-slate-500">
              {selectedIncident.coords.latitude}, {selectedIncident.coords.longitude}
            </span>
          )}
        </div>

        <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              {selectedIncident.title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {selectedIncident.description}
            </p>
          </div>

          {/* Plan de Acción Inmediato */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Protocolo de Respuesta VEN 911:
            </span>
            <div className="space-y-1 text-xs">
              {responsePlan.map((step, idx) => (
                <div
                  key={step.title}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2"
                >
                  <span className="h-4 w-4 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <strong className="text-slate-900 dark:text-white block font-bold">
                      {step.title}
                    </strong>
                    <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {step.detail}
                    </span>
                  </div>
                </div>
              ))}
              {responsePlan.length === 0 && (
                <p className="text-xs text-slate-500" role="status">
                  No hay un plan de respuesta asociado en los datos del backend.
                </p>
              )}
            </div>
          </div>

          {/* Bitácora Rápida */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
              Señales del Centro de Coordinación:
            </span>
            <div className="space-y-1 text-xs font-medium">
              {operationalFeed.map((feed, i) => (
                <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="font-mono text-[10px] text-slate-400">{feed.time}</span>
                  <span className="text-[11px] truncate">{feed.text}</span>
                </div>
              ))}
              {operationalFeed.length === 0 && (
                <p className="text-xs text-slate-500" role="status">
                  No se recibieron señales operativas del backend.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Botón de intervención rápida */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
          <Link
            href="/despachador"
            className="w-full h-8 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Gestionar Despacho Inmediato para {selectedIncident.id}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
