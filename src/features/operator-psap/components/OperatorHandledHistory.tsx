"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  ArrowLeft,
  Clock,
  MapPin,
  FileText,
  Search,
  Filter,
  ArrowRightLeft,
  ShieldCheck,
  Phone,
  UserCheck,
} from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface OperatorHandledHistoryProps {
  queue: DemandaItem[];
  operatorId: string;
  callsHandledCount: number;
  onBackToRadar: () => void;
}

export function OperatorHandledHistory({
  queue,
  operatorId,
  callsHandledCount,
  onBackToRadar,
}: OperatorHandledHistoryProps) {
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("TODAS");

  // Filtra las incidencias que ya fueron atendidas por operadores o derivadas a despacho
  const handledItems = useMemo(() => {
    return queue.filter((item) => {
      const isHandled =
        item.status === "Despachada" ||
        item.status === "Cerrada" ||
        Boolean(item.transferredToDispatch) ||
        item.agenteId === operatorId ||
        Boolean(item.triageNotes);

      if (!isHandled) return false;

      if (priorityFilter !== "TODAS" && item.priority !== priorityFilter) {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesId = item.id.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        const matchesCaller = item.caller.toLowerCase().includes(q);
        const matchesLoc = item.location.toLowerCase().includes(q);
        return matchesId || matchesType || matchesCaller || matchesLoc;
      }

      return true;
    });
  }, [queue, operatorId, priorityFilter, search]);

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "P0":
        return "bg-red-600 text-white border-red-500";
      case "P1":
        return "bg-amber-500 text-slate-950 border-amber-400";
      case "P2":
        return "bg-blue-600 text-white border-blue-500";
      default:
        return "bg-slate-600 text-white border-slate-500";
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-3 min-h-0">
      {/* Cabecera del Panel Integrado */}
      <div className="fluent-hero-gradient rounded-2xl border border-[var(--accent)]/20 p-4 text-white shadow-lg flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToRadar}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition cursor-pointer text-white"
            title="Volver al puesto de atención inmediata"
            aria-label="Volver al puesto de atención inmediata"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="fluent-badge !bg-emerald-950/60 !text-emerald-300 border border-emerald-400/30 text-[10px] uppercase font-bold">
                HISTORIAL DE GUARDIA · PUESTO OPERADOR
              </span>
              <span className="text-xs text-sky-200 font-mono">
                {callsHandledCount} registradas
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Incidencias Atendidas y Derivadas a Despacho CAD
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToRadar}
          className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al Puesto de Guardia</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="fluent-card p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <div className="relative w-full max-w-sm">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ID, alertante, tipo o ubicación..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Prioridad:</span>
          {(["TODAS", "P0", "P1", "P2"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                priorityFilter === p
                  ? "bg-[var(--accent)] text-white dark:bg-sky-600 shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Expedientes Atendidos */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-0">
        {handledItems.length === 0 ? (
          <div className="fluent-card p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto opacity-70" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No hay incidencias atendidas registradas con los filtros actuales
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Cada llamada atendida que completes o transfieras a la Consola CAD quedará registrada aquí en tu guardia con su nota clínica y sello de derivación, sin tener que abrir pestañas externas.
            </p>
            <button
              type="button"
              onClick={onBackToRadar}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold shadow-sm hover:opacity-90 transition cursor-pointer"
            >
              Ir a Puesto de Atención Inmediata
            </button>
          </div>
        ) : (
          handledItems.map((item) => (
            <div
              key={`handled-${item.id}`}
              className="fluent-card p-4 space-y-3 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${priorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                  <span className="font-mono font-black text-sm text-slate-900 dark:text-white">
                    {item.id}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    · {item.type}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
                    <ArrowRightLeft className="h-3 w-3" />
                    Derivada a Despacho CAD
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="h-3 w-3" />
                    {item.createdAt ? new Date(item.createdAt).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }) : "Hace momentos"}
                  </span>
                </div>
              </div>

              {/* Datos del Alertante y Cuadrante */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Phone className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                  <span className="font-semibold">{item.caller}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    ({item.medicalRecord?.emergencyContact?.phone || item.channel})
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 sm:col-span-2">
                  <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </div>
              </div>

              {/* Nota de Triaje */}
              {item.triageNotes && (
                <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-2.5 text-xs text-slate-800 dark:text-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5 flex items-center gap-1">
                    <FileText className="h-3 w-3 text-sky-500" />
                    Nota Clínica de Triaje Registrada:
                  </span>
                  <p className="font-medium text-xs leading-relaxed">{item.triageNotes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
