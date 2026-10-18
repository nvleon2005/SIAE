import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  formatEventText,
  speak,
  stopSpeaking,
  useAudioDescription,
  type RoomA11yEvent,
} from "@/src/modules/a11y/audio-description";
import { useProfile } from "@/src/modules/profile/profile-store";

describe("INT-G.8: Motor de Audiodescripción y Síntesis de Voz (TTS) para Invidentes", () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useProfile.setState({ profile: null, loading: false, syncing: false, syncedAt: null, error: null });

    mockSpeak = vi.fn();
    mockCancel = vi.fn();

    // Mock de Web Speech Synthesis API
    class MockUtterance {
      text: string;
      rate = 1;
      pitch = 1;
      lang = "es";
      voice = null;
      constructor(text: string) {
        this.text = text;
      }
    }

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockUtterance,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "speechSynthesis", {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: vi.fn().mockReturnValue([
          { lang: "es-VE", name: "Elena (Venezuela)" },
          { lang: "en-US", name: "David" },
        ]),
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formats accessible verbal descriptions for all critical room events", () => {
    const events: Array<{ event: RoomA11yEvent; expected: RegExp }> = [
      {
        event: { type: "operator_connected", sender: "Operador Bermúdez (VEN 911)" },
        expected: /El operador de Operador Bermúdez \(VEN 911\) ha ingresado a la sala/i,
      },
      {
        event: { type: "message_received", sender: "VEN 911", text: "¿Se encuentra a salvo?" },
        expected: /Mensaje recibido de VEN 911: ¿Se encuentra a salvo\?/i,
      },
      {
        event: { type: "media_requested", mediaType: "foto" },
        expected: /solicita autorización para tomar una fotografía/i,
      },
      {
        event: { type: "unit_dispatched", unitType: "ambulancia medicalizada" },
        expected: /Unidad de auxilio ambulancia medicalizada despachada a su ubicación/i,
      },
      {
        event: { type: "call_ended" },
        expected: /La llamada de emergencia ha finalizado/i,
      },
    ];

    for (const { event, expected } of events) {
      const text = formatEventText(event);
      expect(text).toMatch(expected);
    }
  });

  it("speaks formatted text using Venezuelan Spanish voice and SpeechSynthesisUtterance", () => {
    const result = speak("Atención prioritaria en Maturín", { rate: 1.1, interrupt: true });

    expect(result).toBe(true);
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    const utterance = mockSpeak.mock.calls[0][0];
    expect(utterance.text).toBe("Atención prioritaria en Maturín");
    expect(utterance.rate).toBe(1.1);
    expect(utterance.voice).toEqual({ lang: "es-VE", name: "Elena (Venezuela)" });
  });

  it("stops and cancels ongoing speech when requested", () => {
    stopSpeaking();
    expect(mockCancel).toHaveBeenCalled();
  });

  it("useAudioDescription hook handles enabling, disabling, and announcing room events", () => {
    const { result } = renderHook(() => useAudioDescription(true));

    expect(result.current.enabled).toBe(true);
    expect(result.current.isSupported).toBe(true);

    // Anuncio con TTS habilitado
    act(() => {
      const success = result.current.announceEvent({
        type: "unit_dispatched",
        unitType: "patrulla policial",
      });
      expect(success).toBe(true);
    });

    expect(mockSpeak).toHaveBeenCalled();

    // Deshabilitar TTS
    act(() => {
      result.current.setEnabled(false);
    });

    // Intentar anuncio con TTS deshabilitado
    act(() => {
      const success = result.current.announceEvent({ type: "call_ended" });
      expect(success).toBe(false);
    });

    // No debe haberse llamado una segunda vez
    expect(mockSpeak).toHaveBeenCalledTimes(1);
  });
});
