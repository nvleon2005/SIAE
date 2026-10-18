import React from "react";
import {
  UserCheck,
  Languages,
  HeartPulse,
  MapPin,
  Battery,
  Check,
  Save,
  Camera,
  ArrowRightLeft,
} from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";
import { CuadranteSelector } from "@/src/components/siae/CuadranteSelector";

export interface CallerDossierPanelProps {
  activeCallDemand: DemandaItem;
  callerTab: "medica" | "cuadrante";
  setCallerTab: (tab: "medica" | "cuadrante") => void;
  triageSaved: boolean;
  onSaveTriageNotes: () => void;
  onOpenEvidenceModal: () => void;
  onOpenDispatchModal: () => void;
}

export function CallerDossierPanel({
  activeCallDemand,
  callerTab,
  setCallerTab,
  triageSaved,
  onSaveTriageNotes,
  onOpenEvidenceModal,
  onOpenDispatchModal,
}: CallerDossierPanelProps) {
  const emergencyContact = activeCallDemand.medicalRecord?.emergencyContact;

  return (
    <div className="lg:col-span-5 fluent-card p-3 flex flex-col justify-between space-y-2.5 overflow-hidden">
      <div className="space-y-2">
        {/* Fila del Alertante y Canal */}
        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent)] dark:text-sky-400 flex items-center gap-1">
              <UserCheck className="h-3 w-3" />
              <span>Expediente de Atención · Datos del Alertante</span>
            </span>
            <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight mt-0.5">
              {activeCallDemand.caller}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Canal: <strong className="text-slate-800 dark:text-slate-200">{activeCallDemand.channel}</strong> · {activeCallDemand.location}
            </p>
          </div>
          <span className="fluent-badge font-bold !bg-sky-50 dark:!bg-sky-950/60 !text-[var(--accent)] dark:!text-sky-300 text-[10px] border border-sky-200 dark:border-sky-800 shrink-0">
            {activeCallDemand.id}
          </span>
        </div>

        {activeCallDemand.requiresLse && (
          <div className="px-2.5 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 text-xs flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5 text-purple-600 shrink-0" />
            <span className="font-bold text-[11px]">Art. 81 CRBV: Persona sorda (Requiere LSV)</span>
          </div>
        )}

        <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Cuadrante de Paz Georreferenciado</span>
          <span className="text-[9px] uppercase font-mono text-amber-600 dark:text-amber-400">Solo lectura · asignación en CAD</span>
        </div>

        <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setCallerTab("medica")}
            className={`flex-1 py-1 px-2 text-[11px] rounded-md font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              callerTab === "medica"
                ? "bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <HeartPulse className="h-3 w-3 text-rose-600" />
            <span>Ficha Médica de Urgencia</span>
          </button>
          <button
            type="button"
            onClick={() => setCallerTab("cuadrante")}
            className={`flex-1 py-1 px-2 text-[11px] rounded-md font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
              callerTab === "cuadrante"
                ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <MapPin className="h-3 w-3 text-emerald-600" />
            <span>Cuadrante & GPS</span>
          </button>
        </div>

        {/* CUERPO DE PESTAÑA 1: FICHA MÉDICA */}
        {callerTab === "medica" && (
          <div className="space-y-2 text-xs animate-in fade-in">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide block">GRUPO SANGUÍNEO</span>
                <span className="inline-block mt-0.5 font-black text-white text-xs bg-red-600 px-2 py-0.5 rounded shadow-2xs">
                  {activeCallDemand.medicalRecord?.bloodType || "No informado"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide block">ALERGIAS</span>
                <span className="font-bold text-amber-700 dark:text-amber-400 text-xs block mt-0.5 truncate">
                  {activeCallDemand.medicalRecord?.allergies?.join(", ") || "No informado"}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide block">CONTACTO DE EMERGENCIA</span>
              <div className="flex items-center justify-between mt-0.5">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {emergencyContact?.name || "No informado"}
                </p>
                {emergencyContact?.phone ? (
                  <a
                    href={`tel:${emergencyContact.phone}`}
                    className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {emergencyContact.phone}
                  </a>
                ) : (
                  <span className="text-slate-500">No informado</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CUERPO DE PESTAÑA 2: CUADRANTE DE PAZ & GPS */}
        {callerTab === "cuadrante" && (
          <div className="space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">Cuadrante Asignado</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold text-[11px]">
                <Battery className="h-3 w-3" />
                {typeof activeCallDemand.telemetry?.batteryLevel === "number" ? `${activeCallDemand.telemetry.batteryLevel}% Batería` : "Batería no disponible"}
              </span>
            </div>
            <CuadranteSelector
              currentQuadrantIdOrName={activeCallDemand.telemetry?.quadrant}
              coords={activeCallDemand.coords}
              locationText={activeCallDemand.location}
              isEditable={false}
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
              <span className="font-mono">
                {activeCallDemand.coords ? `GPS: ${activeCallDemand.coords.lat.toFixed(4)}, ${activeCallDemand.coords.lng.toFixed(4)}` : "GPS no disponible"}
              </span>
              <span className="text-sky-700 font-semibold">
                {typeof activeCallDemand.coords?.accuracyM === "number" ? `Precisión ±${activeCallDemand.coords.accuracyM}m` : "Precisión no disponible"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ACCIONES INMEDIATAS: DERIVAR CAD Y EVIDENCIA */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onSaveTriageNotes}
            className={`fluent-btn fluent-btn-subtle !h-8 !px-2.5 !text-xs font-bold transition flex items-center gap-1.5 ${
              triageSaved ? "!bg-emerald-50 text-emerald-700 !border-emerald-300" : ""
            }`}
          >
            {triageSaved ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Save className="h-3.5 w-3.5 text-slate-600" />}
            <span>{triageSaved ? "Guardado en expediente" : "Guardar Triaje"}</span>
          </button>

          <button
            type="button"
            onClick={onOpenEvidenceModal}
            className="fluent-btn fluent-btn-subtle !h-8 !px-2.5 !text-xs font-bold transition flex items-center gap-1.5"
          >
            <Camera className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Evidencia</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenDispatchModal}
          className="w-full fluent-btn fluent-btn-accent !h-9 !px-3 !text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-95"
        >
          <ArrowRightLeft className="h-3.5 w-3.5 text-white shrink-0" />
          <span>Derivar a Despacho CAD</span>
          <kbd className="px-1.5 py-0.2 text-[9px] font-mono font-black rounded bg-white/30 text-white">1</kbd>
        </button>
      </div>
    </div>
  );
}
