"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { listRttMessages, putRttMessage, type RttMessage, type RttRole } from "@/src/lib/profile-db";

export interface UseRttOptions {
  token?: string | null;
  wsUrl?: string | null;
}

export type RttConnectionStatus = "connected" | "connecting" | "offline";

interface RttWsIncomingFrame {
  type?: string;
  kind?: string;
  sala_id?: string;
  salaId?: string;
  room_id?: string;
  role?: string;
  rolAutor?: string;
  text?: string;
  texto?: string;
  is_partial?: boolean;
  esParcial?: boolean;
  msg_id?: string;
  messageId?: string;
  id?: string;
  user_id?: string;
  fecha_lectura?: string;
  fechaLectura?: string;
  ts?: string;
}

type RttBroadcastEvent =
  | { kind: "partial"; salaId: string; rolAutor: RttRole; texto: string };

function isRttBroadcastEvent(value: unknown): value is RttBroadcastEvent {
  if (typeof value !== "object" || value === null) return false;
  const event = value as Record<string, unknown>;
  if (event.kind === "partial") {
    return typeof event.salaId === "string" && typeof event.rolAutor === "string" && typeof event.texto === "string";
  }
  return event.kind === "partial"
    && typeof event.salaId === "string"
    && typeof event.rolAutor === "string"
    && typeof event.texto === "string";
}

