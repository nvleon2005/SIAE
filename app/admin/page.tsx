"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/src/modules/auth/auth-store";
import { Activity, Globe2, BarChart3, Users } from "lucide-react";
import { DashboardHeader } from "@/src/features/dashboard-metrics/components/DashboardHeader";
import { DashboardHudMetrics } from "@/src/features/dashboard-metrics/components/DashboardHudMetrics";
import { DashboardOperationsTab } from "@/src/features/dashboard-metrics/components/DashboardOperationsTab";
import { DashboardMapTab } from "@/src/features/dashboard-metrics/components/DashboardMapTab";
import { DashboardKpisTab } from "@/src/features/dashboard-metrics/components/DashboardKpisTab";
import { DashboardPersonalTab } from "@/src/features/dashboard-metrics/components/DashboardPersonalTab";
import {
  initialIncidents,
  initialOperators,
  initialQueue,
  initialUnits,
  filterConfigs,
} from "@/src/features/dashboard-metrics/data";
import { DashboardIncident, LiveMetricsData } from "@/src/features/dashboard-metrics/types";

function mapIncident(value: unknown): DashboardIncident {
  if (typeof value !== "object" || value === null) {
    throw new Error("El servidor devolvió un incidente con formato inválido.");
  }

  const incident = value as Record<string, unknown>;
  if (typeof incident.id !== "string" || !incident.id) {
    throw new Error("El servidor devolvió un incidente sin identificador.");
  }

  const type = typeof incident.tipificacion === "object" && incident.tipificacion !== null
    ? (incident.tipificacion as Record<string, unknown>).label
    : incident.type;
  const location = typeof incident.ubicacion_incidente === "object" && incident.ubicacion_incidente !== null
    ? incident.ubicacion_incidente as Record<string, unknown>
    : null;
  const lat = Number(location?.lat);
  const lng = Number(location?.lng);
  const organizations = Array.isArray(incident.organismos)
    ? incident.organismos.filter((organization): organization is string => typeof organization === "string")
    : [];

  return {
    id: incident.id,
    title: typeof type === "string" ? type : "Emergencia",
    region: typeof location?.direccion === "string"
      ? location.direccion
      : typeof incident.location === "string" ? incident.location : "Ubicación no disponible",
    priority: typeof incident.priority === "string" ? incident.priority : "Sin prioridad",
    eta: typeof incident.eta === "string" ? incident.eta : "",
    description: typeof incident.description === "string" ? incident.description : "",
    status: typeof incident.estado === "string"
      ? incident.estado
      : typeof incident.status === "string" ? incident.status : "Sin estado",
    teams: organizations,
    ...(Number.isFinite(lat) && Number.isFinite(lng) ? { coords: { latitude: String(lat), longitude: String(lng) } } : {}),
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  // Redirección inteligente según el rol operativo:
  // - Operador PSAP -> /operador
  // - Despachador CAD -> /despachador
  // - Intérprete LSV -> /admin/cint
  // - Admin y Supervisor -> Permanecen en /admin (Dashboard Principal de Mando)
  useEffect(() => {
    if (isAuthenticated && pathname === "/admin") {
      const r = (user?.role || "").toLowerCase();
      if (r === "operador" || r === "operator") {
        router.replace("/operador");
      } else if (r === "despachador" || r === "dispatcher") {
        router.replace("/despachador");
      } else if (r === "interprete_lsv" || r === "interprete_lse") {
        router.replace("/admin/cint");
      }
    }
  }, [isAuthenticated, user?.role, pathname, router]);

  // Pestaña activa del panel de control
  const [activeTab, setActiveTab] = useState<"operaciones" | "mapa" | "kpis" | "personal">("operaciones");
  const [liveMetrics, setLiveMetrics] = useState<LiveMetricsData | null>(null);
  const [incidents, setIncidents] = useState<DashboardIncident[]>(initialIncidents);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsResponse, incidentsResponse] = await Promise.all([
          fetch("/v1/metricas"),
          fetch("/v1/emergencias"),
        ]);
        if (!metricsResponse.ok) throw new Error(`No se pudieron cargar las métricas (${metricsResponse.status}).`);
        if (!incidentsResponse.ok) throw new Error(`No se pudieron cargar las emergencias (${incidentsResponse.status}).`);
        const [metrics, emergencyData] = await Promise.all([metricsResponse.json(), incidentsResponse.json()]);
        if (!Array.isArray(emergencyData.emergencias)) {
          throw new Error("El servidor devolvió una lista de emergencias inválida.");
        }
        setLiveMetrics(metrics);
        setIncidents(emergencyData.emergencias.map(mapIncident));
        setDashboardError(null);
      } catch (fetchError) {
        setLiveMetrics(null);
        setIncidents([]);
        setDashboardError(fetchError instanceof Error ? fetchError.message : "No se pudieron cargar los datos del panel.");
      }
    };
    void fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("Todo");

  const filteredIncidents = useMemo(() => {
    const predicate = filterConfigs[activeFilter] ?? filterConfigs.Todo;
    return incidents.filter(predicate);
  }, [activeFilter, incidents]);

  const selectedIncident = useMemo(
    () => filteredIncidents.find((incident) => incident.id === selectedIncidentId) ?? filteredIncidents[0],
    [filteredIncidents, selectedIncidentId],
  );

  return (
    <div className="flex-1 w-full bg-[var(--background)] text-[var(--foreground)] flex flex-col h-full min-h-0 overflow-hidden font-sans transition-colors">
      {/* Barra superior de mando: Identidad institucional y accesos directos */}
      <DashboardHeader />

      {/* HUD Horizontal compacto: 4 Métricas clave en tiempo real */}
      <DashboardHudMetrics liveMetrics={liveMetrics} />

      {/* Barra de pestañas estratégicas de supervisión y mando */}
      <nav aria-label="Secciones del panel operativo" className="border-b border-[var(--card-border)] bg-[var(--card-bg)] px-4 flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab("operaciones")}
          aria-pressed={activeTab === "operaciones"}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition -mb-[1px] cursor-pointer ${
            activeTab === "operaciones"
              ? "border-[var(--accent)] text-[var(--accent)] dark:border-sky-400 dark:text-sky-300 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Monitoreo & Incidentes Activos</span>
          <span className="rounded-full bg-[var(--accent)]/15 text-[var(--accent)] dark:bg-sky-500/25 dark:text-sky-300 px-1.5 py-0.2 text-[10px] font-black">
            {filteredIncidents.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("mapa")}
          aria-pressed={activeTab === "mapa"}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition -mb-[1px] cursor-pointer ${
            activeTab === "mapa"
              ? "border-[var(--accent)] text-[var(--accent)] dark:border-sky-400 dark:text-sky-300 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Globe2 className="h-4 w-4" />
          <span>Mapa de Emergencias & Cuadrantes de Paz</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("kpis")}
          aria-pressed={activeTab === "kpis"}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition -mb-[1px] cursor-pointer ${
            activeTab === "kpis"
              ? "border-[var(--accent)] text-[var(--accent)] dark:border-sky-400 dark:text-sky-300 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Rendimiento, Zonas & SLAs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          aria-pressed={activeTab === "personal"}
          className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition -mb-[1px] cursor-pointer ${
            activeTab === "personal"
              ? "border-[var(--accent)] text-[var(--accent)] dark:border-sky-400 dark:text-sky-300 font-extrabold"
              : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Puestos Operativos & ACD (sin datos)</span>
        </button>
      </nav>

      {/* Cuerpo principal multi-pestaña */}
      <main className="flex-1 min-h-0 overflow-y-auto p-4 w-full">
        {dashboardError && (
          <p className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {dashboardError}
          </p>
        )}
        {activeTab === "operaciones" && (
          selectedIncident ? (
            <DashboardOperationsTab
              filteredIncidents={filteredIncidents}
              selectedIncident={selectedIncident}
              selectedIncidentId={selectedIncidentId ?? selectedIncident.id}
              onSelectIncidentId={setSelectedIncidentId}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />
          ) : (
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-sm text-slate-600 dark:text-slate-300" role="status">
              No hay emergencias activas en la respuesta del backend.
            </div>
          )
        )}

        {activeTab === "mapa" && (
          <DashboardMapTab
            selectedIncident={selectedIncident}
            units={initialUnits}
          />
        )}

        {activeTab === "kpis" && <DashboardKpisTab />}

        {activeTab === "personal" && (
          <DashboardPersonalTab
            operators={initialOperators}
            queue={initialQueue}
          />
        )}
      </main>
    </div>
  );
}
