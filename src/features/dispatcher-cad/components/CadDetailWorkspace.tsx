import React from "react";
import {
  Layers,
  MapPin,
  Clock,
  ClipboardCheck,
  CheckCircle2,
  Navigation,
  FileText,
  Building2,
  MessageSquare,
  HeartPulse,
  Battery,
} from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";
import { TacticalMapLibre } from "@/src/components/siae/TacticalMapLibre";
import { AuditUnavailableNotice } from "@/src/components/siae/AuditUnavailableNotice";
import { CadFleetBoard } from "@/src/components/siae/CadFleetBoard";

export interface CadDetailWorkspaceProps {
  selectedItem?: DemandaItem;
  mounted: boolean;
  detailTab: "despacho" | "triaje" | "flotas" | "bitacora";
  setDetailTab: (tab: "despacho" | "triaje" | "flotas" | "bitacora") => void;
  priorityBadge: (priority: string) => string;
  onOpenCloseModal: (demandId: string) => void;
}

export function CadDetailWorkspace({
  selectedItem,
  mounted,
  detailTab,
  setDetailTab,
  priorityBadge,
  onOpenCloseModal,
}: CadDetailWorkspaceProps) {
  if (!selectedItem) {
    return (
      <section
        className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-y-auto"
        aria-label="Detalle del expediente y articulación interinstitucional"
      >
        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400 dark:text-slate-600 p-8">
          <Layers className="h-16 w-16 opacity-20" />
          <div className="text-center">
            <p className="text-sm font-bold">Selecciona un expediente</p>
            <p className="text-xs mt-1">Elige un incidente de la bandeja para gestionar el despacho interinstitucional</p>
          </div>
        </div>
      </section>
    );
  }

  const isClosed = selectedItem.status === "Cerrada";

  return (
    <section
      className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-y-auto"
      aria-label="Detalle del expediente y articulación interinstitucional"
    >
      <div className="p-5 space-y-5">
        {/* Encabezado del expediente */}
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{selectedItem.id}</h2>
              <span className={`rounded-md font-black text-xs px-2.5 py-1 uppercase ${priorityBadge(selectedItem.priority)}`}>
                {selectedItem.priority}
              </span>
              <span className="text-base font-bold text-slate-800 dark:text-slate-200">· {selectedItem.type}</span>
              {isClosed && (
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 px-3 py-0.5 text-xs font-black flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Cerrado
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{selectedItem.location}</span>
                {selectedItem.coords && (
                  <span className="font-mono">
                    ({selectedItem.coords.lat.toFixed(4)}, {selectedItem.coords.lng.toFixed(4)})
                  </span>
                )}
              </p>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Espera: {selectedItem.wait}
              </span>
              <span
                className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                suppressHydrationWarning
              >
                HLV: {mounted ? new Date(selectedItem.createdAt).toLocaleTimeString("es-VE", { timeZone: "America/Caracas", hour12: false }) : "--:--:--"}
              </span>
            </div>
          </div>

          {!isClosed && (
            <button
              type="button"
              onClick={() => onOpenCloseModal(selectedItem.id)}
              className="h-10 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-4 text-xs font-black shadow-xs transition flex items-center gap-2 cursor-pointer"
            >
              <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Cerrar Expediente</span>
            </button>
          )}
        </div>

        {/* Pestañas de detalle */}
        <div
          className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl shrink-0"
          role="tablist"
          aria-label="Secciones del expediente"
        >
          {(
            [
              { id: "despacho" as const, label: "Mapa & Despacho Táctico", icon: <Navigation className="h-3.5 w-3.5" /> },
              { id: "triaje" as const, label: "Ficha de Triaje & Paciente", icon: <FileText className="h-3.5 w-3.5" /> },
              { id: "flotas" as const, label: "Entes Registrados", icon: <Building2 className="h-3.5 w-3.5" /> },
              { id: "bitacora" as const, label: "Bitácora & Coordinaciones", icon: <Clock className="h-3.5 w-3.5" /> },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={detailTab === tab.id}
              onClick={() => setDetailTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                detailTab === tab.id
                  ? "bg-[var(--accent)] text-white shadow-xs dark:bg-sky-500 dark:text-slate-950 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* CONTENIDO PESTAÑA 1: DESPACHO */}
        {detailTab === "despacho" && (
          <div className="space-y-3">
            <div id="mapa" className="w-full">
              <TacticalMapLibre
                emergencyLat={selectedItem.coords?.lat}
                emergencyLng={selectedItem.coords?.lng}
                emergencyTitle={selectedItem.type}
                priority={selectedItem.priority}
                cuadranteId={selectedItem.telemetry?.quadrant}
                height={420}
              />
            </div>

            <p
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
            >
              La coordinación con organismos y el seguimiento de unidades no
              están conectados al backend. No se simularán contactos, despachos
              ni estados de llegada.
            </p>

            <AuditUnavailableNotice />
          </div>
        )}

        {/* CONTENIDO PESTAÑA 2: TRIAJE */}
        {detailTab === "triaje" && (
          <div className="space-y-4">
            {selectedItem.triageNotes && (
              <div className="rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/80 dark:bg-sky-950/30 p-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-sky-900 dark:text-sky-300 flex items-center gap-2 mb-2">
                  <MessageSquare className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  Nota Clínica del Operador Call-Taker
                </h3>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed bg-white/60 dark:bg-slate-900/60 rounded-xl p-3 border border-sky-100 dark:border-sky-900">
                  {selectedItem.triageNotes}
                </p>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/80 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold uppercase tracking-wider">Identidad y Contacto SOS</span>
                <p className="font-black text-slate-900 dark:text-white text-sm">{selectedItem.caller}</p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">Verificado · Canal: {selectedItem.channel}</p>
                {selectedItem.medicalRecord?.emergencyContact && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Contacto de Emergencia:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.medicalRecord.emergencyContact.name}</p>
                    <p className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400">{selectedItem.medicalRecord.emergencyContact.phone}</p>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/80 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Ficha Médica</span>
                  <HeartPulse className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                </span>
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Grupo</span>
                    <p className="font-black text-rose-600 dark:text-rose-400 text-2xl font-mono leading-none">{selectedItem.medicalRecord?.bloodType ?? "N/D"}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Alergias</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate">{selectedItem.medicalRecord?.allergies?.join(", ") ?? "No registradas"}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Condición:</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedItem.requiresLse ? "Sordera · Requiere LSV" : selectedItem.medicalRecord?.conditions?.join(", ") ?? "Ninguna reportada"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900/80 space-y-2">
                <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Telemetría GPS</span>
                  <Battery className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                </span>
                {selectedItem.coords && (
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">{selectedItem.coords.lat.toFixed(4)}, {selectedItem.coords.lng.toFixed(4)}</p>
                )}
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">±{selectedItem.coords?.accuracyM?.toFixed(1) ?? "N/D"} m precisión</p>
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Cuadrante de Paz:</span>
                  <p className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {selectedItem.telemetry?.quadrant ?? "No determinado"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO PESTAÑA 3: FLOTAS Y ENTES */}
        {detailTab === "flotas" && (
          <div className="space-y-4">
            <CadFleetBoard />
          </div>
        )}

        {/* CONTENIDO PESTAÑA 4: BITÁCORA */}
        {detailTab === "bitacora" && (
          <div className="space-y-4">
            <p
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
            >
              La bitácora de coordinación no está conectada a una fuente backend
              verificable. No se muestran registros locales como eventos persistidos.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
