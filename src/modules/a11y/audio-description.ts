"use client";

import { useState, useCallback } from "react";
import { useProfile } from "@/src/modules/profile/profile-store";

export type RoomA11yEventType =
  | "operator_connected"
  | "operator_disconnected"
  | "message_received"
  | "media_requested"
  | "unit_dispatched"
  | "unit_arrived"
  | "call_ended";

export interface RoomA11yEvent {
  type: RoomA11yEventType;
  sender?: string;
  text?: string;
  mediaType?: "foto" | "video" | "vídeo";
  unitType?: string;
  unitName?: string;
  etaMin?: number;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  lang?: string;
  interrupt?: boolean;
}

export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

export function formatEventText(event: RoomA11yEvent): string {
  switch (event.type) {
    case "operator_connected":
      return `El operador de ${event.sender || "VEN 911"} ha ingresado a la sala.`;
    case "operator_disconnected":
      return `El operador se ha desconectado de la sala temporalmente.`;
    case "message_received":
      return `Mensaje recibido de ${event.sender || "Operador"}: ${event.text || ""}`;
    case "media_requested": {
      const mediaName = event.mediaType === "video" || event.mediaType === "vídeo" ? "grabación de vídeo" : "fotografía";
      return `El operador de emergencias solicita autorización para tomar una ${mediaName}.`;
    }
    case "unit_dispatched": {
      const label = event.unitName || event.unitType || "ambulancia";
      const eta = event.etaMin ? ` Tiempo estimado de arribo: ${event.etaMin} minutos.` : "";
      return `Unidad de auxilio ${label} despachada a su ubicación.${eta}`;
    }
    case "unit_arrived":
      return `Unidad de auxilio en el sitio. Personal de respuesta rápida se encuentra en su ubicación.`;
    case "call_ended":
      return "La llamada de emergencia ha finalizado.";
    default:
      return event.text || "";
  }
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisAvailable()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Manejo seguro en entornos restrictivos
    }
  }
}

export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSynthesisAvailable() || !text.trim()) {
    return false;
  }

  try {
    const { rate = 1.0, pitch = 1.0, lang = "es-VE", interrupt = false } = options;

    if (interrupt) {
      window.speechSynthesis.cancel();
    }

    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.lang = lang;

    // Buscar una voz en español si está disponible
    const voices = window.speechSynthesis.getVoices?.() || [];
    const spanishVoice = voices.find(
      (v) => v.lang.startsWith("es-VE") || v.lang.startsWith("es-419") || v.lang.startsWith("es")
    );
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function describeRoomEvent(event: RoomA11yEvent, options: SpeakOptions = {}): boolean {
  const text = formatEventText(event);
  return speak(text, options);
}

export function useAudioDescription(initialEnabled?: boolean) {
  const profile = useProfile((state) => state.profile);
  const [userToggledEnabled, setUserToggledEnabled] = useState<boolean | null>(null);

  // Derivar de forma reactiva y pura
  const isVisualImpaired = Boolean(
    profile?.disabilities?.some((d) => d === "blind" || d === "low_vision" || d === "deafblind")
  );
  const enabled = userToggledEnabled !== null ? userToggledEnabled : (initialEnabled ?? isVisualImpaired);

  const announceEvent = useCallback(
    (event: RoomA11yEvent, options?: SpeakOptions) => {
      if (!enabled) return false;
      return describeRoomEvent(event, options);
    },
    [enabled]
  );

  const speakText = useCallback(
    (text: string, options?: SpeakOptions) => {
      if (!enabled) return false;
      return speak(text, options);
    },
    [enabled]
  );

  const cancelSpeech = useCallback(() => {
    stopSpeaking();
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setUserToggledEnabled(value);
  }, []);

  return {
    enabled,
    setEnabled,
    announceEvent,
    speakText,
    cancelSpeech,
    isSupported: isSpeechSynthesisAvailable(),
  };
}
