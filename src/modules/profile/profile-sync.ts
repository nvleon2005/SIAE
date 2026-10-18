import { readProfileFromDb, saveProfileToDb, type LocalProfileRecord, type ProfileChannels, type ProfileDisability } from "@/src/lib/profile-db";
import { useAuth } from "@/src/modules/auth/auth-store";

export interface RemoteAddress {
  id: string;
  label: string;
  lat?: number;
  lng?: number;
  address_text: string;
  punto_referencia?: string;
  parroquia?: string;
  accuracy?: number;
}

export interface RemoteContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface RemoteAccessibilitySettings {
  font_scale: number;
  theme: string;
  captions?: string;
  easy_read?: boolean;
  pictograms_only: boolean;
  long_press_seconds: number;
  haptics?: boolean;
  reduced_motion: boolean;
}

export interface RemoteProfilePayload {
  id?: string;
  display_name: string;
  preferred_locale: string;
  disabilities: string[];
  preferred_channels: string[];
  preferred_sign_language?: string | null;
  addresses: RemoteAddress[];
  emergency_contacts: RemoteContact[];
  accessibility_settings: RemoteAccessibilitySettings;
  created_at?: string;
  updated_at?: string;
}

export interface SyncResult {
  success: boolean;
  syncedAt?: string;
  error?: string;
  profile?: LocalProfileRecord;
}

/**
 * Normalizes a LocalProfileRecord into the RemoteProfilePayload contract
 * matching PerfilCiudadano / usuarios schema.
 */
export function toRemoteProfile(local: LocalProfileRecord): RemoteProfilePayload {
  return {
    id: local.remoteId ?? undefined,
    display_name: local.name,
    preferred_locale: local.preferredLocale || "es",
    disabilities: local.disabilities || [],
    preferred_channels: local.channels || ["voz", "rtt"],
    preferred_sign_language: local.preferredSignLanguage || null,
    addresses: (local.addresses || []).map((addr) => ({
      id: addr.id,
      label: addr.label,
      address_text: addr.value,
      punto_referencia: addr.referencePoint,
      parroquia: addr.parroquia,
      lat: addr.lat,
      lng: addr.lng,
      accuracy: addr.accuracy,
    })),
    emergency_contacts: (local.emergencyContacts || []).map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      relation: c.relation,
    })),
    accessibility_settings: {
      font_scale: local.fontScale ?? 1,
      theme: local.theme ?? "light",
      reduced_motion: Boolean(local.reducedMotion),
      pictograms_only: Boolean(local.pictogramsOnly),
      long_press_seconds: local.longPressSeconds ?? 1,
    },
  };
}

/**
 * Normalizes any remote backend response (contractual PerfilCiudadano or usuarios row)
 * into the LocalProfileRecord used by Dexie and React components.
 */
