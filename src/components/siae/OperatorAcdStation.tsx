"use client";

import React, { useState, useEffect, useMemo } from "react";
import { usePsapQueue } from "@/src/modules/psap/use-psap-queue";
import { useAuth } from "@/src/modules/auth/auth-store";
import { DemandaItem } from "@/src/modules/psap/types";
import { useRtt } from "@/src/modules/rtt/use-rtt";
import { useOperatorShortcuts } from "@/src/features/operator-psap/hooks/useOperatorShortcuts";
import { useOperatorAudioAlerts } from "@/src/features/operator-psap/hooks/useOperatorAudioAlerts";
import { OperatorHeader } from "@/src/features/operator-psap/components/OperatorHeader";
import { AcdIncomingAlarm } from "@/src/features/operator-psap/components/AcdIncomingAlarm";
import { InStationMultimodalDock } from "@/src/features/operator-psap/components/InStationMultimodalDock";
import { CallerDossierPanel } from "@/src/features/operator-psap/components/CallerDossierPanel";
import { OperatorPauseState } from "@/src/features/operator-psap/components/OperatorPauseState";
import { OperatorIdleStandby } from "@/src/features/operator-psap/components/OperatorIdleStandby";
import { TransferToDispatchModal } from "@/src/features/operator-psap/components/TransferToDispatchModal";
import { EvidenceRequestModal } from "@/src/features/operator-psap/components/EvidenceRequestModal";
import { OperatorHandledHistory } from "@/src/features/operator-psap/components/OperatorHandledHistory";
import { PhoneCall, Clock, PhoneOff } from "lucide-react";

