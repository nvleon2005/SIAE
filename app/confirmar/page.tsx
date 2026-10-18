"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useTypification } from "@/src/modules/typification/typification-store";
import { useGeolocation } from "@/src/modules/geo/use-geolocation";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { AlertTriangle, XCircle, Phone, Shield, User, Users, MessageSquare, Video } from "lucide-react";
import { PictogramCell } from "@/src/components/siae/PictogramCell";
import { readProfileFromDb, putOutboxItem } from "@/src/lib/profile-db";
import { ActivatingModal } from "@/src/components/siae/ActivatingModal";
import { EmergencyStatus } from "@/src/components/siae/EmergencyStatus";

const COUNTDOWN_SECONDS = 10;

export default function ConfirmarPage() {
  const router = useRouter();
  const { categoryCode, subtypeCode } = useTypification();
  const { result: geoResult } = useGeolocation();
  const setFlowStatus = useEmergency((state) => state.setFlowStatus);
  const setCurrentEmergency = useEmergency((state) => state.setCurrentEmergency);
  const tipificacion = useEmergency((state) => state.tipificacion);
  const ubicacion = useEmergency((state) => state.ubicacion);
  const afectado = useEmergency((state) => state.afectado);
  const descripcionAfectado = useEmergency((state) => state.descripcionAfectado);
  const textoIncidente = useEmergency((state) => state.textoIncidente);

  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [sending, setSending] = useState(false);
  const [activationState, setActivationState] = useState<"idle" | "activating" | "queued">("idle");
  const [cancelled, setCancelled] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeChannels, setActiveChannels] = useState<string[]>(["voz"]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSent = useRef(false);

  useEffect(() => {
    setFlowStatus("confirming");
    readProfileFromDb().then((profile) => {
      if (profile?.channels && profile.channels.length > 0) {
        const mapped = profile.channels.map((ch) => (ch === "video" ? "video_lse" : ch));
        if (profile.disabilities?.includes("deaf") || profile.disabilities?.includes("hard_of_hearing")) {
          if (!mapped.includes("rtt")) mapped.push("rtt");
          if (!mapped.includes("video_lse")) mapped.push("video_lse");
        }
        setActiveChannels(mapped);
      }
    }).catch(() => {});
  }, [setFlowStatus]);

  useEffect(() => {
    if (sending || cancelled || confirmCancel || hasSent.current) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        triggerHapticFeedback("warning");
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sending, cancelled, confirmCancel]);

  // Auto-send when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && !sending && !cancelled && !confirmCancel && !hasSent.current) {
      void handleSend();
    }
  }, [countdown, sending, cancelled, confirmCancel]);

  const handleSend = async () => {
    if (hasSent.current) return;
    hasSent.current = true;
    setSending(true);
    setFlowStatus("creating");
    triggerHapticFeedback("sos");

    try {
      const tipCodigo = subtypeCode || categoryCode || tipificacion?.code;
      if (!tipCodigo) {
        throw new Error("Selecciona una tipificación antes de activar la emergencia.");
      }
      const location = ubicacion ?? (geoResult
        ? { lat: geoResult.lat, lng: geoResult.lng, accuracyM: geoResult.accuracy, addressText: "" }
        : null);
      if (
        !location ||
        !Number.isFinite(location.lat) ||
        !Number.isFinite(location.lng) ||
        location.lat < -90 ||
        location.lat > 90 ||
        location.lng < -180 ||
        location.lng > 180
      ) {
        throw new Error("No hay una ubicación válida. Vuelve al paso de ubicación y confirma tu posición.");
      }
      const profile = await readProfileFromDb().catch(() => null);

      // Determine active communication channels based on profile preferences
      const profileChannels = profile?.channels ?? ["voz", "rtt"];
      const userDisabilities = profile?.disabilities ?? [];
      const channelsToSend = profileChannels.map((ch) => (ch === "video" ? "video_lse" : ch));

      // Guarantee RTT and Video LSE are prioritized for deaf / hard of hearing users
      if (userDisabilities.includes("deaf") || userDisabilities.includes("hard_of_hearing")) {
        if (!channelsToSend.includes("rtt")) channelsToSend.push("rtt");
        if (!channelsToSend.includes("video_lse")) channelsToSend.push("video_lse");
      }

      const effectiveChannels = channelsToSend.length > 0 ? channelsToSend : ["voz"];
      const requestId = crypto.randomUUID();

      const body: Record<string, unknown> = {
        client_request_id: requestId,
        tipificacion_codigo: tipCodigo,
        pictograma_tipificacion: tipificacion?.arasaacId ? String(tipificacion.arasaacId) : null,
        texto_incidente: textoIncidente || tipificacion?.label,
        ubicacion_lat: location.lat,
        ubicacion_lng: location.lng,
        ubicacion_accuracy: location.accuracyM,
        afectado: afectado || "yo_mismo",
        descripcion_afectado: afectado === "otra_persona" ? descripcionAfectado || null : null,
        canales_preferidos: effectiveChannels,
        canales_activos: effectiveChannels,
        ...(profile?.name ? { nombre_solicitante: profile.name } : {}),
        ...(location.addressText ? { direccion_texto: location.addressText } : {}),
        ...(profile?.disabilities?.length ? { discapacidades: profile.disabilities } : {}),
        ...(profile?.medicalNotes ? { notas_medicas: profile.medicalNotes } : {}),
        ...(profile?.emergencyContacts?.length
          ? { contactos_emergencia: profile.emergencyContacts }
          : {}),
      };

      setActivationState("activating");

      let res: Response | null = null;
      try {
        res = await fetch("/v1/emergencias", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch {
        // Red offline o abortada
      }

      if (!res) {
        // Contingencia offline: guardar en cola outbox de IndexedDB
        await putOutboxItem({
          id: requestId,
          tipo: "crear_emergencia",
          payload: body,
          fechaCreacion: new Date().toISOString(),
          estado: "pendiente",
          tries: 0,
          lastError: null,
        });

        setActivationState("queued");
        setFlowStatus("queued");
        return;
      }

      if (!res.ok) {
        const data: unknown = await res.json().catch(() => null);
        const fallbackMessage = "No se pudo activar la emergencia. Por favor, reintente o llame al 911.";
        const errorValue =
          typeof data === "object" && data !== null
            ? (data as Record<string, unknown>).error
            : undefined;
        const message = typeof errorValue === "string" ? errorValue : fallbackMessage;
        throw new Error(message);
      }

      const data = await res.json();
      const emergencyId = data.id || data.emergencia_id || data.emergencia?.id;
      const salaId = data.sala?.id || data.sala_id;
      if (typeof emergencyId !== "string" || !emergencyId || typeof salaId !== "string" || !salaId) {
        throw new Error("El backend no confirmó los identificadores de la emergencia y la sala.");
      }
      setCurrentEmergency(emergencyId, salaId, data.sala?.token ?? null);
      setActivationState("queued");
      setFlowStatus("queued");

      setTimeout(() => {
        router.push(`/sala/${salaId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error && err.message.includes("No se pudo activar") ? err.message : "No se pudo activar la emergencia. Por favor, reintente o llame al 911.");
      setFlowStatus("confirming");
      setSending(false);
      setActivationState("idle");
      hasSent.current = false;
    }
  };

  const handleCancelClick = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setConfirmCancel(true);
    triggerHapticFeedback("tap");
  };

  const handleConfirmCancel = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCancelled(true);
    setConfirmCancel(false);
    setFlowStatus("cancelled");
    triggerHapticFeedback("tap");
    router.push("/tipificar");
  };

  return (
    <main
      id="main-confirmar"
      aria-label="Confirmar activación de emergencia"
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-white dark:from-red-950 dark:to-slate-950 p-3 sm:p-4"
    >
      <div className="max-w-md w-full space-y-4 sm:space-y-6 text-center">
        {/* Header */}
        <div className="space-y-2">
          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 dark:text-red-400 animate-pulse" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {sending ? "Activando emergencia..." : cancelled ? "Emergencia cancelada" : confirmCancel ? "¿Cancelar emergencia?" : "Confirmar emergencia"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            {sending
              ? "Activando protocolo de emergencia con VEN 911 Maturín..."
              : cancelled
              ? "La emergencia ha sido cancelada."
              : confirmCancel
              ? "¿Está seguro de que desea cancelar el envío de la alerta?"
              : `Se activará el protocolo de emergencia en ${countdown} segundos`}
          </p>
        </div>

        {/* Resumen de Tipificación, Afectado y Ubicación (Cumplimiento Modelo ER) */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 space-y-2.5 text-left shadow-xs">
          {tipificacion ? (
            <div className="flex items-center gap-3">
              <PictogramCell
                pictogramId={tipificacion.arasaacId || 3560}
                label={tipificacion.label}
                size={48}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Tipo de Incidente</span>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{tipificacion.label}</p>
                {textoIncidente && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-0.5 truncate">&ldquo;{textoIncidente}&rdquo;</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">Alerta de Auxilio</span>
              Incidente no tipificado (Alerta prioritaria)
            </div>
          )}

          {/* Afectado según Modelo ER */}
          <div className="text-xs text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
            <span className="font-bold text-slate-600 dark:text-slate-400 text-xs uppercase tracking-wider">Afectado</span>
            <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              {afectado === "yo_mismo" ? (
                <>
                  <User className="h-3 w-3 text-sky-500" />
                  <span>A mí mismo</span>
                </>
              ) : (
                <>
                  <Users className="h-3 w-3 text-amber-500" />
                  <span>Otra persona {descripcionAfectado ? `(${descripcionAfectado})` : ""}</span>
                </>
              )}
            </span>
          </div>

          {/* Canales Activos adaptados a la accesibilidad del usuario */}
          <div className="text-xs text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2">
            <span className="font-bold text-slate-600 dark:text-slate-400 block text-xs uppercase tracking-wider mb-1">Canales asignados al caso</span>
            <div className="flex flex-wrap gap-1.5">
              {activeChannels.map((ch) => (
                <span
                  key={ch}
                  className="inline-flex items-center gap-1 rounded-md bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 px-2 py-0.5 text-xs font-bold text-[var(--accent)] dark:text-sky-300"
                >
                  {ch === "video_lse" || ch === "video" ? (
                    <>
                      <Video className="h-3 w-3" />
                      <span>Video LSV</span>
                    </>
                  ) : ch === "rtt" ? (
                    <>
                      <MessageSquare className="h-3 w-3" />
                      <span>Texto RTT</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-3 w-3" />
                      <span>Voz IP</span>
                    </>
                  )}
                </span>
              ))}
            </div>
          </div>

          {ubicacion?.addressText && (
            <div className="text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-2">
              <span className="font-bold text-slate-600 dark:text-slate-400 block text-xs uppercase tracking-wider">Ubicación detectada</span>
              <span className="truncate block">{ubicacion.addressText}</span>
            </div>
          )}
        </div>

        {/* Countdown Ring */}
        {!sending && !cancelled && !error && (
          <div className="relative mx-auto h-32 w-32 sm:h-36 sm:w-36" role="timer" aria-live="polite" aria-atomic="true">
            <svg className="h-32 w-32 sm:h-36 sm:w-36 -rotate-90" viewBox="0 0 160 160">
              <circle
                cx="80" cy="80" r="68"
                fill="none" stroke="currentColor"
                className="text-slate-200 dark:text-slate-800"
                strokeWidth="8"
              />
              <circle
                cx="80" cy="80" r="68"
                fill="none" stroke="currentColor"
                className="text-red-500 transition-all duration-1000 ease-linear"
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 68}
                strokeDashoffset={2 * Math.PI * 68 * (countdown / COUNTDOWN_SECONDS)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl sm:text-5xl font-black text-red-600 dark:text-red-400 tabular-nums">
                {countdown}
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 p-3.5" role="alert">
            <p className="text-xs sm:text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Cancel confirmation alert and buttons */}
        {confirmCancel && !cancelled && (
          <div role="alert" className="rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 p-4 text-center space-y-2.5">
            <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200">
              ¿Seguro que quieres cancelar el envío de la emergencia?
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-700 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                aria-label="Sí, cancelar"
              >
                Sí, cancelar
              </button>
              <button
                type="button"
                onClick={() => setConfirmCancel(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                No, mantener emergencia
              </button>
            </div>
          </div>
        )}

        {/* Cancelled state */}
        {cancelled && (
          <div role="alert" className="rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              Emergencia cancelada por el usuario.
            </p>
          </div>
        )}

        {/* Sending / Queued modal and status */}
        {activationState !== "idle" && (
          <div className="space-y-3">
            <ActivatingModal
              secondsLeft={countdown}
              state={activationState === "queued" ? "queued" : "activating"}
            />
            <EmergencyStatus
              state={activationState === "queued" ? "queued" : "activating"}
              secondsLeft={countdown}
            />
          </div>
        )}

        {/* Actions */}
        {!sending && !cancelled && !confirmCancel && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => void handleSend()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 hover:bg-red-700 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg transition cursor-pointer w-full sm:w-auto"
              aria-label="Enviar emergencia"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
              Enviar emergencia ahora
            </button>
            <button
              type="button"
              onClick={handleCancelClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer w-full sm:w-auto"
              aria-label="Cancelar envío"
            >
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Cancelar envío
            </button>
          </div>
        )}

        {/* Info */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 space-y-1.5">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Shield className="h-3.5 w-3.5 text-[var(--accent)] dark:text-sky-400" />
            Protocolo seguro VEN 911
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Puedes cancelar durante los {COUNTDOWN_SECONDS} segundos. Después, la alerta será procesada por el PSAP de Maturín.
          </p>
        </div>
      </div>
    </main>
  );
}
