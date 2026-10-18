/**
 * SIAE — Audio Chimes de Frecuencia Accesible (Web Audio API)
 *
 * Tonos sintetizados para confirmación auditiva de eventos de misión crítica
 * optimizados en el rango 600 Hz - 1200 Hz (frecuencias audibles para personas mayores
 * con presbiacusia, sin frecuencias agudas estridentes para personas con TEA).
 */

type ChimeType = "operator_connected" | "message_received" | "sos_initiated" | "alert_warning";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }

    return audioCtx;
  } catch {
    return null;
  }
}

export function playAccessibilityChime(type: ChimeType, volume = 0.3): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  try {
    switch (type) {
      case "operator_connected": {
        // Tono ascendente de dos notas: A5 (880 Hz) -> D6 (1174.66 Hz)
        playTone(ctx, 880, now, 0.12, volume);
        playTone(ctx, 1174.66, now + 0.14, 0.2, volume);
        break;
      }
      case "message_received": {
        // Nota sutil clara: B5 (987.77 Hz)
        playTone(ctx, 987.77, now, 0.1, volume * 0.8);
        break;
      }
      case "sos_initiated": {
        // Triada de alerta segura: 660 Hz -> 880 Hz -> 1100 Hz
        playTone(ctx, 660, now, 0.1, volume);
        playTone(ctx, 880, now + 0.12, 0.1, volume);
        playTone(ctx, 1100, now + 0.24, 0.25, volume);
        break;
      }
      case "alert_warning": {
        // Tono descendente: 880 Hz -> 587.33 Hz
        playTone(ctx, 880, now, 0.15, volume);
        playTone(ctx, 587.33, now + 0.18, 0.25, volume);
        break;
      }
    }
  } catch {
    // Ignorar defensivamente en navegadores con políticas de autoplay restringidas
  }
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, gainLevel: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine"; // Onda sinusoidal suave sin armónicos ásperos
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainLevel, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}