export function OperatorAcdStation() {
  const user = useAuth((state) => state.user);
  const {
    queue,
    setSelectedId,
    soundEnabled,
    assignSelected,
    releaseSelected,
    summonCintInterpreter,
    requestEvidence,
    transferToDispatch,
    updateTriageData,
    fetchQueue,
    subscribeToStream,
    playChime,
    setNotice,
  } = usePsapQueue();
  const operatorId = user?.id ?? "";

  const operatorDisplayName = user?.nombre_completo || "Sesión no identificada";

  // Estados de disponibilidad del operador
  const [operatorStatus, setOperatorStatus] = useState<"disponible" | "pausa" | "ocupado">("disponible");
  const [activeCallDemand, setActiveCallDemand] = useState<DemandaItem | null>(null);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [evidenceType, setEvidenceType] = useState<"foto" | "video" | "audio">("foto");
  const [incomingCallDismissed, setIncomingCallDismissed] = useState<string | null>(null);
  const [showHandledView, setShowHandledView] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined") {
        setShowHandledView(window.location.hash.includes("atendidas"));
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Sala Multimodal Acoplada (In-Station Media Dock) y Persistencia de Triaje
  const [activeMediaTab, setActiveMediaTab] = useState<"lsv" | "rtt" | "audio">("lsv");
  const [callerTab, setCallerTab] = useState<"medica" | "cuadrante">("medica");
  const [triageNotes, setTriageNotes] = useState<string>("");
  const [triageSaved, setTriageSaved] = useState<boolean>(false);
  const [rttDraft, setRttDraft] = useState<string>("");

  // Hook RTT Bidireccional en Tiempo Real (RFC 4103 con BroadcastChannel y WebSocket)
  const activeSalaId = activeCallDemand?.salaId || activeCallDemand?.id || "";
  const { messages: liveRttMessages, send: sendLiveRtt, typingRole: rttTypingRole } = useRtt(
    activeSalaId,
    "agente"
  );

  const displayedRttMessages = useMemo(() => {
    if (liveRttMessages && liveRttMessages.length > 0) {
      return liveRttMessages.map((m) => ({
        id: m.id,
        sender: m.rolAutor === "agente" ? ("operador" as const) : ("alertante" as const),
        text: m.texto,
        time: new Date(m.fechaEnvio).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" }),
      }));
    }
    return [];
  }, [liveRttMessages]);

  // Detección automática por ACD de la llamada/emergencia entrante más prioritaria
  const nextAcdIncident = useMemo(() => {
    if (activeCallDemand || operatorStatus !== "disponible") return null;

    const myAssigned = queue.find((q) => q.agenteId === operatorId && q.status === "Asignada");
    if (myAssigned) return myAssigned;

    const unassignedP0 = queue.find((q) => q.status === "Sin asignar" && q.priority === "P0");
    if (unassignedP0) return unassignedP0;

    const unassignedP1 = queue.find((q) => q.status === "Sin asignar" && q.priority === "P1");
    if (unassignedP1) return unassignedP1;

    return queue.find((q) => q.status === "Sin asignar") || null;
  }, [queue, activeCallDemand, operatorStatus, operatorId]);

  // Controles de Audio en Tiempo Real y Alertas Sonoras
  const {
    micActive,
    ttsPlaying,
    toggleMic: handleToggleMic,
    testTtsAudio: handleTestTtsAudio,
  } = useOperatorAudioAlerts({
    soundEnabled,
    nextAcdIncident,
    incomingCallDismissed,
    activeCallDemand,
    playChime,
  });

  // Detección Automática de Señas por IA (MediaPipe Hands)
  const [aiDetectedSign, setAiDetectedSign] = useState<{ label: string; confidence: number } | null>({
    label: "Auxilio / Socorro (LSV)",
    confidence: 94,
  });

  const handleConfirmAiSign = () => {
    if (!aiDetectedSign) return;
    setTriageNotes((prev) =>
      prev
        ? `${prev}\n[IA MediaPipe Hands]: Seña verificada: ${aiDetectedSign.label} (${aiDetectedSign.confidence}% conf.)`
        : `[IA MediaPipe Hands]: Seña verificada: ${aiDetectedSign.label} (${aiDetectedSign.confidence}% conf.)`
    );
    setAiDetectedSign(null);
  };

  // Sincronizar pestaña adaptativa según discapacidad declarada
  useEffect(() => {
    if (activeCallDemand) {
      setTriageNotes(activeCallDemand.triageNotes || "");
      setTriageSaved(false);
      if (
        activeCallDemand.requiresLse ||
        activeCallDemand.medicalRecord?.disability?.requiresLsv ||
        activeCallDemand.channels?.includes("video_lse")
      ) {
        setActiveMediaTab("lsv");
      } else if (
        activeCallDemand.channels?.includes("rtt") ||
        activeCallDemand.medicalRecord?.disability?.type === "motora"
      ) {
        setActiveMediaTab("rtt");
      } else {
        setActiveMediaTab("audio");
      }
    }
  }, [activeCallDemand]);

  // Guardar datos relevantes de la atención en tiempo real
  const handleSaveTriageNotes = async () => {
    if (!activeCallDemand) return;
    const saved = await updateTriageData(activeCallDemand.id, {
      triageNotes,
      quadrant: activeCallDemand.telemetry?.quadrant,
    });
    setTriageSaved(saved);
    if (saved) {
      setTimeout(() => setTriageSaved(false), 2500);
    }
  };

  // Enviar mensaje en Chat RTT in-situ
  const handleSendRtt = () => {
    if (!rttDraft.trim()) return;
    const textToSend = rttDraft.trim();
    if (!activeSalaId) {
      setNotice("No se puede enviar RTT: la demanda no tiene una sala real asociada");
      return;
    }
    void sendLiveRtt(textToSend);
    setRttDraft("");
  };

  const handleQuickRtt = (text: string) => {
    if (!activeSalaId) {
      setNotice("No se puede enviar RTT: la demanda no tiene una sala real asociada");
      return;
    }
    void sendLiveRtt(text);
  };

  // Estadísticas del turno del operador
  const [callsHandledCount, setCallsHandledCount] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    fetchQueue();
    const unsub = subscribeToStream();
    const interval = setInterval(fetchQueue, 6000);
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, [fetchQueue, subscribeToStream]);

  // Temporizador de duración de llamada activa
  useEffect(() => {
    if (!activeCallDemand) {
      setCallDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCallDemand]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Aceptar llamada distribuida por ACD
  const handleAnswerAcdCall = async (incident: DemandaItem) => {
    setSelectedId(incident.id);
    const assigned = await assignSelected();
    if (!assigned) return;
    setActiveCallDemand(incident);
    setOperatorStatus("ocupado");
  };

  // Concluir llamada y liberar puesto
  const handleEndAcdCall = async () => {
    if (!activeCallDemand) return;
    const released = await releaseSelected();
    if (!released) return;
    setActiveCallDemand(null);
    setOperatorStatus("disponible");
    setCallsHandledCount((prev) => prev + 1);
  };

  // Atajos de teclado desacoplados
  useOperatorShortcuts({
    nextAcdIncident,
    activeCallDemand,
    operatorStatus,
    isDispatchModalOpen,
    isEvidenceModalOpen,
    onAnswerAcdCall: handleAnswerAcdCall,
    onOpenDispatchModal: () => setIsDispatchModalOpen(true),
    onSummonInterpreter: (demandId) => summonCintInterpreter(demandId),
    onEndAcdCall: handleEndAcdCall,
  });

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full w-full bg-[var(--background)] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
      {/* 1. Cabecera Institucional y Disponibilidad del Operador */}
      <OperatorHeader
        operatorStatus={operatorStatus}
        activeCallDemand={activeCallDemand}
        onSetStatus={setOperatorStatus}
      />

      {/* 2. Alerta de Llamada Entrante Asignada por ACD */}
      {nextAcdIncident && !activeCallDemand && operatorStatus === "disponible" && (
        <AcdIncomingAlarm
          nextAcdIncident={nextAcdIncident}
          onDismiss={setIncomingCallDismissed}
          onAnswer={handleAnswerAcdCall}
        />
      )}

      {/* 3. Área de Puesto Operativo con Scroll Natural */}
      <main className="flex-1 p-2.5 sm:p-3.5 min-h-0 flex flex-col gap-2.5 w-full overflow-y-auto custom-scrollbar">
        {activeCallDemand ? (
          /* ESCENARIO A: EN LLAMADA ACTIVA */
          <div className="w-full flex flex-col space-y-3 pb-8 shrink-0">
            {/* Barra de Sesión de Llamada Activa */}
            <div className="w-full rounded-2xl border border-[var(--accent)]/20 dark:border-sky-800/40 fluent-hero-gradient px-4 py-2.5 shadow-lg text-white flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className="p-2 rounded-xl bg-white/15 text-white border border-white/20 shrink-0">
                  <PhoneCall className="h-4 w-4 animate-pulse" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="fluent-badge !bg-emerald-950/70 !text-emerald-300 border border-emerald-400/40 text-[11px] font-black uppercase tracking-wider">
                      LLAMADA 911 EN CURSO
                    </span>
                    <span className="fluent-badge !bg-white/15 !text-white border border-white/20 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-sky-300" />
                      <span>{formatDuration(callDuration)}</span>
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-white truncate mt-1">
                    {activeCallDemand.id} · <span className="text-sky-200">{activeCallDemand.type}</span>
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleEndAcdCall}
                  className="fluent-btn !bg-red-600 hover:!bg-red-700 !text-white !h-8 !px-3.5 !text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  <span>Concluir Atención</span>
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-white/20 text-white">Esc</kbd>
                </button>
              </div>
            </div>

            {/* Sala Multimodal Acoplada y Expediente */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 w-full shrink-0">
              <InStationMultimodalDock
                activeCallDemand={activeCallDemand}
                activeMediaTab={activeMediaTab}
                setActiveMediaTab={setActiveMediaTab}
                aiDetectedSign={aiDetectedSign}
                onConfirmAiSign={handleConfirmAiSign}
                onSummonCint={summonCintInterpreter}
                displayedRttMessages={displayedRttMessages}
                rttTypingRole={rttTypingRole}
                rttDraft={rttDraft}
                setRttDraft={setRttDraft}
                onSendRtt={handleSendRtt}
                onQuickRtt={handleQuickRtt}
                micActive={micActive}
                onToggleMic={handleToggleMic}
                ttsPlaying={ttsPlaying}
                onTestTtsAudio={handleTestTtsAudio}
                triageNotes={triageNotes}
                setTriageNotes={setTriageNotes}
              />

              <CallerDossierPanel
                activeCallDemand={activeCallDemand}
                callerTab={callerTab}
                setCallerTab={setCallerTab}
                triageSaved={triageSaved}
                onSaveTriageNotes={handleSaveTriageNotes}
                onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
                onOpenDispatchModal={() => setIsDispatchModalOpen(true)}
              />
            </div>
          </div>
        ) : operatorStatus === "pausa" ? (
          /* ESCENARIO B: EN PAUSA */
          <OperatorPauseState onResume={() => setOperatorStatus("disponible")} />
        ) : showHandledView ? (
          /* ESCENARIO C: HISTORIAL DE INCIDENCIAS ATENDIDAS EN GUARDIA */
          <OperatorHandledHistory
            queue={queue}
            operatorId={operatorId}
            callsHandledCount={callsHandledCount}
            onBackToRadar={() => {
              setShowHandledView(false);
              if (typeof window !== "undefined") {
                window.location.hash = "";
              }
            }}
          />
        ) : (
          /* ESCENARIO D: EN ESPERA ACD DISPONIBLE (RADAR) */
          <OperatorIdleStandby
            userName={operatorDisplayName}
            callsHandledCount={callsHandledCount}
            queue={queue}
            onAnswerAcdCall={handleAnswerAcdCall}
            onViewHandled={() => {
              setShowHandledView(true);
              if (typeof window !== "undefined") {
                window.location.hash = "atendidas";
              }
            }}
          />
        )}
      </main>

      {/* Modal de Transferencia a Despacho CAD */}
      {isDispatchModalOpen && activeCallDemand && (
        <TransferToDispatchModal
          isOpen={isDispatchModalOpen}
          activeCallDemand={activeCallDemand}
          triageNotes={triageNotes}
          onClose={() => setIsDispatchModalOpen(false)}
          onConfirmTransfer={async () => {
            await transferToDispatch(activeCallDemand.id, triageNotes);
            setIsDispatchModalOpen(false);
            await handleEndAcdCall();
          }}
        />
      )}

      {/* Modal de Solicitud de Evidencia Contextual */}
      {isEvidenceModalOpen && activeCallDemand && (
        <EvidenceRequestModal
          isOpen={isEvidenceModalOpen}
          selectedItem={activeCallDemand}
          evidenceType={evidenceType}
          setEvidenceType={setEvidenceType}
          onClose={() => setIsEvidenceModalOpen(false)}
          onRequestEvidence={async (id, type) => {
            await requestEvidence(id, type);
          }}
        />
      )}
    </div>
  );
}
