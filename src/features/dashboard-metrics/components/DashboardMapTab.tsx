import React from "react";
import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";
import { TacticalMapLibre } from "@/src/components/siae/TacticalMapLibre";
import { DashboardIncident, DashboardUnit } from "../types";

interface DashboardMapTabProps {
  selectedIncident?: DashboardIncident;
  units: DashboardUnit[];
}

export function DashboardMapTab({ selectedIncident, units }: DashboardMapTabProps) {
  return (
    <div className="grid grid-cols-12 gap-4 h-full min-h-[580px]">
      {/* Mapa GIS Interactivo (8 Cols) */}
      <section aria-label="Geolocalización táctica y mapa de cuadrantes" className="col-span-12 lg:col-span-8 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Geolocalización Táctica AVL · Municipio Maturín
            </span>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500">
            Cuadrantes Activos: CP-01 a CP-45
          </span>
        </div>

        <div className="flex-1 p-3 min-h-[500px] flex flex-col">
          {selectedIncident?.coords ? (
            <TacticalMapLibre
              height={520}
              interactive
              emergencyLat={Number(selectedIncident.coords.latitude)}
              emergencyLng={Number(selectedIncident.coords.longitude)}
              emergencyTitle={selectedIncident.title}
              priority={selectedIncident.priority === "Alta" ? "P1" : selectedIncident.priority === "Media" ? "P2" : "P3"}
            />
          ) : (
            <p className="flex min-h-[500px] items-center justify-center rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300" role="status">
              El backend no ha proporcionado coordenadas para mostrar un incidente en el mapa.
            </p>
          )}
        </div>
      </section>

      {/* Panel de Cuadrantes & Flotas Desplegadas (4 Cols) */}
      <section aria-label="Unidades AVL en monitoreo continuo" className="col-span-12 lg:col-span-4 flex flex-col h-full rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xs overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Unidades AVL en Monitoreo
          </span>
          <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-[10px] font-bold">
            {units.length > 0 ? `${units.length} registradas` : "Sin datos AVL"}
          </span>
        </div>

        <div className="flex-1 p-3 space-y-2 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {units.map((unit) => (
            <div key={unit.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-black text-slate-900 dark:text-white">{unit.id}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">· {unit.type}</span>
                </div>
                <p className="text-[11px] text-slate-500">{unit.area}</p>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400 block">
                  ETA {unit.eta}
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                  {unit.status}
                </span>
              </div>
            </div>
          ))}
          {units.length === 0 && (
            <p className="p-4 text-sm text-slate-500 dark:text-slate-400" role="status">
              No se recibieron unidades del servicio de backend.
            </p>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-xs">
          <Link
            href="/admin/cuadrantes"
            className="font-bold text-[var(--accent)] hover:underline flex items-center justify-between"
          >
            <span>Administrar Cuadrantes de Paz</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
