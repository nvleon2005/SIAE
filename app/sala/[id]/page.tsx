"use client";

import { use } from "react";
import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RttPanel } from "@/src/components/siae/RttPanel";
import { RoomControls } from "@/src/components/siae/RoomControls";
import { VideoRoom } from "@/src/components/siae/VideoRoom";
import { SignAssistantBanner } from "@/src/components/siae/SignAssistantBanner";
import type { RttRole } from "@/src/lib/profile-db";
import { useRoom } from "@/src/modules/room/use-room";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useSignAssistant } from "@/src/modules/ai/sign-assistant";
import { useAudioDescription } from "@/src/modules/a11y/audio-description";
import { Volume2, VolumeX, CheckCircle2, Paperclip } from "lucide-react";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";
import { useAuth } from "@/src/modules/auth/auth-store";

interface JoinResponse {
  token?: string;
  server_url?: string;
  serverUrl?: string;
  room_id?: string;
  roomId?: string;
  participants?: Array<{ user_id?: string; role?: string }>;
}

export default function SalaPage({
  params,
  initialRole,
}: {
  params: Promise<{ id: string }> | { id: string };
  initialRole?: RttRole;
}) {
  const unwrapped = typeof (params as Promise<{ id: string }>).then === "function"
    ? use(params as Promise<{ id: string }>)
    : (params as { id: string });
  const { id } = unwrapped;
  const user = useAuth((state) => state.user);
  const searchParams = useSearchParams();
  const roleFromQuery = searchParams.get("role");
  const isAgentUser = Boolean(user && ["operador", "despachador", "admin", "agente", "supervisor"].includes(user.role ?? ""));
  const role: RttRole = initialRole ?? (roleFromQuery === "agente" || (roleFromQuery !== "ciudadano" && isAgentUser) ? "agente" : "ciudadano");
  const tokenFromUrl = searchParams.get("token");
  const currentRoomToken = useEmergency((state) => state.currentRoomToken);
  const roomToken = tokenFromUrl || currentRoomToken || "";

  const [join, setJoin] = useState<JoinResponse | null>(null);
  const [joinStatus, setJoinStatus] = useState<"loading" | "ready" | "error">("loading");
  const [closed, setClosed] = useState(false);
  const [evidenceNotice, setEvidenceNotice] = useState<string | null>(null);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEvidence(true);
    const formData = new FormData();
    formData.append("salaId", id);
    formData.append("file", file);
    formData.append("tipo", file.type.startsWith("video") ? "video" : "foto");

    try {
      const res = await fetch("/v1/media/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setEvidenceNotice(`Archivo "${file.name}" subido a MinIO S3 y registrado en PostgreSQL.`);
        setTimeout(() => setEvidenceNotice(null), 7000);
      } else {
        setEvidenceNotice("No se pudo subir el archivo a MinIO.");
      }
    } catch (err) {
      console.error("[SalaPage] Error subiendo archivo adjunto:", err);
      setEvidenceNotice("Fallo de red al subir archivo.");
    } finally {
      setUploadingEvidence(false);
      // Reset input value
      e.target.value = "";
    }
  };

  const { enabled: ttsEnabled, setEnabled: setTtsEnabled, speakText } = useAudioDescription();

  const { detectedSign, confirmSign, dismissSign } = useSignAssistant({
    onSignConfirmed: (sign) => {
      // Broadcast confirmation to room window
      window.postMessage(
        JSON.stringify({
          type: "sign_confirmed",
          sala_id: id,
          sign: sign.signCode,
          label: sign.label,
        }),
        "*"
      );
    },
  });

  const [idempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    let cancelled = false;

    // Llamada con x-idempotency-key y payload contractual
    void fetch(`/v1/salas/${encodeURIComponent(id)}/unirse`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      body: JSON.stringify({
        id,
        token: roomToken,
        role,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          // Si el endpoint /unirse no está disponible, intentar fallback /join
          const fallback = await fetch(`/v1/salas/${encodeURIComponent(id)}/join`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-idempotency-key": idempotencyKey,
            },
            body: JSON.stringify({ id, token: roomToken, role }),
          });
          if (!fallback.ok) throw new Error("No se pudo abrir la sala");
          return fallback.json() as Promise<JoinResponse>;
        }
        return response.json() as Promise<JoinResponse>;
      })
      .then((data) => {
        if (!cancelled) {
          const livekitUrl = data.server_url || data.serverUrl || process.env.NEXT_PUBLIC_LIVEKIT_URL || "ws://localhost:7880";
          const resolvedToken = data.token || roomToken || "";
          startTransition(() => {
            setJoin({
              ...data,
              token: resolvedToken,
              server_url: livekitUrl,
            });
            setJoinStatus("ready");
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          startTransition(() => {
            setJoin(null);
            setJoinStatus("error");
          });
        }
      });

    return () => { cancelled = true; };
  }, [id, role, roomToken, idempotencyKey]);

  const room = useRoom(join?.server_url ?? null, join?.token ?? null);

  if (closed) {
    return (
      <main className="tipify-page">
        <div className="tipify-shell">
          <h1 className="tipify-title">Emergencia concluida</h1>
          <p className="tipify-subtitle">La conexión de la sala se ha cerrado de forma segura.</p>
          {role === "agente" ? (
            <Link className="primary-button block text-center" href="/admin">
              Volver a Consola CAD
            </Link>
          ) : (
            <Link className="primary-button block text-center" href="/">
              Volver a la Home
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="tipify-page">
      <div className="tipify-shell tipify-wide">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div>
            <p className="tipify-subtitle text-xs font-bold uppercase tracking-wider text-[var(--accent)] dark:text-sky-400">
              Sala · {id} · {role === "agente" ? "Operador VEN 911" : "Ciudadano"}
            </p>
            <p className="room-status text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5" role="status" aria-live="polite">
              {joinStatus === "loading"
                ? "Abriendo la sala..."
                : joinStatus === "error"
                ? "No se pudo abrir el vídeo. RTT disponible para continuar."
                : room.status === "connected"
                ? role === "agente"
                  ? "Conectado con el ciudadano."
                  : "Conectado con el agente."
                : room.status === "reconnecting"
                ? "Reconectando..."
                : "RTT disponible mientras se conecta el vídeo."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {role === "agente" && (
              <Link
                href="/admin"
                aria-label="Volver a la consola CAD"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 transition"
                title="Volver a la consola de triaje y despacho CAD"
              >
                ← Consola CAD
              </Link>
            )}
            <ThemeToggle showLabel={false} />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 dark:bg-sky-950/60 text-[var(--accent)] dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <span className={`w-2 h-2 rounded-full ${room.status === "connected" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              {room.status === "connected" ? "Enlace Seguro Cifrado" : "En Espera"}
            </span>
          </div>
        </div>

        {joinStatus === "error" || room.error ? (
          <p className="warning-banner mb-4" role="alert">
            El vídeo o el audio no están disponibles. Puedes seguir por texto.
          </p>
        ) : null}

        <p
          role="status"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100"
        >
          El seguimiento de unidades y los tiempos estimados no están conectados
          a una fuente backend; no se mostrarán ubicaciones ni ETAs simulados.
        </p>

        <div className="tipify-desktop-split lg:grid-cols-12 gap-6 items-start">
          {/* Columna Izquierda (7 cols): Transmisión WebRTC, Lengua de Señas, Controles y Subtítulos */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black shadow-xs">
              <VideoRoom participants={room.participants} localParticipant={room.localParticipant} />
            </div>

            {role === "ciudadano" ? (
              <SignAssistantBanner
                detectedSign={detectedSign}
                onConfirm={confirmSign}
                onDismiss={dismissSign}
                className="mt-3"
              />
            ) : null}

            <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-5" aria-label="Opciones de comunicación">
              <p className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100" role="status">
                La transcripción de voz no está conectada a un servicio backend. RTT sigue disponible.
              </p>
              <p className="col-span-2 rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100" role="status">
                La solicitud de intérprete todavía no está conectada al backend. RTT permanece disponible.
              </p>
              <button
                type="button"
                className="secondary-button text-xs py-2 px-2.5 text-center justify-center cursor-pointer"
                aria-pressed={ttsEnabled}
                onClick={() => {
                  const next = !ttsEnabled;
                  setTtsEnabled(next);
                  if (next) speakText("Audiodescripción y síntesis de voz activada.");
                }}
                title="Activar o desactivar síntesis de voz TTS y audiodescripción accesible"
              >
                {ttsEnabled ? (
                  <span className="flex items-center justify-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-[var(--accent)]" aria-hidden="true" />
                    <span>TTS activo</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <VolumeX className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                    <span>Voz TTS</span>
                  </span>
                )}
              </button>
              <label
                htmlFor="evidence-file-input"
                className="secondary-button text-xs py-2 px-2.5 text-center justify-center cursor-pointer flex items-center gap-1.5"
                title="Subir cualquier foto, imagen o video de evidencia a MinIO S3"
              >
                <Paperclip className="w-3.5 h-3.5 text-sky-400" />
                <span>{uploadingEvidence ? "Subiendo..." : "Adjuntar Evidencia"}</span>
              </label>
              <input
                id="evidence-file-input"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                disabled={uploadingEvidence}
                onChange={handleFileUpload}
              />
            </div>

            {evidenceNotice ? (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 dark:border-emerald-800 p-3 text-xs text-emerald-900 dark:text-emerald-200 font-semibold shadow-xs animate-in fade-in" role="status">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{evidenceNotice}</span>
              </div>
            ) : null}

            <RoomControls
              audioEnabled={room.audioEnabled}
              videoEnabled={room.videoEnabled}
              disabled={room.status !== "connected"}
              onToggleAudio={() => void room.toggleAudio()}
              onToggleVideo={() => void room.toggleVideo()}
              onHangup={() => {
                room.disconnect();
                setClosed(true);
              }}
            />
          </div>

          {/* Columna Derecha (5 cols): Chat en Tiempo Real RTT de Alta Disponibilidad */}
          <div className="lg:col-span-5 space-y-4">
            <RttPanel salaId={id} myRole={role} token={join?.token || roomToken} wsUrl={join?.server_url} />
          </div>
        </div>

      </div>
    </main>
  );
}
