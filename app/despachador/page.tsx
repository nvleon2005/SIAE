"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/modules/auth/auth-store";
import { usePsapQueue } from "@/src/modules/psap/use-psap-queue";
import { useCadExpedients } from "@/src/features/dispatcher-cad/hooks/useCadExpedients";
import { CloseExpedientModal } from "@/src/features/dispatcher-cad/components/CloseExpedientModal";
import { CadIncidentAlarm } from "@/src/features/dispatcher-cad/components/CadIncidentAlarm";
import { CadHeader } from "@/src/features/dispatcher-cad/components/CadHeader";
import { CadExpedientList } from "@/src/features/dispatcher-cad/components/CadExpedientList";
import { CadDetailWorkspace } from "@/src/features/dispatcher-cad/components/CadDetailWorkspace";
import { Radio, Layers } from "lucide-react";

// Roles autorizados para esta consola táctica (Aislamiento estricto de roles)
const DISPATCHER_ROLES = new Set(["despachador", "dispatcher", "supervisor", "admin"]);

export default function DespachadorPage() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  // Guard de rol: solo despachador, supervisor, admin
  useEffect(() => {
    if (isAuthenticated && user && !DISPATCHER_ROLES.has(user.role ?? "")) {
      router.replace(user.role === "operador" ? "/operador" : "/");
    }
  }, [isAuthenticated, user, router]);

  const {
    queue,
    selectedId,
    setSelectedId,
    soundEnabled,
    setSoundEnabled,
    fetchQueue,
    subscribeToStream,
    playChime,
    notice,
  } = usePsapQueue();
  // Estado local y Hooks de Dominio Desacoplados
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"bandeja" | "ruta" | "cerrados">("bandeja");
  const [alertDismissedForId, setAlertDismissedForId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<"despacho" | "triaje" | "flotas" | "bitacora">("despacho");
  const [showQueueList, setShowQueueList] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash.includes("mapa")) {
          setDetailTab("despacho");
          setTimeout(() => {
            document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" });
          }, 150);
        } else if (window.location.hash.includes("cerrados")) {
          setActiveTab("cerrados");
          setShowQueueList(true);
        } else if (window.location.hash.includes("entes")) {
          setDetailTab("flotas");
        }
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // Expedientes y reloj oficial HLV
  const {
    closeModal,
    setCloseModal,
    hlvTime,
  } = useCadExpedients();

  // Carga y suscripción
  useEffect(() => {
    fetchQueue();
    const unsub = subscribeToStream();
    const interval = setInterval(fetchQueue, 10000);
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [fetchQueue, subscribeToStream]);

  // Bandeja: expedientes transferidos por operadores
  const bandejaExpedientes = useMemo(() => {
    return queue.filter((item) => item.status !== "Cerrada");
  }, [queue]);

  const expedientesCerrados = useMemo(() => {
    return queue.filter((item) => item.status === "Cerrada");
  }, [queue]);

  const selectedItem = useMemo(() => {
    const src = activeTab === "cerrados" ? expedientesCerrados : bandejaExpedientes;
    return src.find((i) => i.id === selectedId) ?? src[0] ?? null;
  }, [bandejaExpedientes, expedientesCerrados, selectedId, activeTab]);

  const enRuta = useMemo(() => {
    return queue.filter((item) => item.status === "Despachada");
  }, [queue]);

  // Alerta emergencia urgente
  const urgentUnassigned = useMemo(() => {
    return bandejaExpedientes.find(
      (item) => item.status === "Sin asignar" && (item.priority === "P0" || item.priority === "P1")
    );
  }, [bandejaExpedientes]);

  useEffect(() => {
    if (!soundEnabled || !urgentUnassigned || alertDismissedForId === urgentUnassigned.id) return;
    const interval = setInterval(() => {
      playChime(urgentUnassigned.priority === "P0");
    }, 4000);
    return () => clearInterval(interval);
  }, [soundEnabled, urgentUnassigned, alertDismissedForId, playChime]);

  // Prioridad color helpers
  const priorityBadge = (p: string) => {
    if (p === "P0") return "bg-red-700 text-white animate-pulse";
    if (p === "P1")
      return "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800";
    if (p === "P2")
      return "bg-yellow-50 dark:bg-yellow-950/60 text-yellow-900 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800";
    return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700";
  };

  return (
    <div className="flex-1 bg-[var(--background)] text-[var(--foreground)] flex flex-col font-sans transition-colors h-full min-h-0 overflow-hidden">
      {/* Alerta de incidente urgente sin gestionar */}
      {urgentUnassigned && (
        <CadIncidentAlarm
          urgentUnassigned={urgentUnassigned}
          alertDismissedForId={alertDismissedForId}
          onDismiss={setAlertDismissedForId}
          onSelectAndManage={(id) => {
            setSelectedId(id);
            setActiveTab("bandeja");
            setShowQueueList(false); // Foco completo e inmediato en el nuevo incidente
          }}
        />
      )}

      {/* Cabecera principal CAD con selector de bandeja y enlace externo */}
      <CadHeader
        bandejaCount={bandejaExpedientes.length}
        enRutaCount={enRuta.length}
        cerradosCount={expedientesCerrados.length}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        hlvTime={hlvTime}
        showQueueList={showQueueList}
        onToggleQueueList={() => setShowQueueList(!showQueueList)}
      />

      {/* Banner de aviso */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="border-b border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/40 px-4 py-1 text-center text-xs font-bold text-[var(--accent)] dark:text-sky-300 shrink-0"
        >
          {notice}
        </div>
      )}

      {/* Contenido principal: Modo Enfoque Puro (100% Pantalla) o Modo Dividido */}
      <div className="flex-1 p-4 min-h-0 overflow-hidden w-full flex flex-col">
        {showQueueList ? (
          /* Modo Dividido: Lista a la izquierda (4 cols) y Espacio Táctico a la derecha (8 cols) */
          <div className="grid grid-cols-12 gap-4 h-full min-h-0 overflow-hidden w-full">
            <div className="col-span-12 lg:col-span-4 flex flex-col h-full min-h-0">
              <CadExpedientList
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                bandejaExpedientes={bandejaExpedientes}
                enRuta={enRuta}
                expedientesCerrados={expedientesCerrados}
                selectedItem={selectedItem ?? undefined}
                onSelect={(id) => {
                  setSelectedId(id);
                }}
                priorityBadge={priorityBadge}
              />
            </div>
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full min-h-0">
              <CadDetailWorkspace
                selectedItem={selectedItem ?? undefined}
                mounted={mounted}
                detailTab={detailTab}
                setDetailTab={setDetailTab}
                priorityBadge={priorityBadge}
                onOpenCloseModal={(demandId) => setCloseModal({ open: true, demandId })}
              />
            </div>
          </div>
        ) : selectedItem ? (
          /* Modo Enfoque Total: 100% del Ancho de Pantalla dedicado a la Articulación Táctica Inmediata */
          <div className="flex-1 h-full min-h-0 flex flex-col overflow-hidden">
            <CadDetailWorkspace
              selectedItem={selectedItem}
              mounted={mounted}
              detailTab={detailTab}
              setDetailTab={setDetailTab}
              priorityBadge={priorityBadge}
              onOpenCloseModal={(demandId) => setCloseModal({ open: true, demandId })}
            />
          </div>
        ) : (
          /* Estación de Espera Táctica CAD: Libre de Distracción con Detección Automática */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md">
            <div className="relative flex items-center justify-center">
              <span className="absolute w-28 h-28 rounded-full bg-sky-500/10 animate-ping duration-1000" />
              <span className="absolute w-20 h-20 rounded-full bg-emerald-500/15 animate-pulse" />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 border border-white/20">
                <Radio className="h-8 w-8 text-white" />
              </div>
            </div>

            <div className="max-w-md space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/70 border border-sky-300 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-black uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                <span>Puesto CAD en Guardia Táctica Activa</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Consola Lista para Despacho Inmediato
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tan pronto como un operador transfiere una demanda triada, la notificación sonora y la ficha técnica se desplegarán inmediatamente en este puesto a pantalla completa.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQueueList(true)}
                className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:opacity-90 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Layers className="h-4 w-4" />
                <span>Explorar Bandeja de Incidentes ({bandejaExpedientes.length})</span>
              </button>

              <a
                href="/admin"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Consultar la cola de todas las incidencias en el menú administrativo general"
              >
                <span>Cola General en Menú</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Cierre de Expediente */}
      <CloseExpedientModal
        isOpen={closeModal.open}
        demandId={closeModal.demandId}
        onClose={() => setCloseModal({ open: false, demandId: null })}
      />
    </div>
  );
}
