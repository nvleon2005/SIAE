"use client";

import { useEffect, useRef, useState } from "react";
import { useRtt } from "@/src/modules/rtt/use-rtt";
import type { RttRole } from "@/src/lib/profile-db";
import { playAccessibilityChime } from "@/src/modules/a11y/audio-chimes";

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

interface RttPanelProps {
  salaId: string;
  myRole: RttRole;
  token?: string | null;
  wsUrl?: string | null;
}

export function RttPanel({ salaId, myRole, token, wsUrl }: RttPanelProps) {
  const { messages, send, typingRole, sendError } = useRtt(salaId, myRole, { token, wsUrl });
  const [text, setText] = useState("");
  const logRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const prevCountRef = useRef(messages.length);
  const inputId = `rtt-message-${salaId}-${myRole}`;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.rolAutor !== myRole) {
        playAccessibilityChime("message_received");
      }
    }
    prevCountRef.current = messages.length;
  }, [messages, myRole]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, typingRole]);

  const handleSend = async () => {
    if (await send(text)) setText("");
  };

  return (
    <section className="rtt-panel" aria-labelledby="rtt-title">
      <h2 id="rtt-title">Conversación</h2>
      <ol ref={logRef} className="rtt-messages" role="log" aria-label="Conversación" aria-live="polite" aria-relevant="additions text">
        {messages.map((message) => (
          <li key={message.id} className={`rtt-message rtt-message--${message.rolAutor}`}>
            <div className="rtt-message__meta">
              <strong>{message.rolAutor === myRole ? "Tú" : message.rolAutor}</strong>
              <time dateTime={message.fechaEnvio}>{formatMessageTime(message.fechaEnvio)}</time>
            </div>
            <p>{message.texto}</p>
            <span className="sr-only">
              {message.fechaLectura
                ? "Leído"
                : message.fechaEntrega
                  ? "Entrega confirmada"
                  : "Entrega pendiente de confirmación"}
            </span>
          </li>
        ))}
        {typingRole ? (
          <li className="rtt-typing" aria-label="El agente está escribiendo">
            <span>Escribiendo...</span>
            <span className="inline-flex items-center gap-1 ml-2" aria-hidden="true">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-typing-dot-1" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-typing-dot-2" />
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-typing-dot-3" />
            </span>
          </li>
        ) : null}
      </ol>

      <div className="rtt-quick" aria-label="Frases rápidas">
        {["Sí", "No", "Repita", "Habla más despacio"].map((phrase) => (
          <button key={phrase} type="button" className="rtt-chip" onClick={() => void send(phrase)}>{phrase}</button>
        ))}
      </div>

      {sendError ? <p role="alert" className="text-sm text-red-700 dark:text-red-300">{sendError}</p> : null}

      <div className="rtt-composer">
        <label className="sr-only" htmlFor={inputId}>Mensaje de texto</label>
        <textarea
          ref={inputRef}
          id={inputId}
          value={text}
          rows={2}
          placeholder="Escribir..."
          onChange={(event) => {
            setText(event.target.value);
            void send(event.target.value, true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
        />
        <button type="button" className="primary-button" onClick={() => void handleSend()} disabled={!text.trim()} aria-label="Enviar mensaje">
          Enviar
        </button>
      </div>
    </section>
  );
}
