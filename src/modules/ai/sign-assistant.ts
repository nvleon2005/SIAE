"use client";

import { useState, useCallback, useRef } from "react";

export type EmergencySignCode = "auxilio" | "dolor" | "peligro" | "sos_universal";

export interface SignDetectionResult {
  signCode: EmergencySignCode;
  label: string;
  confidence: number;
  detectedAt: number;
}

export const KNOWN_EMERGENCY_SIGNS: Record<EmergencySignCode, { label: string; description: string }> = {
  sos_universal: {
    label: "Señal Universal de Auxilio (Signal for Help)",
    description: "Palma extendida con pulgar doblado y cuatro dedos cerrados sobre el pulgar.",
  },
  auxilio: {
    label: "Auxilio / Ayuda (LSV)",
    description: "Seña de socorro en Lengua de Señas Venezolana.",
  },
  dolor: {
    label: "Dolor Severo (LSV)",
    description: "Indicación de dolor agudo o afección médica urgente.",
  },
  peligro: {
    label: "Peligro Inminente (LSV)",
    description: "Gesto de advertencia de riesgo o amenaza física.",
  },
};

interface UseSignAssistantOptions {
  confidenceThreshold?: number;
  throttleMs?: number;
  onSignConfirmed?: (sign: SignDetectionResult) => void;
}

export function useSignAssistant({
  confidenceThreshold = 0.75,
  throttleMs = 600,
  onSignConfirmed,
}: UseSignAssistantOptions = {}) {
  const [detectedSign, setDetectedSign] = useState<SignDetectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const lastProcessedTime = useRef(0);

  const processDetection = useCallback(
    (signCode: EmergencySignCode, confidence: number) => {
      const now = Date.now();
      // Throttle: maximum 1 detection evaluation every throttleMs
      if (throttleMs > 0 && now - lastProcessedTime.current < throttleMs) return;
      lastProcessedTime.current = now;

      if (confidence >= confidenceThreshold) {
        setDetectedSign({
          signCode,
          label: KNOWN_EMERGENCY_SIGNS[signCode].label,
          confidence,
          detectedAt: now,
        });
      }
    },
    [confidenceThreshold, throttleMs]
  );

  const confirmSign = useCallback(() => {
    if (!detectedSign) return;
    if (onSignConfirmed) {
      onSignConfirmed(detectedSign);
    }
    setDetectedSign(null);
  }, [detectedSign, onSignConfirmed]);

  const dismissSign = useCallback(() => {
    setDetectedSign(null);
  }, []);

  return {
    detectedSign,
    isProcessing,
    setIsProcessing,
    processDetection,
    confirmSign,
    dismissSign,
  };
}