export function buildWsUrl(salaId: string, customWsUrl?: string | null, token?: string | null): string | null {
  if (typeof window === "undefined") return null;
  const base = customWsUrl || process.env.NEXT_PUBLIC_WS_URL || `${window.location.protocol === "https:" ? "wss://" : "ws://"}${window.location.host}`;
  if (!base) return null;

  try {
    const isWss = base.startsWith("wss://") || (window.location.protocol === "https:" && !base.startsWith("ws://"));
    const httpLike = base.replace(/^wss?:\/\//, "http://");
    const parsed = new URL(httpLike);
    const hostPort = parsed.host;
    const protocol = isWss ? "wss:" : "ws:";

    const wsUrl = new URL(`${protocol}//${hostPort}/ws/sala/${encodeURIComponent(salaId)}`);
    wsUrl.searchParams.set("room_id", salaId);
    if (token) {
      wsUrl.searchParams.set("token", token);
    }
    return wsUrl.toString();
  } catch {
    return null;
  }
}

export function useRtt(salaId: string, myRole: RttRole, options?: UseRttOptions) {
  const [messages, setMessages] = useState<RttMessage[]>([]);
  const [typingRole, setTypingRole] = useState<RttRole | null>(null);
  const [status, setStatus] = useState<RttConnectionStatus>("offline");
  const [sendError, setSendError] = useState<string | null>(null);

  const channelRef = useRef<BroadcastChannel | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCountRef = useRef(0);
  const partialMsgIdRef = useRef<string>(crypto.randomUUID());

  // Hidratar mensajes persistidos desde IndexedDB
  useEffect(() => {
    let cancelled = false;
    void listRttMessages(salaId).then((stored) => {
      if (!cancelled) {
        const persisted = stored.filter((message) => !message.esParcial);
        setMessages((current) => [...persisted, ...current.filter((message) => !persisted.some((item) => item.id === message.id))]);
      }
    });
    return () => { cancelled = true; };
  }, [salaId]);

  // El canal local solo refleja escritura en curso; no representa entrega de mensajes.
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel(`rtt-${salaId}`);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<unknown>) => {
      if (!isRttBroadcastEvent(event.data)) return;
      const incoming = event.data;
      if (incoming.salaId !== salaId) return;

      if ("kind" in incoming && incoming.kind === "partial") {
        if (incoming.rolAutor === myRole) return;
        setTypingRole(incoming.texto ? incoming.rolAutor : null);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingRole(null), 1200);
        return;
      }

    };

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      channel.close();
      channelRef.current = null;
    };
  }, [myRole, salaId]);

  // Cliente nativo WebSocket hacia /ws/sala/{id}?token={JWT}
  useEffect(() => {
    let unmounted = false;
    const url = buildWsUrl(salaId, options?.wsUrl, options?.token);
    if (!url || typeof WebSocket === "undefined") {
      return;
    }

    function connectWs() {
      if (unmounted) return;
      setStatus("connecting");

      try {
        const socket = new WebSocket(url!);
        wsRef.current = socket;

        socket.onopen = () => {
          if (unmounted) {
            socket.close();
            return;
          }
          setStatus("connected");
          retryCountRef.current = 0;
        };

        socket.onmessage = (event: MessageEvent<string>) => {
          if (unmounted) return;
          try {
            const frame = JSON.parse(event.data) as RttWsIncomingFrame;
            const eventType = frame.type ?? frame.kind;

            if (eventType === "rtt") {
              const frameRole = (frame.role ?? frame.rolAutor ?? "agente") as RttRole;
              if (frameRole === myRole) return;

              const isPartial = frame.is_partial ?? frame.esParcial ?? false;
              const text = frame.text ?? frame.texto ?? "";

              if (isPartial) {
                setTypingRole(text ? frameRole : null);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => setTypingRole(null), 1200);
                return;
              }

              // Mensaje finalizado
              setTypingRole(null);
              const msgId = frame.msg_id ?? frame.id ?? crypto.randomUUID();
              const incomingMsg: RttMessage = {
                id: msgId,
                salaId,
                rolAutor: frameRole,
                idAutor: frame.user_id ?? "remoto",
                texto: text,
                esParcial: false,
                fechaEnvio: frame.ts ?? new Date().toISOString(),
                fechaEntrega: new Date().toISOString(),
                fechaLectura: null,
              };

              setMessages((current) => current.some((m) => m.id === incomingMsg.id) ? current : [...current, incomingMsg]);
              void putRttMessage(incomingMsg);

              // Enviar recibo de lectura
              window.setTimeout(() => {
                if (socket.readyState === WebSocket.OPEN) {
                  const readReceipt = {
                    type: "read",
                    sala_id: salaId,
                    msg_id: msgId,
                    read_at: new Date().toISOString(),
                  };
                  socket.send(JSON.stringify(readReceipt));
                }
              }, 1000);
            } else if (eventType === "read") {
              const readId = frame.msg_id ?? frame.messageId;
              const readAt = frame.fecha_lectura ?? frame.fechaLectura ?? frame.ts ?? new Date().toISOString();
              if (readId) {
                setMessages((current) => current.map((m) => m.id === readId ? { ...m, fechaLectura: readAt } : m));
              }
            }
          } catch {
            // Ignorar frames no serializables en JSON
          }
        };

        socket.onclose = () => {
          if (unmounted) return;
          setStatus("offline");
          wsRef.current = null;
          // Reconexión con backoff exponencial (máx 10 s)
          const delay = Math.min(1000 * Math.pow(1.5, retryCountRef.current++), 10000);
          reconnectTimeoutRef.current = setTimeout(connectWs, delay);
        };

        socket.onerror = () => {
          socket.close();
        };
      } catch {
        setStatus("offline");
      }
    }

    connectWs();

    return () => {
      unmounted = true;
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [salaId, myRole, options?.token, options?.wsUrl]);

  const send = useCallback(async (texto: string, esParcial = false): Promise<boolean> => {
    const trimmed = texto.trim();
    if (!trimmed && !esParcial) return false;

    if (esParcial) {
      // Manejo de backpressure: no saturar el websocket si el buffer supera 32KB
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        if (wsRef.current.bufferedAmount < 32768) {
          wsRef.current.send(JSON.stringify({
            type: "rtt",
            sala_id: salaId,
            role: myRole,
            text: texto,
            is_partial: true,
            msg_id: partialMsgIdRef.current,
          }));
        }
      }
      channelRef.current?.postMessage({ kind: "partial", salaId, rolAutor: myRole, texto });
      return true;
    }

    setSendError(null);
    try {
      const response = await fetch("/v1/rtt/mensajes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salaId,
          rolAutor: myRole,
          texto: trimmed,
          esParcial: false,
        }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const errorMessage = typeof result === "object" && result !== null
          && "error" in result && typeof result.error === "string"
          ? result.error
          : "El servidor no pudo guardar el mensaje.";
        throw new Error(errorMessage);
      }

      const messageId = typeof result === "object" && result !== null
        && "messageId" in result && typeof result.messageId === "string"
        ? result.messageId
        : crypto.randomUUID();
      const sentAt = new Date().toISOString();
      const message: RttMessage = {
        id: messageId,
        salaId,
        rolAutor: myRole,
        idAutor: "yo",
        texto: trimmed,
        esParcial: false,
        fechaEnvio: sentAt,
        fechaEntrega: null,
        fechaLectura: null,
      };

      await putRttMessage(message);
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
      partialMsgIdRef.current = crypto.randomUUID();

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "rtt",
          sala_id: salaId,
          role: myRole,
          text: trimmed,
          is_partial: false,
          msg_id: message.id,
          ts: message.fechaEnvio,
        }));
      }
      return true;
    } catch (error) {
      setSendError(error instanceof Error ? error.message : "No se pudo enviar el mensaje.");
      return false;
    }
  }, [myRole, salaId]);

  return { messages, send, typingRole, status, sendError };
}