export function fromRemoteProfile(
  remote: Record<string, unknown>,
  localFallback: LocalProfileRecord
): LocalProfileRecord {
  const remoteSettings = (remote.accessibility_settings || remote.configuracion_accesibilidad || {}) as Record<string, unknown>;
  const remoteAddresses = (remote.addresses || remote.direcciones || []) as Array<Record<string, unknown>>;
  const remoteContacts = (remote.emergency_contacts || remote.contactos_emergencia || []) as Array<Record<string, unknown>>;

  const rawChannels = (remote.preferred_channels || remote.canales_preferidos) as unknown;
  const channels: ProfileChannels[] = Array.isArray(rawChannels)
    ? (rawChannels as string[]).map((ch) => {
        if (ch === "voice") return "voz";
        if (ch.startsWith("video")) return "video";
        if (ch === "voz" || ch === "rtt" || ch === "video") return ch;
        return "rtt";
      })
    : localFallback.channels;

  const rawDisabilities = (remote.disabilities || remote.discapacidades) as unknown;
  const disabilities: ProfileDisability[] = Array.isArray(rawDisabilities)
    ? (rawDisabilities as ProfileDisability[])
    : localFallback.disabilities;

  return {
    ...localFallback,
    remoteId: typeof remote.id === "string" ? remote.id : localFallback.remoteId,
    name: typeof remote.display_name === "string"
      ? remote.display_name
      : typeof remote.nombre_completo === "string"
        ? remote.nombre_completo
        : localFallback.name,
    preferredLocale: typeof remote.preferred_locale === "string"
      ? remote.preferred_locale
      : typeof remote.idioma_preferido === "string"
        ? remote.idioma_preferido
        : localFallback.preferredLocale,
    disabilities,
    channels,
    preferredSignLanguage: (remote.preferred_sign_language as LocalProfileRecord["preferredSignLanguage"])
      || (remote.lengua_signos_preferida as LocalProfileRecord["preferredSignLanguage"])
      || localFallback.preferredSignLanguage,
    fontScale: typeof remoteSettings.font_scale === "number" ? remoteSettings.font_scale : localFallback.fontScale,
    theme: (remoteSettings.theme as LocalProfileRecord["theme"]) || localFallback.theme,
    reducedMotion: typeof remoteSettings.reduced_motion === "boolean" ? remoteSettings.reduced_motion : localFallback.reducedMotion,
    pictogramsOnly: typeof remoteSettings.pictograms_only === "boolean" ? remoteSettings.pictograms_only : localFallback.pictogramsOnly,
    longPressSeconds: (remoteSettings.long_press_seconds === 0 || remoteSettings.long_press_seconds === 1 || remoteSettings.long_press_seconds === 3)
      ? remoteSettings.long_press_seconds
      : localFallback.longPressSeconds,
    addresses: remoteAddresses.map((a) => ({
      id: typeof a.id === "string" ? a.id : crypto.randomUUID(),
      label: typeof a.label === "string" ? a.label : "Dirección",
      value: typeof a.address_text === "string" ? a.address_text : typeof a.value === "string" ? a.value : "",
      referencePoint: typeof a.punto_referencia === "string" ? a.punto_referencia : typeof a.referencePoint === "string" ? a.referencePoint : undefined,
      parroquia: typeof a.parroquia === "string" ? a.parroquia : undefined,
      lat: typeof a.lat === "number" ? a.lat : undefined,
      lng: typeof a.lng === "number" ? a.lng : undefined,
      accuracy: typeof a.accuracy === "number" ? a.accuracy : undefined,
    })),
    emergencyContacts: remoteContacts.map((c) => ({
      id: typeof c.id === "string" ? c.id : crypto.randomUUID(),
      name: typeof c.name === "string" ? c.name : "",
      phone: typeof c.phone === "string" ? c.phone : "",
      relation: typeof c.relation === "string" ? c.relation : "",
    })),
    isAnonymous: false,
    updatedAt: typeof remote.updated_at === "string" ? remote.updated_at : new Date().toISOString(),
  };
}

/**
 * Fetches the user profile from the backend endpoint GET /v1/perfiles/me.
 */
export async function fetchRemoteProfile(): Promise<RemoteProfilePayload | null> {
  try {
    const res = await fetch("/v1/perfiles/me", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as unknown;
    return (typeof data === "object" && data !== null) ? (data as RemoteProfilePayload) : null;
  } catch {
    return null;
  }
}

/**
 * Sends profile updates to PUT /v1/perfiles/me.
 */
export async function saveRemoteProfile(profile: LocalProfileRecord): Promise<boolean> {
  try {
    const payload = toRemoteProfile(profile);
    const res = await fetch("/v1/perfiles/me", {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-idempotency-key": crypto.randomUUID(),
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Synchronizes local Dexie profile with the remote backend (PostgreSQL usuarios table).
 */
export async function syncProfileWithBackend(): Promise<SyncResult> {
  const isAuth = useAuth.getState().isAuthenticated;
  if (!isAuth) {
    return { success: false, error: "Usuario no autenticado (modo anónimo local)" };
  }

  const local = await readProfileFromDb();
  if (!local) {
    return { success: false, error: "No hay perfil local cargado" };
  }

  const remote = await fetchRemoteProfile();

  if (remote) {
    const merged = fromRemoteProfile(remote as unknown as Record<string, unknown>, local);
    await saveProfileToDb(merged);
    return { success: true, syncedAt: new Date().toISOString(), profile: merged };
  }

  // If remote is not yet populated, seed remote with current local preferences
  const uploaded = await saveRemoteProfile(local);
  if (uploaded) {
    const updatedLocal = { ...local, isAnonymous: false };
    await saveProfileToDb(updatedLocal);
    return { success: true, syncedAt: new Date().toISOString(), profile: updatedLocal };
  }

  return { success: false, error: "Fallo de conexión al sincronizar con el servidor" };
}
