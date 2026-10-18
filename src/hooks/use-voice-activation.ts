"use client";

import { useEffect, useRef, useState } from "react";

interface SpeechRecognitionResultEventLike {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

export type VoiceActivationStatus = "unsupported" | "idle" | "listening" | "error";

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as typeof window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function normalizeSpeech(text: string) {
  return text.toLocaleLowerCase("es-ES").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function useVoiceActivation(onEmergency: () => void, wakeWord = "Oye SIAE") {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [status, setStatus] = useState<VoiceActivationStatus>("idle");
  const Recognition = getSpeechRecognitionConstructor();

  useEffect(() => () => {
    recognitionRef.current?.stop();
  }, []);

  const startListening = () => {
    if (!Recognition || status === "listening") {
      if (!Recognition) setStatus("unsupported");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = normalizeSpeech(event.results[0]?.[0]?.transcript ?? "");
      const wakePhrase = normalizeSpeech(wakeWord);
      if (transcript.includes(wakePhrase) || transcript.includes("emergencia")) {
        recognition.stop();
        setStatus("idle");
        onEmergency();
      }
    };
    recognition.onerror = () => setStatus("error");
    recognition.onend = () => {
      setStatus((current) => current === "listening" ? "idle" : current);
    };
    recognitionRef.current = recognition;
    setStatus("listening");
    recognition.start();
  };

  return { status, startListening, supported: Boolean(Recognition) };
}