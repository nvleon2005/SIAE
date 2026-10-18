import React from "react";
import {
  Inbox,
  Navigation,
  CheckCircle2,
  Radio,
} from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface CadExpedientListProps {
  activeTab: "bandeja" | "ruta" | "cerrados";
  setActiveTab: (tab: "bandeja" | "ruta" | "cerrados") => void;
  bandejaExpedientes: DemandaItem[];
  enRuta: DemandaItem[];
  expedientesCerrados: DemandaItem[];
  selectedItem?: DemandaItem;
  onSelect: (id: string) => void;
  priorityBadge: (priority: string) => string;
}

export function CadExpedientList({
  activeTab,
  setActiveTab,
  bandejaExpedientes,
  enRuta,
  expedientesCerrados,
  selectedItem,
  onSelect,
  priorityBadge,
}: CadExpedientListProps) {
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Pestañas de la lista */}
      <div
        className="border-b border-[var(--card-border)] bg-white/90 dark:bg-slate-900/90 px-5 flex items-center gap-1 shrink-0 backdrop-blur-xs"
        role="tablist"
        aria-label="Secciones de despacho"
      >
        {(
          [
            { id: "bandeja" as const, label: "Bandeja de Incidentes", count: bandejaExpedientes.length, icon: <Inbox className="h-3.5 w-3.5" /> },
            { id: "ruta" as const, label: "En Ruta", count: enRuta.length, icon: <Navigation className="h-3.5 w-3.5" /> },
            { id: "cerrados" as const, label: "Cerrados", count: expedientesCerrados.length, icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-3 text-xs font-bold border-b-2 transition -mb-[1px] cursor-pointer ${
              activeTab === tab.id
                ? "border-[var(--accent)] text-[var(--accent)] dark:border-sky-400 dark:text-sky-300"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  activeTab === tab.id
                    ? "bg-[var(--accent)]/15 text-[var(--accent)] dark:bg-sky-500/25 dark:text-sky-300"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenedor de la lista */}
      <section
        className="flex flex-col flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden mt-4"
        aria-label={
          activeTab === "bandeja"
            ? "Bandeja de incidentes"
            : activeTab === "ruta"
            ? "Unidades en ruta"
            : "Expedientes cerrados"
        }
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 shrink-0">
          <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            {activeTab === "bandeja" && (
              <>
                <Radio className="h-4 w-4 text-amber-600 dark:text-amber-400 animate-pulse" /> Incidentes CAD
              </>
            )}
            {activeTab === "ruta" && (
              <>
                <Navigation className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Unidades en Ruta
              </>
            )}
            {activeTab === "cerrados" && (
              <>
                <CheckCircle2 className="h-4 w-4 text-slate-500 dark:text-slate-400" /> Cerrados
              </>
            )}
          </h2>
          <span className="rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
            {activeTab === "bandeja" && `${bandejaExpedientes.length}`}
            {activeTab === "ruta" && `${enRuta.length}`}
            {activeTab === "cerrados" && `${expedientesCerrados.length}`}
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800" role="list">
          {activeTab === "bandeja" &&
            bandejaExpedientes.map((item, index) => {
              const isSelected = item.id === selectedItem?.id;
              const hasDispatch = item.status === "Despachada";
              return (
                <div
                  key={`${item.id}-${index}`}
                  role="listitem"
                  tabIndex={0}
                  onClick={() => onSelect(item.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(item.id);
                  }}
                  className={`p-3.5 transition cursor-pointer select-none flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-l-[3px] border-l-[var(--accent)] bg-[var(--accent)]/10 dark:bg-sky-500/15"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-[3px] border-l-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`rounded-md px-2 py-1 text-xs font-black uppercase tracking-wider shrink-0 ${priorityBadge(
                        item.priority
                      )}`}
                    >
                      {item.priority}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white shrink-0">
                          {item.id}
                        </span>
                        {item.requiresLse && (
                          <span className="rounded bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                            LSV
                          </span>
                        )}
                        {hasDispatch && (
                          <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-1.5 py-0.5 text-[10px] font-bold shrink-0 flex items-center gap-1">
                            <Navigation className="h-2.5 w-2.5" /> En ruta
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.type}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                        {item.caller} · {item.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      {item.wait}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.status === "Despachada"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}

          {activeTab === "ruta" &&
            (enRuta.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400 dark:text-slate-600">
                <Navigation className="h-8 w-8 opacity-40" />
                <p className="text-xs font-medium">No hay unidades en ruta en este momento</p>
              </div>
            ) : (
              enRuta.map((item, index) => {
                const isSelected = item.id === selectedItem?.id;
                return (
                  <div
                    key={`${item.id}-${index}`}
                    role="listitem"
                    tabIndex={0}
                    onClick={() => onSelect(item.id)}
                    className={`p-3.5 transition cursor-pointer select-none flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-l-[3px] border-l-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 shrink-0">
                        <Navigation className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          {item.id}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {item.type}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{item.location}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                      En Ruta
                    </span>
                  </div>
                );
              })
            ))}

          {activeTab === "cerrados" &&
            (expedientesCerrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400 dark:text-slate-600">
                <CheckCircle2 className="h-8 w-8 opacity-40" />
                <p className="text-xs font-medium">No hay expedientes cerrados en este turno</p>
              </div>
            ) : (
              expedientesCerrados.map((item, index) => {
                const isSelected = item.id === selectedItem?.id;
                return (
                  <div
                    key={`${item.id}-${index}`}
                    role="listitem"
                    tabIndex={0}
                    onClick={() => onSelect(item.id)}
                    className={`p-3.5 transition cursor-pointer select-none flex items-center justify-between gap-3 ${
                      isSelected
                        ? "border-l-[3px] border-l-slate-400 bg-slate-100/60 dark:bg-slate-800/40"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-l-[3px] border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <span className="font-mono text-xs font-bold text-slate-500">{item.id}</span>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                          {item.type}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{item.location}</p>
                      </div>
                    </div>
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold">
                      Cerrado
                    </span>
                  </div>
                );
              })
            ))}
        </div>
      </section>
    </div>
  );
}
