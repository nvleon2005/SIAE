import React from "react";
import Link from "next/link";
import {
  MapPin,
  Clock,
  PhoneCall,
  ExternalLink,
  CheckCircle,
  Send,
  Languages,
  AlertTriangle,
  Zap,
  Users,
  HeartPulse,
  Battery,
  Camera,
  MessageSquareText,
  ArrowRightLeft,
  Phone,
} from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";
import { CuadranteSelector } from "@/src/components/siae/CuadranteSelector";
import { AuditUnavailableNotice } from "@/src/components/siae/AuditUnavailableNotice";

export interface PsapIncidentDossierProps {
  selectedItem: DemandaItem;
  mounted: boolean;
  activeRole: string;
  activePsap: { nombre: string } | null;
  onOpenInStationRoom: (item: DemandaItem) => void;
  onOpenDispatchModal: () => void;
  onAssignSelected: () => void;
  onReleaseSelected: () => void;
  onSummonCint: (id: string) => void;
  onOpenEvidenceModal: () => void;
  onTransferToDispatch: (id: string) => void;
}

export function PsapIncidentDossier({
  selectedItem,
  mounted,
  activeRole,
  activePsap,
  onOpenInStationRoom,
  onOpenDispatchModal,
  onAssignSelected,
  onReleaseSelected,
  onSummonCint,
  onOpenEvidenceModal,
  onTransferToDispatch,
}: PsapIncidentDossierProps) {
  return (
    <div className="space-y-4">
      {/* Encabezado Principal del Incidente & Acciones de Atención Directa */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">{selectedItem.id}</h2>
            <span className="rounded-md bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900 font-bold text-xs px-2.5 py-0.5 uppercase">
              {selectedItem.priority}
            </span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">· {selectedItem.type}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <p className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>Ubicación: {selectedItem.coords ? `${selectedItem.coords.lat.toFixed(4)}, ${selectedItem.coords.lng.toFixed(4)}` : "No disponible"}</span>
            </p>
            <span className="font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Espera: {selectedItem.wait} (Meta &lt; 10s)</span>
            </span>
            <span
              suppressHydrationWarning
              className="font-mono text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
            >
              HLV: {mounted ? new Date(selectedItem.createdAt).toLocaleTimeString("es-VE", { timeZone: "America/Caracas", hour12: false }) : "--:--:--"}
            </span>
          </div>
        </div>

        {/* Botones Primarios de Operación Inmediata */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onOpenInStationRoom(selectedItem)}
            className="h-10 rounded-xl bg-[#0f6cbd] hover:bg-[#115ea3] px-4 text-xs font-bold text-white shadow-xs transition flex items-center gap-2 cursor-pointer"
            title="Atender sala multimodal en consola sin perder el contexto de la estación"
          >
            <PhoneCall className="h-4 w-4" />
            <span>Atender en Sala (En Vivo)</span>
          </button>
          <Link
            href={`/sala/${selectedItem.id}?role=agente`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 text-xs font-medium shadow-2xs transition flex items-center gap-1.5"
            title="Abrir sala en ventana externa independiente para monitor secundario"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Abrir sala (externa)</span>
          </Link>

          {/* Estado de Remisión / Despacho cuando ya fue transferida */}
          {selectedItem.status === "Despachada" ? (
            <span className="h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>🚨 Despachada</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenDispatchModal}
              className="h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-4 text-xs font-bold shadow-2xs transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <span>Despacho directo</span>
            </button>
          )}
        </div>
      </div>

      {/* Estado de Remisión cuando la demanda ya fue transferida a CAD */}
      {selectedItem.status === "Despachada" && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <CheckCircle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Despachada · Remitida a Despacho CAD</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                El triaje prehospitalario fue transferido a la mesa de despacho CAD. El operador continúa en línea con el alertante.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700 shadow-2xs">
            Triaje Concluido
          </span>
        </div>
      )}

      {/* Guía Operativa de Canal y Flujo de Atención Inmediata */}
      <div
        className={`rounded-2xl border p-3.5 flex items-start gap-3 text-xs transition-colors shadow-2xs ${
          selectedItem.requiresLse || selectedItem.channel === "rtt"
            ? "bg-sky-50/90 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/70 text-sky-950 dark:text-sky-200"
            : selectedItem.priority === "P0"
            ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/70 text-rose-950 dark:text-rose-200"
            : "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200"
        }`}
      >
        <div className="p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-current shadow-2xs shrink-0 mt-0.5">
          {selectedItem.requiresLse || selectedItem.channel === "rtt" ? (
            <Languages className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          ) : selectedItem.priority === "P0" ? (
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          ) : (
            <Zap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>
        <div className="flex-1 space-y-0.5">
          <div className="font-black flex flex-wrap items-center gap-2">
            <span>
              {selectedItem.requiresLse || selectedItem.channel === "rtt"
                ? "Apertura de Sala Obligatoria · Canal Accesible (LSV / RTT)"
                : selectedItem.priority === "P0"
                ? "Prioridad Crítica P0 · Mantener Sala para Soporte y Primeros Auxilios"
                : "Demanda Pre-tipificada y Geolocalizada · Despacho Ágil Permitido"}
            </span>
            <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-white/80 dark:bg-slate-900/80 border border-current">
              {selectedItem.requiresLse || selectedItem.channel === "rtt" ? "Interacción Requerida" : "Protocolo CAD"}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            {selectedItem.requiresLse || selectedItem.channel === "rtt"
              ? "El alertante es una persona sorda o con dificultad de habla. Abra la sala para activar RTT y enlace al intérprete CINT para triaje asistido en tiempo real."
              : selectedItem.priority === "P0"
              ? "Riesgo vital inminente detectado. El operador call-taker debe mantener la sala abierta con el alertante dando instrucciones de contención mientras transfiere a despacho CAD."
              : "La demanda cuenta con tipificación clara y coordenadas PostGIS validadas. Si el alertante no requiere contención activa, puede transferir directamente a Despacho CAD."}
          </p>
        </div>
      </div>

      {/* FICHA INTEGRAL DE TRIAJE OPERATIVO */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-4 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-[#0f6cbd] dark:text-sky-300 shadow-2xs">
              <Users className="h-4 w-4" />
            </span>
            <span className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Expediente de Triaje Prehospitalario
            </span>
          </div>
          {selectedItem.requiresLse && (
            <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 px-3 py-1 text-xs font-bold flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>Persona Sorda · Requiere LSV</span>
            </span>
          )}
        </div>

        {/* Grid de 3 Columnas Clave */}
        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          {/* Columna 1: Identidad y Contacto SOS */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/80 shadow-2xs space-y-2">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold uppercase tracking-wider">
              Identidad & Contacto SOS
            </span>
            <div>
              <p className="font-black text-slate-900 dark:text-white text-sm">
                {selectedItem.caller}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
                Cédula y Usuario Verificado
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                Contacto de Emergencia:
              </span>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                {selectedItem.medicalRecord?.emergencyContact?.name || "No informado"}
              </p>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono font-bold">
                {selectedItem.medicalRecord?.emergencyContact?.phone || "No informado"}
              </p>
            </div>
          </div>

          {/* Columna 2: Ficha Médica y Factores Críticos */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/80 shadow-2xs space-y-2">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Ficha Médica y Perfil de Accesibilidad</span>
              <HeartPulse className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            </span>
            <div className="flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Grupo Sanguíneo</span>
                <p className="font-black text-rose-600 dark:text-rose-400 text-2xl font-mono leading-none">
                  {selectedItem.medicalRecord?.bloodType || "No informado"}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Alergias Conocidas</span>
                <p className="font-bold text-slate-900 dark:text-white text-xs truncate" title={selectedItem.medicalRecord?.allergies?.join(", ") || "No informado"}>
                  {selectedItem.medicalRecord?.allergies && selectedItem.medicalRecord.allergies.length > 0
                    ? selectedItem.medicalRecord.allergies.join(", ")
                    : "No informado"}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Condición Preexistente:</span>
              <p className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate">
                {selectedItem.requiresLse
                  ? "Sordera · Requiere LSV"
                  : selectedItem.medicalRecord?.conditions?.join(", ") || "Ninguna reportada"}
              </p>
            </div>
          </div>

          {/* Columna 3: Telemetría & Coordenadas PostGIS */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/80 shadow-2xs space-y-2">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Telemetría Satelital & Dispositivo</span>
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                <Battery className="h-3.5 w-3.5" />
                {typeof selectedItem.telemetry?.batteryLevel === "number" ? `${selectedItem.telemetry.batteryLevel}% Batería` : "Batería no disponible"}
              </span>
            </span>
            <div>
              <p className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                {selectedItem.coords ? `${selectedItem.coords.lat.toFixed(4)}, ${selectedItem.coords.lng.toFixed(4)}` : "Ubicación no disponible"}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                Precisión GPS: {typeof selectedItem.coords?.accuracyM === "number" ? `±${selectedItem.coords.accuracyM.toFixed(1)}m` : "No disponible"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block mb-1">
                Cuadrante de Paz Asignado
              </span>
              <CuadranteSelector
                currentQuadrantIdOrName={selectedItem.telemetry?.quadrant}
                coords={selectedItem.coords}
                locationText={selectedItem.location}
                isEditable={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ACCIONES INMEDIATAS DEL OPERADOR */}
      <div className="space-y-3 pt-1 border-t border-slate-200/80 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-[#0f6cbd]" />
            <span>Acciones de Triaje y Derivación a Despacho</span>
          </span>
          <div className="flex items-center gap-2">
            {selectedItem.cintSummoned && (
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800 flex items-center gap-1.5">
                <Languages className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Intérprete CINT Solicitado</span>
              </span>
            )}
            {selectedItem.evidenceRequested && (
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                <span>Evidencia Requerida ({selectedItem.evidenceType || "foto"})</span>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5" role="toolbar" aria-label="Acciones inmediatas de triaje">
          {/* Botón 1: Tomar o Liberar Incidente */}
          {selectedItem.status === "Sin asignar" ? (
            <button
              type="button"
              aria-label="Tomar demanda"
              onClick={onAssignSelected}
              className="h-11 w-full rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Phone className="h-4 w-4 shrink-0" />
              <span className="truncate">Tomar Demanda</span>
            </button>
          ) : (
            <button
              type="button"
              aria-label="Liberar demanda"
              onClick={onReleaseSelected}
              className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <Phone className="h-4 w-4 shrink-0 text-slate-500" />
              <span className="truncate">Liberar Demanda</span>
            </button>
          )}

          {/* Botón 2: Sumar Intérprete CINT LSV */}
          <button
            type="button"
            onClick={() => onSummonCint(selectedItem.id)}
            className={`h-11 w-full rounded-xl border px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs ${
              selectedItem.cintSummoned || selectedItem.requiresLse
                ? "border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300"
                : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80"
            }`}
          >
            <Languages className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
            <span className="truncate">{selectedItem.cintSummoned ? "CINT Conectado" : "Sumar CINT LSV"}</span>
          </button>

          {/* Botón 3: Solicitar Evidencia */}
          <button
            type="button"
            onClick={onOpenEvidenceModal}
            aria-label="Solicitar evidencia"
            className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-3 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Camera className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">Solicitar Evidencia</span>
          </button>

          {/* Botón 4: Abrir RTT */}
          <button
            type="button"
            onClick={() => onOpenInStationRoom(selectedItem)}
            className="h-11 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 px-3 text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
            title="Abrir chat en tiempo real RTT RFC 4103 dentro de la estación"
          >
            <MessageSquareText className="h-4 w-4 shrink-0 text-slate-500" />
            <span className="truncate">Abrir RTT en Vivo</span>
          </button>

          {/* Botón 5: Transferir a Despacho CAD */}
          <button
            type="button"
            onClick={() => onTransferToDispatch(selectedItem.id)}
            aria-label="Transferir a despacho"
            className="h-11 w-full rounded-xl border border-amber-400/80 dark:border-amber-600/70 bg-amber-50 hover:bg-amber-100/90 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 text-amber-950 dark:text-amber-200 px-3 text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <ArrowRightLeft className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="truncate">Transferir a Despacho CAD</span>
          </button>
        </div>
      </div>

      {/* Mapa Operativo Satelital PostGIS y Centro Asignado */}
      <div id="mapa" className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Mapa Operativo Satelital PostGIS · Centro Responsable (PostGIS)</span>
          </h3>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {activePsap ? activePsap.nombre : "Centro responsable no disponible"}
          </span>
        </div>

        <div className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-800">
          <p>
            Sector <span className="font-sans font-bold text-slate-900 dark:text-white">{selectedItem.location || "No disponible"}</span> · {selectedItem.coords ? `Lat ${selectedItem.coords.lat.toFixed(4)} Lng ${selectedItem.coords.lng.toFixed(4)}` : "Coordenadas no disponibles"}
          </p>
          <p className="sr-only">
            Pin operativo · {selectedItem.id} · {selectedItem.coords ? `Lat ${selectedItem.coords.lat.toFixed(3)} Lng ${selectedItem.coords.lng.toFixed(3)}` : "Coordenadas no disponibles"}
          </p>
          <span className="text-emerald-700 dark:text-emerald-400 font-sans text-xs font-bold flex items-center gap-1">
            <CheckCircle className="h-3.5 w-3.5" />
            <span>{selectedItem.coords ? "Coordenadas recibidas" : "Ubicación no disponible"}</span>
          </span>
        </div>
        <span className="sr-only">Pictogramas ARASAAC</span>
      </div>

      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <AuditUnavailableNotice />
      </div>

      {/* Conectividad WebRTC / NATS en Vivo */}
      <div className="grid gap-2 sm:grid-cols-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Equipo asignado
          </h3>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Users className="h-4 w-4 text-sky-500" />
            <span>Asignación no disponible</span>
            <span className="text-slate-400 font-normal">({activeRole})</span>
          </p>
        </div>

        <div className="space-y-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Sala en curso
          </h3>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Estado de comunicación: no disponible
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
