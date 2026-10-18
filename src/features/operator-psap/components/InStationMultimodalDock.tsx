import React from "react";
import {
  Zap,
  Video,
  MessageSquareText,
  PhoneCall,
  Languages,
  Sparkles,
  Send,
  Mic,
  MicOff,
  FileText,
} from "lucide-react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface InStationMultimodalDockProps {
  activeCallDemand: DemandaItem;
  activeMediaTab: "lsv" | "rtt" | "audio";
  setActiveMediaTab: (tab: "lsv" | "rtt" | "audio") => void;
  aiDetectedSign: { label: string; confidence: number } | null;
  onConfirmAiSign: () => void;
  onSummonCint: (demandId: string) => void;
  displayedRttMessages: Array<{ id: string; sender: "alertante" | "operador" | "cint"; text: string; time: string }>;
  rttTypingRole?: string | null;
  rttDraft: string;
  setRttDraft: (text: string) => void;
  onSendRtt: () => void;
  onQuickRtt: (text: string) => void;
  micActive: boolean;
  onToggleMic: () => void;
  ttsPlaying: boolean;
  onTestTtsAudio: () => void;
  triageNotes: string;
  setTriageNotes: React.Dispatch<React.SetStateAction<string>>;
}

export function InStationMultimodalDock({
  activeCallDemand,
  activeMediaTab,
  setActiveMediaTab,
  aiDetectedSign,
  onConfirmAiSign,
  onSummonCint,
  displayedRttMessages,
  rttTypingRole,
  rttDraft,
  setRttDraft,
  onSendRtt,
  onQuickRtt,
  micActive,
  onToggleMic,
  ttsPlaying,
  onTestTtsAudio,
  triageNotes,
  setTriageNotes,
}: InStationMultimodalDockProps) {
  return (
    <div className="lg:col-span-7 fluent-card p-3 flex flex-col min-h-0 space-y-2">
      {/* Header de la Sala Multimodal */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[var(--accent)] dark:text-sky-400 flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            <span>Sala Multimodal en Vivo · Acciones de Triaje Multicanal</span>
          </span>
          {activeCallDemand.requiresLse && (
            <span className="fluent-badge !bg-purple-950 !text-purple-200 uppercase text-[9.5px] border border-purple-400">
              Art. 81 CRBV
            </span>
          )}
        </div>

        {/* Pestañas adaptativas de medios */}
        <div className="flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/80 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveMediaTab("lsv")}
            className={`fluent-btn !py-1 !px-2 !text-[11px] !rounded-md font-bold transition flex items-center gap-1 ${
              activeMediaTab === "lsv"
                ? "!bg-[var(--accent)] !text-white shadow-xs"
                : "!bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Video className="h-3 w-3" />
            <span>LSV / CINT</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaTab("rtt")}
            className={`fluent-btn !py-1 !px-2 !text-[11px] !rounded-md font-bold transition flex items-center gap-1 ${
              activeMediaTab === "rtt"
                ? "!bg-[var(--accent)] !text-white shadow-xs"
                : "!bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <MessageSquareText className="h-3 w-3" />
            <span>Chat RTT</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMediaTab("audio")}
            className={`fluent-btn !py-1 !px-2 !text-[11px] !rounded-md font-bold transition flex items-center gap-1 ${
              activeMediaTab === "audio"
                ? "!bg-[var(--accent)] !text-white shadow-xs"
                : "!bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <PhoneCall className="h-3 w-3" />
            <span>Audio</span>
          </button>
        </div>
      </div>

      {/* Contenido según pestaña activa */}
      <div className="flex-1 min-h-0 flex flex-col">
        {activeMediaTab === "lsv" ? (
          /* PESTAÑA A: LSV */
          <div className="flex-1 flex flex-col justify-between rounded-xl bg-slate-950 p-2.5 text-white relative min-h-0 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between z-10 shrink-0 flex-wrap gap-1">
              <span className="fluent-badge !bg-purple-900/80 !text-purple-200 border border-purple-500/40 text-[10px]">
                <Languages className="h-3 w-3 text-purple-300" />
                <span>Intérprete LSV: {activeCallDemand.cintSummoned ? "Conectado en Sala" : "En Espera de Conexión"}</span>
              </span>
              <span className="fluent-badge !bg-black/50 !text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                LiveKit WebRTC · 720p HD
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 my-auto py-1">
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex flex-col items-center justify-center min-h-[95px] relative">
                <div className="h-8 w-8 rounded-full bg-purple-600/30 border border-purple-400/50 flex items-center justify-center text-purple-300 font-bold text-xs mb-1">
                  CINT
                </div>
                <span className="text-[11px] font-bold text-slate-200">Intérprete Oficial LSV</span>
                <span className="text-[9px] text-purple-300 font-medium">Traducción Simultánea Activa</span>
                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="rounded-lg bg-slate-900 border border-slate-800 p-2 flex flex-col items-center justify-center min-h-[95px] relative">
                <div className="h-8 w-8 rounded-full bg-sky-600/30 border border-sky-400/50 flex items-center justify-center text-sky-300 font-bold text-xs mb-1">
                  {activeCallDemand.caller.charAt(0)}
                </div>
                <span className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">{activeCallDemand.caller}</span>
                <span className="text-[9px] text-slate-400 font-medium">Alertante (Cámara Trasera/Frontal)</span>
                <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            {aiDetectedSign && (
              <div className="bg-amber-950/70 border border-amber-500/40 rounded-lg p-2 shrink-0 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0 animate-pulse" />
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-300 block truncate">
                      IA MediaPipe: Seña detectada «{aiDetectedSign.label}» ({aiDetectedSign.confidence}%)
                    </span>
                    <span className="text-[9px] text-amber-200/80 block">
                      Detección complementaria al intérprete humano oficial
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onConfirmAiSign}
                  className="fluent-btn !bg-amber-500 hover:!bg-amber-600 !text-slate-950 !h-6 !px-2 !text-[10px] font-bold shrink-0 cursor-pointer shadow-xs"
                >
                  Confirmar en Triaje
                </button>
              </div>
            )}

            <div className="bg-black/70 rounded-lg p-2 border border-white/10 shrink-0 text-left">
              <span className="text-[9.5px] font-mono uppercase text-amber-300 block font-bold">
                Transcripción en vivo no disponible
              </span>
              <p role="status" className="mt-0.5 text-xs text-white/80">
                El backend no proporciona transcripción de audio para esta llamada.
              </p>
            </div>

            {!activeCallDemand.cintSummoned && (
              <div className="pt-1 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => onSummonCint(activeCallDemand.id)}
                  className="fluent-btn !bg-purple-600 hover:!bg-purple-700 !text-white !h-7 !px-3 !text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Languages className="h-3.5 w-3.5" />
                  <span>Sumar Intérprete CINT Ahora</span>
                  <kbd className="px-1 py-0.2 text-[8.5px] font-mono rounded bg-white/20">2</kbd>
                </button>
              </div>
            )}
          </div>
        ) : activeMediaTab === "rtt" ? (
          /* PESTAÑA B: CHAT RTT */
          <div className="flex-1 flex flex-col justify-between rounded-xl bg-slate-50 dark:bg-slate-950 p-2.5 min-h-0 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1 shrink-0">
              <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <MessageSquareText className="h-3.5 w-3.5 text-sky-500" />
                <span>Transmisión RTT Carácter a Carácter (RFC 4103)</span>
              </span>
              <div className="flex items-center gap-2">
                {rttTypingRole && (
                  <span className="text-[9px] text-sky-600 dark:text-sky-400 animate-pulse font-medium">
                    Alertante tecleando...
                  </span>
                )}
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-bold">● En Directo</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[90px]">
              {displayedRttMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col text-xs p-2 rounded-lg max-w-[85%] ${
                    msg.sender === "operador"
                      ? "ml-auto bg-[var(--accent)] text-white"
                      : "mr-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-[9px] opacity-75 font-mono mb-0.5">
                    <span>{msg.sender === "operador" ? "Puesto 911 (Tú)" : activeCallDemand.caller}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="leading-snug font-medium">{msg.text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 text-[10px] shrink-0">
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 shrink-0">Plantillas:</span>
              <button
                type="button"
                onClick={() => onQuickRtt("¿Cuál es su dirección exacta o punto de referencia?")}
                className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 transition"
              >
                ¿Dirección exacta?
              </button>
              <button
                type="button"
                onClick={() => onQuickRtt("¿Hay personas heridas o atrapadas?")}
                className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 transition"
              >
                ¿Hay lesionados?
              </button>
              <button
                type="button"
                onClick={() => onQuickRtt("Unidades de emergencia despachadas hacia su ubicación.")}
                className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0 transition"
              >
                Unidades en camino
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 pt-1 border-t border-slate-200 dark:border-slate-800">
              <input
                type="text"
                value={rttDraft}
                onChange={(e) => setRttDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onSendRtt();
                  }
                }}
                placeholder="Escribir mensaje RTT inmediato..."
                className="flex-1 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <button
                type="button"
                onClick={onSendRtt}
                className="fluent-btn fluent-btn-accent !h-8 !px-3 !text-xs font-bold shadow-xs"
              >
                <Send className="h-3 w-3" />
                <span>Enviar</span>
              </button>
            </div>
          </div>
        ) : (
          /* PESTAÑA C: AUDIO / VOZ */
          <div className="flex-1 flex flex-col items-center justify-between rounded-xl bg-slate-900 p-3 text-white min-h-0 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between w-full shrink-0">
              <span className="fluent-badge !bg-emerald-950/80 !text-emerald-300 border border-emerald-500/30 text-[10px]">
                Voz IP WebRTC / Teléfono VEN 911
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Opus 48kHz · Latencia 24ms</span>
            </div>

            <div className="flex flex-col items-center space-y-2 my-auto">
              <button
                type="button"
                onClick={onToggleMic}
                aria-label={micActive ? "Silenciar micrófono" : "Activar micrófono"}
                className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                  micActive
                    ? "bg-emerald-600 border-emerald-400 text-white shadow-emerald-500/30 animate-pulse"
                    : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                }`}
              >
                {micActive ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>
              <div className="text-center">
                <span className="text-xs font-bold text-white block">
                  {micActive ? "Micrófono Operador Activo (Transmitiendo)" : "Micrófono Silenciado"}
                </span>
                <span className="text-[10px] text-slate-400">
                  {micActive ? "Hable con normalidad al alertante" : "Presione para abrir canal de voz"}
                </span>
              </div>

              <div className="flex items-center gap-1 h-7">
                {[40, 75, 30, 95, 60, 100, 50, 85, 45, 90, 35, 70, 40].map((h, i) => (
                  <span
                    key={i}
                    style={{
                      height: micActive || ttsPlaying ? `${h}%` : "20%",
                      opacity: micActive || ttsPlaying ? 1 : 0.4,
                    }}
                    className={`w-1 rounded-full transition-all duration-150 ${
                      micActive || ttsPlaying ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="w-full pt-1 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-[10px] text-slate-400">Prueba de audio local:</span>
              <button
                type="button"
                onClick={onTestTtsAudio}
                className="fluent-btn !bg-slate-800 hover:!bg-slate-700 !text-slate-200 !h-7 !px-2.5 !text-[11px] font-medium transition cursor-pointer"
              >
                <PhoneCall className="h-3 w-3 text-emerald-400" />
                <span>{ttsPlaying ? "Reproduciendo..." : "Probar Audio / TTS 911"}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Observaciones de triaje */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="triage-notes-input" className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <FileText className="h-3.5 w-3.5 text-[var(--accent)]" />
            <span>Observaciones Clínicas y Situacionales del Operador:</span>
          </label>
          <span className="text-[10px] text-slate-400">Transmitidas en tiempo real a Despacho CAD</span>
        </div>
        <textarea
          id="triage-notes-input"
          rows={2}
          value={triageNotes}
          onChange={(e) => setTriageNotes(e.target.value)}
          placeholder="Registrar estado de la víctima, riesgos en sitio, referencias viales y órdenes iniciales..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
        />
      </div>
    </div>
  );
}
