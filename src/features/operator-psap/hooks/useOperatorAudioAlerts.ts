import { useState, useEffect, useCallback } from "react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface UseOperatorAudioAlertsProps {
  soundEnabled: boolean;
  nextAcdIncident: DemandaItem | null;
  incomingCallDismissed: string | null;
  activeCallDemand: DemandaItem | null;
  playChime: (urgent: boolean) => void;
}

/**
 * Hook para gestión de alertas sonoras, campanas ACD, micrófono y síntesis de voz en sala de operaciones.
 */
export function useOperatorAudioAlerts({
  soundEnabled,
  nextAcdIncident,
  incomingCallDismissed,
  activeCallDemand,
  playChime,
}: UseOperatorAudioAlertsProps) {
  const [micActive, setMicActive] = useState<boolean>(false);
  const [ttsPlaying, setTtsPlaying] = useState<boolean>(false);

  // Alerta sonora periódica para llamadas entrantes en ACD
  useEffect(() => {
    if (!soundEnabled || !nextAcdIncident || incomingCallDismissed === nextAcdIncident.id || activeCallDemand) return;
    const interval = setInterval(() => {
      playChime(nextAcdIncident.priority === "P0");
    }, 3500);
    return () => clearInterval(interval);
  }, [soundEnabled, nextAcdIncident, incomingCallDismissed, activeCallDemand, playChime]);

  // Manejo de activación de micrófono
  const toggleMic = useCallback(async () => {
    if (!micActive) {
      try {
        if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
          await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null);
        }
      } catch {}
      setMicActive(true);
    } else {
      setMicActive(false);
    }
  }, [micActive]);

  // Prueba de síntesis de voz TTS
  const testTtsAudio = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setTtsPlaying(true);
      const utter = new SpeechSynthesisUtterance(
        "Llamada de emergencia conectada. Canal de audio bidireccional y síntesis de voz VEN 911 en funcionamiento."
      );
      utter.lang = "es-VE";
      utter.rate = 1.0;
      utter.onend = () => setTtsPlaying(false);
      utter.onerror = () => setTtsPlaying(false);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, []);

  return {
    micActive,
    ttsPlaying,
    toggleMic,
    testTtsAudio,
  };
}
