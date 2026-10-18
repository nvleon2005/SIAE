"use client";

import Link from "next/link";
import { useState } from "react";
import { announceViaPush } from "@/src/modules/notifications/push";
import { usePushSubscription } from "@/src/modules/notifications/use-push-subscription";

export default function NotificationSettingsPage() {
  const { supported, permission, subscribed, busy, subscribe, unsubscribe } = usePushSubscription();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const toggleSubscription = async () => {
    setError(null);
    setNotice(null);
    try {
      if (subscribed) {
        await unsubscribe();
        setNotice("Notificaciones desactivadas.");
      } else {
        await subscribe();
        setNotice("Notificaciones activadas.");
      }
    } catch (subscriptionError) {
      setError(subscriptionError instanceof Error ? subscriptionError.message : "No se pudo actualizar la suscripción.");
    }
  };

  const testPush = async () => {
    setError(null);
    const shown = await announceViaPush({
      title: "El agente Carlos está aquí",
      body: "Toca para abrir la sala.",
      url: "/confirmar",
      tag: "siae-test-push",
    });
    if (!shown) {
      setError("Acepta las notificaciones para probar este aviso.");
    }
  };

  return (
    <main className="tipify-page">
      <div className="tipify-shell">
        <Link className="text-button" href="/perfil">Volver al perfil</Link>
        <h1 className="tipify-title mt-4">Notificaciones</h1>
        <p className="tipify-subtitle">Te avisamos cuando un agente se conecte.</p>

        <section className="summary-card" aria-labelledby="push-title">
          <div>
            <h2 id="push-title">Notificaciones push</h2>
            <p><small>Recibe avisos aunque la app esté en segundo plano.</small></p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={subscribed}
            aria-label="Recibir notificaciones push"
            className="primary-button"
            disabled={busy || !supported || permission === "denied"}
            onClick={() => void toggleSubscription()}
          >
            {subscribed ? "Activadas" : "Activar"}
          </button>
        </section>

        {!supported ? <p className="warning-banner" role="status">Este navegador no admite notificaciones.</p> : null}
        {permission === "denied" ? <p className="warning-banner" role="alert">Las notificaciones están bloqueadas en el navegador.</p> : null}
        {error ? <p className="warning-banner" role="alert">{error}</p> : null}
        {notice ? <p className="summary-card" role="status">{notice}</p> : null}

        {process.env.NODE_ENV === "development" ? (
          <button type="button" className="secondary-button w-full" onClick={() => void testPush()}>
            Probar push
          </button>
        ) : null}
      </div>
    </main>
  );
}
