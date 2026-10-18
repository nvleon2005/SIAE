"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RefreshCw, Inbox, Video, Languages, Clock, ArrowRight } from "lucide-react";

interface DemandaLSV {
  emergencia_id: string;
  estado: string;
  tipificacion: string;
  afectado: string;
  ubicacion_lat: number;
  ubicacion_lng: number;
  canales: string[];
  fecha_creacion: string;
  sala_id?: string;
}

function isDemandaLSV(value: unknown): value is DemandaLSV {
  if (typeof value !== "object" || value === null) return false;
  const demanda = value as Record<string, unknown>;
  return (
    typeof demanda.emergencia_id === "string" &&
    typeof demanda.estado === "string" &&
    typeof demanda.tipificacion === "string" &&
    typeof demanda.afectado === "string" &&
    typeof demanda.ubicacion_lat === "number" &&
    Number.isFinite(demanda.ubicacion_lat) &&
    typeof demanda.ubicacion_lng === "number" &&
    Number.isFinite(demanda.ubicacion_lng) &&
    Array.isArray(demanda.canales) &&
    demanda.canales.every((canal) => typeof canal === "string") &&
    typeof demanda.fecha_creacion === "string" &&
    (demanda.sala_id === undefined || typeof demanda.sala_id === "string")
  );
}

export default function AdminCintPage() {
  const { push } = useRouter();
  const [demandas, setDemandas] = useState<DemandaLSV[]>([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDemandas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/v1/cint/demandas");
      if (res.status === 403) {
        push("/");
        return;
      }
      if (!res.ok) {
        throw new Error(`No se pudieron cargar las demandas CInt (${res.status}).`);
      }
      const data: unknown = await res.json();
      if (
        typeof data !== "object" ||
        data === null ||
        !("demandas" in data) ||
        !Array.isArray(data.demandas) ||
        !data.demandas.every(isDemandaLSV)
      ) {
        throw new Error("El backend devolvió una respuesta CInt inválida.");
      }
      setDemandas(data.demandas);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las demandas CInt.");
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchDemandas();
    const interval = setInterval(fetchDemandas, 5000);
    return () => clearInterval(interval);
  }, [fetchDemandas]);

  const handleTakeCase = async (demanda: DemandaLSV) => {
    setTaking(demanda.emergencia_id);
    try {
      const res = await fetch(`/v1/cint/demandas/${demanda.emergencia_id}/asignar`, {
        method: "POST",
      });
      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || `No se pudo asignar el caso (${res.status}).`);
      }

      const response: unknown = await res.json();
      const responseRoomId =
        typeof response === "object" && response !== null
          ? "sala_id" in response && typeof response.sala_id === "string" && response.sala_id.trim()
            ? response.sala_id
            : "salaId" in response && typeof response.salaId === "string" && response.salaId.trim()
              ? response.salaId
              : "sala" in response &&
                  typeof response.sala === "object" &&
                  response.sala !== null &&
                  "id" in response.sala &&
                  typeof response.sala.id === "string" &&
                  response.sala.id.trim()
                ? response.sala.id
                : undefined
          : undefined;
      const roomId = responseRoomId ?? (demanda.sala_id?.trim() || undefined);
      if (!roomId) {
        throw new Error("El backend asignó el caso, pero no devolvió el identificador de sala necesario para conectarse.");
      }
      push(`/sala/${encodeURIComponent(roomId)}?role=agente`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al conectar caso");
    } finally {
      setTaking(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col p-4 md:p-6 transition-colors">
      {/* Cabecera Limpia Institucional */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
            <Languages className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Centro de Intermediación (CInt) · Sala LSV
              </h1>
              <span className="rounded-md bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-300 dark:border-sky-700 px-2 py-0.5 text-[10px] font-black uppercase">
                VEN 911 Monagas
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Atención inmediata en Lengua de Señas Venezolana para personas sordas (Art. 81 CRBV)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchDemandas()}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#0f6cbd]" />
            <span>Actualizar</span>
          </button>
          <Link
            href="/operador"
            className="rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-white px-4 py-2 text-xs font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <span>Puesto de Triaje</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      {error && (
        <div className="max-w-4xl mx-auto w-full mb-4">
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-800 flex items-center justify-between" role="alert">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline text-xs cursor-pointer">Cerrar</button>
          </div>
        </div>
      )}

      {/* Lista de Casos LSV en Tiempo Real */}
      <section aria-label="Cola de intermediación LSV" className="max-w-5xl mx-auto w-full flex-1">
        {loading && demandas.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent mx-auto" />
            <p className="text-xs font-bold text-slate-500 mt-3">Sincronizando solicitudes LSV...</p>
          </div>
        ) : demandas.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-xs space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0f6cbd] dark:text-sky-400 mx-auto flex items-center justify-center">
              <Inbox className="h-7 w-7" aria-hidden="true" />
            </div>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              No hay demandas LSV pendientes en cola
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Las solicitudes aparecerán cuando el backend las publique. Esta consola no genera demandas de ejemplo.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {demandas.map((d) => (
              <article
                key={d.emergencia_id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-xs hover:border-sky-500 dark:hover:border-sky-500 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-purple-50 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2.5 py-0.5 text-[10px] font-black uppercase">
                    LSV · Persona Sorda
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{timeSince(d.fecha_creacion)}</span>
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {d.tipificacion || "Emergencia con Requerimiento LSV"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Alertante: <strong>{d.afectado}</strong> · Coordenadas: {d.ubicacion_lat.toFixed(4)}, {d.ubicacion_lng.toFixed(4)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTakeCase(d)}
                  disabled={taking === d.emergencia_id}
                  className="w-full h-11 rounded-xl bg-[#0f6cbd] hover:bg-[#115ea3] text-white px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {taking === d.emergencia_id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                  <span>Conectar Sala de Interpretación LSV</span>
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function timeSince(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  if (Number.isNaN(then.getTime())) return "—";
  const seconds = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}
