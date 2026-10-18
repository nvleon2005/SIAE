import Dexie, { type Table } from "dexie";

export type ProfileChannels = "voz" | "rtt" | "video";
export type ProfileTheme = "light" | "dark" | "high_contrast" | "yellow_black";
export type ProfileDisability = "deaf" | "hard_of_hearing" | "blind" | "low_vision" | "deafblind" | "motor" | "cognitive" | "elderly" | "speech" | "none";

export interface AddressRecord {
  id: string;
  label: string;
  value: string;
  lat?: number;
  lng?: number;
  referencePoint?: string;
  parroquia?: string;
  accuracy?: number;
}

export interface EmergencyContactRecord {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export const MAX_EMERGENCY_CONTACTS = 5;

export function canAddEmergencyContact(currentCount: number) {
  return currentCount < MAX_EMERGENCY_CONTACTS;
}

export interface LocalProfileRecord {
  id: string;
  remoteId: string | null;
  version: number;
  isAnonymous: boolean;
  isActive: boolean;
  isTutorManaged: boolean;
  name: string;
  phone?: string;
  preferredLocale: string;
  disabilities: ProfileDisability[];
  preferredSignLanguage: "lse" | "lsc" | "asl" | "lsf" | "bsl" | null;
  channels: ProfileChannels[];
  hasCompletedOnboarding: boolean;
  locationAllowed: boolean;
  fontScale: number;
  theme: ProfileTheme;
  reducedMotion: boolean;
  easyRead?: boolean;
  pictogramsOnly: boolean;
  longPressSeconds: 0 | 1 | 3;
  addresses: AddressRecord[];
  emergencyContacts: EmergencyContactRecord[];
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  };
  privacy: {
    shareProfileOnEmergency: boolean;
    shareLocationOnEmergency: boolean;
    syncProfile: boolean;
  };
  medicalNotes?: string;
  medicalData?: {
    tipoSangre?: string;
    alergias: string[];
    condicionesMedicas: string[];
    medicamentos: string[];
  };
  encryptedMedicalData?: string;
  updatedAt: string;
}

export type OutboxType = "crear_emergencia" | "ping_ubicacion";
export type OutboxStatus = "pendiente" | "enviando" | "enviado" | "fallo";

export interface OutboxItem {
  id: string;
  tipo: OutboxType;
  payload: unknown;
  fechaCreacion: string;
  estado: OutboxStatus;
  tries: number;
  lastError: string | null;
  sentAt?: string;
  caminoSeguroId?: string;
}

export type RttRole = "ciudadano" | "agente" | "interprete";

export interface RttMessage {
  id: string;
  salaId: string;
  rolAutor: RttRole;
  idAutor: string;
  texto: string;
  esParcial: boolean;
  fechaEnvio: string;
  fechaEntrega: string | null;
  fechaLectura: string | null;
}

const STORAGE_KEY = "siae-profile";
const OUTBOX_STORAGE_KEY = "siae-outbox";
const RTT_STORAGE_KEY = "siae-rtt";

function hasIndexedDb(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function readFallbackProfile(): LocalProfileRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as LocalProfileRecord;
  } catch {
    return null;
  }
}

function writeFallbackProfile(profile: LocalProfileRecord) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function readFallbackOutbox(): OutboxItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(OUTBOX_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as OutboxItem[] : [];
  } catch {
    return [];
  }
}

function writeFallbackOutbox(items: OutboxItem[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
  }
}

function readFallbackRtt(): RttMessage[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(RTT_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as RttMessage[] : [];
  } catch {
    return [];
  }
}

function writeFallbackRtt(items: RttMessage[]) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(RTT_STORAGE_KEY, JSON.stringify(items));
  }
}

class SiaeDB extends Dexie {
  profiles!: Table<LocalProfileRecord, string>;
  outbox!: Table<OutboxItem, string>;
  rtt!: Table<RttMessage, string>;

  constructor() {
    super("siae-db");
    this.version(1).stores({
      profiles: "id, hasCompletedOnboarding, updatedAt",
    });
    this.version(2).stores({
      profiles: "id, hasCompletedOnboarding, updatedAt",
      outbox: "id, tipo, fechaCreacion, estado, tries",
    });
    this.version(3).stores({
      profiles: "id, hasCompletedOnboarding, updatedAt",
      outbox: "id, tipo, fechaCreacion, estado, tries",
      rtt: "id, salaId, fechaEnvio",
    });
  }
}

export const db = new SiaeDB();

export const defaultLocalProfile: LocalProfileRecord = {
  id: "local",
  remoteId: null,
  version: 1,
  isAnonymous: true,
  isActive: true,
  isTutorManaged: false,
  name: "",
  phone: "",
  preferredLocale: "es",
  disabilities: [],
  preferredSignLanguage: null,
  channels: ["voz", "rtt"],
  hasCompletedOnboarding: false,
  locationAllowed: false,
  fontScale: 1,
  theme: "light",
  reducedMotion: false,
  pictogramsOnly: false,
  longPressSeconds: 1,
  addresses: [],
  emergencyContacts: [],
  notifications: {
    pushEnabled: false,
    emailEnabled: false,
    smsEnabled: false,
    quietHoursEnabled: false,
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
  },
  privacy: {
    shareProfileOnEmergency: true,
    shareLocationOnEmergency: true,
    syncProfile: false,
  },
  medicalNotes: "",
  medicalData: {
    tipoSangre: "",
    alergias: [],
    condicionesMedicas: [],
    medicamentos: [],
  },
  updatedAt: new Date().toISOString(),
};

