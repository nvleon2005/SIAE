import { create } from "zustand";

export interface AuthUser {
  id: string;
  correo_electronico: string;
  nombre_completo: string;
  role?: string;
  hasPasskey?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
}

const AUTH_STORAGE_KEY = "siae_auth_user";

function loadInitialAuth(): { user: AuthUser | null; isAuthenticated: boolean } {
  if (typeof window === "undefined") return { user: null, isAuthenticated: false };
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return { user: null, isAuthenticated: false };
    const user = JSON.parse(raw) as AuthUser;
    return user && typeof user.id === "string"
      ? { user, isAuthenticated: true }
      : { user: null, isAuthenticated: false };
  } catch {
    return { user: null, isAuthenticated: false };
  }
}

export const useAuth = create<AuthState>((set) => ({
  ...loadInitialAuth(),
  setSession: (user) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch {}
    }
    set({ user, isAuthenticated: true });
  },
  clearSession: () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {}
    }
    set({ user: null, isAuthenticated: false });
  },
}));

function isAuthUser(value: unknown): value is AuthUser {
  if (typeof value !== "object" || value === null) return false;
  const user = value as Partial<AuthUser>;
  return typeof user.id === "string"
    && typeof user.correo_electronico === "string"
    && typeof user.nombre_completo === "string";
}

export async function readSessionResponse(response: Response): Promise<AuthUser | null> {
  if (!response.ok) return null;
  const payload: unknown = await response.json();
  if (typeof payload !== "object" || payload === null) return null;
  const data = payload as {
    user?: unknown;
    id?: string;
    correo_electronico?: string;
    nombre_completo?: string;
    role?: string;
    authenticated?: boolean;
  };

  if (isAuthUser(data.user)) {
    const u = data.user as AuthUser & { role?: string };
    return { ...u, role: u.role ?? data.role };
  }

  if (isAuthUser(payload)) {
    return {
      ...(payload as AuthUser),
      role: (payload as AuthUser & { role?: string }).role ?? data.role,
    };
  }

  if (typeof data.id === "string" && typeof data.correo_electronico === "string") {
    return {
      id: data.id,
      correo_electronico: data.correo_electronico,
      nombre_completo: typeof data.nombre_completo === "string" ? data.nombre_completo : "",
      role: data.role,
    };
  }

  return null;
}

function triggerProfileSync() {
  if (typeof window !== "undefined") {
    import("@/src/modules/profile/profile-sync")
      .then((m) => m.syncProfileWithBackend())
      .catch(() => undefined);
  }
}

export async function loginUser(email: string, password: string): Promise<AuthUser> {
  let response: Response;
  try {
    response = await fetch("/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        correo_electronico: email,
        password,
      }),
    });
  } catch {
    throw new Error("Sin conexión con el servidor. Verifica tu conexión de red o que el servicio esté activo.");
  }

  if (!response.ok) {
    const errData = (await response.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
      code?: string;
    };
    const defaultMsg =
      response.status === 401
        ? "Credenciales incorrectas"
        : response.status === 403
        ? "Acceso no autorizado"
        : response.status === 429
        ? "Demasiados intentos de acceso"
        : `Error en autenticación (${response.status})`;
    const message = errData.message || errData.error || defaultMsg;
    throw new Error(message);
  }

  const user = await readSessionResponse(response);
  if (!user) {
    throw new Error("El servidor devolvió una respuesta de sesión inválida");
  }

  useAuth.getState().setSession(user);
  triggerProfileSync();
  return user;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthUser> {
  const response = await fetch("/v1/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-idempotency-key": crypto.randomUUID(),
    },
    credentials: "include",
    body: JSON.stringify({
      nombre_completo: name,
      correo_electronico: email,
      password,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = (errData as { message?: string; error?: string }).message
      || (errData as { message?: string; error?: string }).error
      || "No se pudo completar el registro";
    throw new Error(message);
  }

  const payload = await response.clone().json().catch(() => null) as { authenticated?: boolean } | null;
  if (payload?.authenticated !== true) {
    throw new Error("La cuenta fue creada, pero no se inició sesión. Inicia sesión con tus credenciales.");
  }
  const user = await readSessionResponse(response);
  if (!user) {
    throw new Error("El servidor devolvió una respuesta de sesión inválida");
  }

  useAuth.getState().setSession(user);
  triggerProfileSync();
  return user;
}

export async function refreshSession(): Promise<boolean> {
  const response = await fetch("/v1/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  const user = await readSessionResponse(response);
  if (!user) {
    useAuth.getState().clearSession();
    return false;
  }
  useAuth.getState().setSession(user);
  triggerProfileSync();
  return true;
}

export async function restoreSession(): Promise<boolean> {
  try {
    const response = await fetch("/v1/auth/session", { credentials: "include" });
    const user = await readSessionResponse(response);
    if (user) {
      useAuth.getState().setSession(user);
      triggerProfileSync();
      return true;
    }
    if (response.status === 401) return refreshSession();
  } catch {
    useAuth.getState().clearSession();
  }
  return false;
}

export function logoutCurrentSession() {
  useAuth.getState().clearSession();

  if (typeof window !== "undefined") {
    void fetch("/v1/auth/logout", {
      method: "POST",
      credentials: "include",
    }).catch(() => undefined);
    document.cookie = "siae_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "siae_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "siae_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "siae_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "siae_email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  }
}
