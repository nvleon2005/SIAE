"use client";

import Link from "next/link";
import { useMemo, useState, useEffect, useCallback } from "react";
import { EmptyState } from "@/src/components/siae/EmptyState";
import { SkeletonEmergencyCard } from "@/src/components/siae/Skeleton";
import { MobileBottomNav } from "@/src/components/siae/MobileBottomNav";
import { AuthenticatedAppShell } from "@/src/components/siae/AuthenticatedAppShell";
import { ArrowRight, Clock, MapPin, Search, X, MessageSquare, ChevronRight } from "lucide-react";
import { AuditUnavailableNotice } from "@/src/components/siae/AuditUnavailableNotice";

interface HistorialItem {
  id: string;
  title: string;
  state: string;
  time: string;
  channel: string;
  priority: string;
  address: string;
  createdAt: string;
  rtt: { author: string; text: string }[];
}

const estadoLabels: Record<string, string> = {
  creada: "Enviada",
  localizando: "Enviada",
  encolada: "En curso",
  asignada: "En curso",
  en_llamada: "En curso",
  cerrada: "Cerrada",
  cancelada: "Cancelada",
};

function mapEstado(backend: string): string {
  return estadoLabels[backend] || backend;
}

function timeSince(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatFecha(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric" }) + " · " + d.toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
}

const filters = ["Todos", "En curso", "Enviada", "Cerrada"] as const;

export default function HistorialPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<HistorialItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<(typeof filters)[number]>("Todos");
  const [query, setQuery] = useState("");
  const [selectedEmergencyId, setSelectedEmergencyId] = useState<string | null>(null);

  const fetchHistorial = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/v1/emergencias");
      if (!res.ok) throw new Error(`No se pudo cargar el historial (${res.status}).`);
      const data = await res.json();
      if (!Array.isArray(data.emergencias)) {
        throw new Error("El servidor devolvió un historial con formato inválido.");
      }
      const mapped: HistorialItem[] = data.emergencias.map((e: any) => ({
        id: (e.id as string || "").slice(0, 8).toUpperCase(),
        title: typeof e.tipificacion === "object" && e.tipificacion !== null ? (e.tipificacion.label || "Emergencia") : (e.type || "Emergencia"),
        state: mapEstado(e.estado || e.status),
        time: timeSince(e.fecha_creacion || e.createdAt),
        channel: Array.isArray(e.canales) ? e.canales[0] || "App" : (e.channel || "App"),
        priority: e.priority || (e.estado === "en_llamada" ? "Alta" : e.estado === "cerrada" ? "Baja" : "Media"),
        address: e.ubicacion_incidente?.lat ? `${Number(e.ubicacion_incidente.lat).toFixed(4)}, ${Number(e.ubicacion_incidente.lng).toFixed(4)}` : (e.location || "Sin ubicación"),
        createdAt: formatFecha(e.fecha_creacion || e.createdAt),
        rtt: [],
      }));
      setItems(mapped);
    } catch (fetchError) {
      setItems([]);
      setError(fetchError instanceof Error ? fetchError.message : "No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistorial();
    const interval = setInterval(fetchHistorial, 10000);
    return () => clearInterval(interval);
  }, [fetchHistorial]);

  const filteredHistory = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesFilter = selectedFilter === "Todos" || item.state === selectedFilter;
      const matchesQuery = !normalized || item.title.toLowerCase().includes(normalized) || item.id.toLowerCase().includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [query, selectedFilter, items]);

  const summary = {
    total: items.length,
    active: items.filter((item) => item.state === "En curso").length,
    closed: items.filter((item) => item.state === "Cerrada" || item.state === "Cancelada").length,
  };

  const selectedEmergency = items.find((item) => item.id === selectedEmergencyId);

  return (
    <AuthenticatedAppShell>
      <main id="main-historial-content" aria-label="Historial de emergencias" className="w-full flex-1 p-3 sm:p-4 lg:p-6 bg-[var(--background)] dark:bg-slate-950 min-h-screen transition-colors text-slate-900 dark:text-slate-100 pb-24" aria-live="polite">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          
          {/* Header & KPI */}
          <div className="fluent-card p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row gap-5 items-start md:items-center justify-between border-b-4 border-b-[var(--accent)]">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <Link className="hover:text-[var(--accent)] dark:hover:text-cyan-400 transition" href="/">
                  Portal Ciudadano
                </Link>
                <span>/</span>
                <span className="text-slate-700 dark:text-slate-300">Auditoría</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Mi Historial
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">Trazabilidad oficial de tus activaciones VEN 911</p>
            </div>
            
            <div className="flex gap-3">
              <div className="px-4 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 flex flex-col items-center justify-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400">Activas</span>
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{summary.active}</span>
              </div>
              <div className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-w-[90px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Total</span>
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{summary.total}</span>
              </div>
            </div>
          </div>

          {/* Buscador y Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all shadow-sm"
                placeholder="Buscar por ID o motivo..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex overflow-x-auto gap-2 pb-1 sm:pb-0 hide-scrollbar">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedFilter === f 
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                    : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Lista tipo Tabla (Dense List) */}
          <div className="fluent-card rounded-2xl overflow-hidden shadow-xs">
            {error && (
              <p className="p-4 text-sm text-red-700 dark:text-red-300" role="alert">
                {error}
              </p>
            )}
            {loading ? (
              <div className="p-4 space-y-3">
                <SkeletonEmergencyCard />
                <SkeletonEmergencyCard />
              </div>
            ) : filteredHistory.length === 0 ? (
               <div className="p-8">
                 <EmptyState
                    title="No hay eventos"
                    description="No hay emergencias en el historial devuelto por el servidor."
                  />
               </div>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredHistory.map((item) => (
                  <li 
                    key={item.id} 
                    onClick={() => setSelectedEmergencyId(item.id)}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`shrink-0 w-1.5 h-10 rounded-full ${item.state === 'En curso' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-[var(--accent)] dark:text-cyan-400">{item.id}</span>
                          <span className="text-[10px] text-slate-500">{item.createdAt}</span>
                        </div>
                        <h2 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">{item.title}</h2>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate max-w-[200px] sm:max-w-[300px]">{item.address}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-6 sm:pl-0">
                      <div className="flex flex-col sm:items-end">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          item.state === 'En curso' 
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        }`}>
                          {item.state}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.time}
                        </span>
                      </div>
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors"
                        aria-label={`Ver detalle de ${item.id}`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Slide-over Drawer para Detalles */}
        {selectedEmergency && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div 
              className="absolute inset-0 bg-slate-900/20 dark:bg-black/40 backdrop-blur-sm transition-opacity" 
              onClick={() => setSelectedEmergencyId(null)}
            />
            <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-950 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
              
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] uppercase font-bold text-[var(--accent)] tracking-wider">Detalle de Activación</p>
                  <h2 className="text-lg font-black mt-0.5 font-mono">{selectedEmergency.id} · {selectedEmergency.title}</h2>
                </div>
                <button 
                  onClick={() => setSelectedEmergencyId(null)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Cerrar detalle"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
                
                {/* Meta Summary */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{selectedEmergency.title}</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 font-semibold mb-0.5">Estado</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200">{selectedEmergency.state}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-0.5">Prioridad</p>
                      <p className="font-medium text-red-600 dark:text-red-400">{selectedEmergency.priority}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-0.5">Creada el</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200">{selectedEmergency.createdAt}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-0.5">Canales</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200">{selectedEmergency.channel}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> Ubicación reportada
                  </h4>
                  <p className="text-sm font-medium p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    {selectedEmergency.address}
                  </p>
                </div>

                {/* RTT Chat Log */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> Conversación RTT</span>
                    <span className="text-[9px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">Sólo lectura</span>
                  </h4>
                  
                  {selectedEmergency.rtt.length > 0 ? (
                    <div className="space-y-3 mt-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 max-h-64 overflow-y-auto">
                      {selectedEmergency.rtt.map((msg, i) => (
                        <div key={i} className={`flex flex-col ${msg.author === 'Tú' ? 'items-end' : 'items-start'}`}>
                          <span className="text-[10px] font-bold text-slate-400 mb-0.5">{msg.author}</span>
                          <div className={`text-xs px-3 py-2 rounded-xl max-w-[85%] ${
                            msg.author === 'Tú' 
                            ? 'bg-[var(--accent)] text-white rounded-br-sm' 
                            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-sm'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                      No hay mensajes RTT registrados.
                    </p>
                  )}
                </div>

                {/* Sello Criptográfico Inmutable y Descarga de Acta Forense */}
                <AuditUnavailableNotice />

              </div>

              <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
                <Link
                  href={`/sala/${selectedEmergency.id}?role=ciudadano`}
                  aria-label="Abrir sala de esta emergencia"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent)] text-white font-bold text-sm hover:bg-[var(--accent-hover)] transition-colors shadow-md"
                >
                  Abrir Sala Interactiva <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </div>
        )}

        <MobileBottomNav />
      </main>
    </AuthenticatedAppShell>
  );
}