function normalizeProfile(profile: Partial<LocalProfileRecord>): LocalProfileRecord {
  return {
    ...defaultLocalProfile,
    ...profile,
    id: profile.id ?? defaultLocalProfile.id,
    phone: profile.phone ?? defaultLocalProfile.phone ?? "",
    channels: profile.channels ?? defaultLocalProfile.channels,
    addresses: profile.addresses ?? defaultLocalProfile.addresses,
    emergencyContacts: profile.emergencyContacts ?? defaultLocalProfile.emergencyContacts,
    disabilities: profile.disabilities ?? defaultLocalProfile.disabilities,
    notifications: { ...defaultLocalProfile.notifications, ...profile.notifications },
    privacy: { ...defaultLocalProfile.privacy, ...profile.privacy },
    medicalData: {
      tipoSangre: profile.medicalData?.tipoSangre ?? defaultLocalProfile.medicalData!.tipoSangre,
      alergias: profile.medicalData?.alergias ?? defaultLocalProfile.medicalData!.alergias,
      condicionesMedicas: profile.medicalData?.condicionesMedicas ?? defaultLocalProfile.medicalData!.condicionesMedicas,
      medicamentos: profile.medicalData?.medicamentos ?? defaultLocalProfile.medicalData!.medicamentos,
    },
  };
}

export async function readProfileFromDb(): Promise<LocalProfileRecord | null> {
  try {
    if (!hasIndexedDb()) {
      const fallback = readFallbackProfile();
      return fallback ? normalizeProfile(fallback) : null;
    }

    const profile = await Promise.race([
      db.profiles.get("local"),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 800)),
    ]);
    const fallback = profile ?? readFallbackProfile();
    return fallback ? normalizeProfile(fallback) : null;
  } catch {
    const fallback = readFallbackProfile();
    return fallback ? normalizeProfile(fallback) : null;
  }
}

export async function saveProfileToDb(profile: LocalProfileRecord) {
  const nextProfile = {
    ...normalizeProfile(profile),
    ...profile,
    version: (profile.version ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };

  if (hasIndexedDb()) {
    await db.profiles.put(nextProfile);
  }
  writeFallbackProfile(nextProfile);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("siae-profile-changed", { detail: nextProfile }));
  }
}

export async function resetAccessibilityProfile() {
  const current = (await readProfileFromDb()) ?? defaultLocalProfile;
  const nextProfile: LocalProfileRecord = {
    ...current,
    fontScale: 1,
    theme: "light",
    reducedMotion: false,
    pictogramsOnly: false,
    addresses: current.addresses ?? defaultLocalProfile.addresses,
    emergencyContacts: current.emergencyContacts ?? defaultLocalProfile.emergencyContacts,
    updatedAt: new Date().toISOString(),
  };

  await saveProfileToDb(nextProfile);
  return nextProfile;
}

export async function exportProfileJson(profile: LocalProfileRecord) {
  const payload = {
    ...profile,
    exportedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "siae-profile.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return JSON.stringify(payload, null, 2);
}

export async function importProfileJson(raw: string) {
  const parsed = JSON.parse(raw) as Partial<LocalProfileRecord>;
  const nextProfile: LocalProfileRecord = {
    ...defaultLocalProfile,
    ...parsed,
    id: "local",
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  await saveProfileToDb(nextProfile);
  return nextProfile;
}

export async function clearProfileStore() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
  if (hasIndexedDb()) {
    await db.profiles.clear();
  }
}

export async function putOutboxItem(item: OutboxItem) {
  if (!hasIndexedDb()) {
    const items = readFallbackOutbox().filter((current) => current.id !== item.id);
    writeFallbackOutbox([...items, item]);
    return;
  }

  await db.outbox.put(item);
}

export async function listOutboxItems(): Promise<OutboxItem[]> {
  if (!hasIndexedDb()) {
    return readFallbackOutbox();
  }

  return db.outbox.orderBy("fechaCreacion").toArray();
}

export async function updateOutboxItem(id: string, changes: Partial<OutboxItem>) {
  if (!hasIndexedDb()) {
    const items = readFallbackOutbox().map((item) => item.id === id ? { ...item, ...changes } : item);
    writeFallbackOutbox(items);
    return;
  }

  await db.outbox.update(id, changes);
}

export async function countPendingOutboxItems() {
  const items = await listOutboxItems();
  return items.filter((item) => item.estado === "pendiente" || item.estado === "enviando" || item.estado === "fallo").length;
}

export async function clearOutboxStore() {
  if (!hasIndexedDb()) {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(OUTBOX_STORAGE_KEY);
    }
    return;
  }

  await db.outbox.clear();
}

export async function putRttMessage(message: RttMessage) {
  if (!hasIndexedDb()) {
    const items = readFallbackRtt().filter((item) => item.id !== message.id);
    writeFallbackRtt([...items, message]);
    return;
  }

  await db.rtt.put(message);
}

export async function listRttMessages(salaId: string) {
  if (!hasIndexedDb()) {
    return readFallbackRtt().filter((message) => message.salaId === salaId).sort((a, b) => a.fechaEnvio.localeCompare(b.fechaEnvio));
  }

  return db.rtt.where("salaId").equals(salaId).sortBy("fechaEnvio");
}

export async function clearRttStore() {
  if (!hasIndexedDb()) {
    if (typeof window !== "undefined") window.localStorage.removeItem(RTT_STORAGE_KEY);
    return;
  }

  await db.rtt.clear();
}
