"use client";

import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import { readSessionResponse, useAuth } from "@/src/modules/auth/auth-store";

export function usePasskey() {
  const setSession = useAuth((state) => state.setSession);
  const clearSession = useAuth((state) => state.clearSession);

  const register = async () => {
    if (typeof window === "undefined") {
      throw new Error("WebAuthn no disponible en este entorno");
    }

    const optionsResponse = await fetch("/v1/auth/passkey/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!optionsResponse.ok) {
      throw new Error("No se pudo preparar el registro de la passkey");
    }

    const options = await optionsResponse.json();
    const credential = await startRegistration({ optionsJSON: options });

    const verifyResponse = await fetch("/v1/auth/passkey/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credential),
    });

    if (!verifyResponse.ok) {
      throw new Error("No se pudo verificar la passkey");
    }

    const data = await verifyResponse.json();
    const currentUser = useAuth.getState().user;

    if (currentUser) {
      setSession(
        {
          ...currentUser,
          hasPasskey: true,
        },
      );
      return data;
    }

    return data;
  };

  const authenticate = async () => {
    if (typeof window === "undefined") {
      throw new Error("WebAuthn no disponible en este entorno");
    }

    const optionsResponse = await fetch("/v1/auth/login-passkey/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!optionsResponse.ok) {
      throw new Error("No se pudo preparar la autenticación con passkey");
    }

    const options = await optionsResponse.json();
    const credential = await startAuthentication({ optionsJSON: options });

    const verifyResponse = await fetch("/v1/auth/login-passkey/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credential),
    });

    if (!verifyResponse.ok) {
      throw new Error("La passkey no pudo validarse");
    }

    let user = await readSessionResponse(verifyResponse);
    if (!user) {
      const sessionResponse = await fetch("/v1/auth/session", { credentials: "include" });
      if (sessionResponse.ok) {
        user = await readSessionResponse(sessionResponse);
      }
    }
    if (!user) {
      throw new Error("La passkey fue validada, pero el servidor no devolvió una sesión de usuario válida.");
    }
    setSession(user);

    return user;
  };

  return { register, authenticate, clearSession };
}
