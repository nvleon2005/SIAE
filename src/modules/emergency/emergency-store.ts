import { create } from "zustand";

export interface EmergencyTipificacion {
  code: string;
  label: string;
  arasaacId?: number;
}

export interface EmergencyUbicacion {
  lat: number;
  lng: number;
  accuracyM?: number;
  addressText?: string;
  source: "gps" | "network" | "fallback" | "manual" | "saved";
  altitudeM?: number | null;
  heading?: number | null;
  speedMps?: number | null;
  capturedAt?: string;
}

export type EmergencyFlowStatus = "idle" | "activating" | "typing" | "location" | "confirming" | "creating" | "queued" | "assigned" | "in_call" | "cancelled";

export type EmergencyAfectado = "yo_mismo" | "otra_persona";

interface EmergencyState {
  flowStatus: EmergencyFlowStatus;
  activationStartedAt: string | null;
  tipificacion: EmergencyTipificacion | null;
  ubicacion: EmergencyUbicacion | null;
  afectado: EmergencyAfectado;
  descripcionAfectado: string;
  textoIncidente: string;
  canalesActivos: string[];
  currentEmergencyId: string | null;
  currentRoomId: string | null;
  currentRoomToken: string | null;
  startActivation: () => void;
  setFlowStatus: (flowStatus: EmergencyFlowStatus) => void;
  setTipificacion: (tipificacion: EmergencyTipificacion) => void;
  setUbicacion: (ubicacion: EmergencyUbicacion) => void;
  setAfectado: (afectado: EmergencyAfectado, descripcion?: string) => void;
  setTextoIncidente: (textoIncidente: string) => void;
  setCanalesActivos: (canalesActivos: string[]) => void;
  setCurrentEmergency: (currentEmergencyId: string, currentRoomId: string, currentRoomToken?: string | null) => void;
  reset: () => void;
}

const defaultState = {
  flowStatus: "idle" as EmergencyFlowStatus,
  activationStartedAt: null,
  tipificacion: null,
  ubicacion: null,
  afectado: "yo_mismo" as EmergencyAfectado,
  descripcionAfectado: "",
  textoIncidente: "",
  canalesActivos: [] as string[],
  currentEmergencyId: null,
  currentRoomId: null,
  currentRoomToken: null,
};

export const useEmergency = create<EmergencyState>((set) => ({
  ...defaultState,
  startActivation: () => set({
    flowStatus: "activating",
    activationStartedAt: new Date().toISOString(),
    tipificacion: null,
    ubicacion: null,
    afectado: "yo_mismo",
    descripcionAfectado: "",
    textoIncidente: "",
    canalesActivos: [],
    currentEmergencyId: null,
    currentRoomId: null,
    currentRoomToken: null,
  }),
  setFlowStatus: (flowStatus) => set({ flowStatus }),
  setTipificacion: (tipificacion) => set({ tipificacion }),
  setUbicacion: (ubicacion) => set({ ubicacion }),
  setAfectado: (afectado, descripcion = "") => set({ afectado, descripcionAfectado: descripcion }),
  setTextoIncidente: (textoIncidente) => set({ textoIncidente }),
  setCanalesActivos: (canalesActivos) => set({ canalesActivos }),
  setCurrentEmergency: (currentEmergencyId, currentRoomId, currentRoomToken = null) => set({ currentEmergencyId, currentRoomId, currentRoomToken }),
  reset: () => set({ ...defaultState }),
}));
