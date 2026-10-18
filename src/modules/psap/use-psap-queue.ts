import { create } from "zustand";
import { DemandaItem, PSAPInfo, QueueFilter, DispatchedUnit } from "./types";
import {
  assignDemandApi,
  dispatchDemandApi,
  fetchDemandsQueue,
  fetchPsapList,
  releaseDemandApi,
  resolvePsap,
  summonCintApi,
  requestEvidenceApi,
  transferDemandToDispatchApi,
  updateTriageDataApi,
} from "./psap-client";

interface PsapQueueState {
  queue: DemandaItem[];
  psaps: PSAPInfo[];
  activePsap: PSAPInfo | null;
  selectedId: string;
  activeFilter: QueueFilter;
  notice: string;
  soundEnabled: boolean;
  roomConnected: boolean;
  videoEnabled: boolean;
  loading: boolean;
  streamConnected: boolean;

  // Actions
  fetchQueue: () => Promise<void>;
  subscribeToStream: () => () => void;
  fetchPsaps: () => Promise<void>;
  resolveLocationPsap: (lat: number, lng: number) => Promise<void>;
  setSelectedId: (id: string) => void;
  setActiveFilter: (filter: QueueFilter) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setRoomConnected: (connected: boolean | ((prev: boolean) => boolean)) => void;
  setVideoEnabled: (enabled: boolean | ((prev: boolean) => boolean)) => void;
  setNotice: (notice: string) => void;
  assignSelected: () => Promise<boolean>;
  releaseSelected: () => Promise<boolean>;
  dispatchSelected: (units: DispatchedUnit[], notes?: string) => Promise<boolean>;
  summonCintInterpreter: (demandId?: string) => Promise<boolean>;
  requestEvidence: (demandId?: string, type?: "foto" | "video" | "audio") => Promise<boolean>;
  transferToDispatch: (demandId?: string, notes?: string) => Promise<boolean>;
  updateTriageData: (demandId: string, updates: { triageNotes?: string; quadrant?: string }) => Promise<boolean>;
  refreshQueue: () => Promise<void>;
  handleKeyNavigation: (key: string, filteredList: DemandaItem[]) => boolean;
  playChime: (isCritical?: boolean) => void;
}

export const usePsapQueue = create<PsapQueueState>((set, get) => ({
  queue: [],
  psaps: [],
  activePsap: null,
  selectedId: "",
  activeFilter: "Todas",
  notice: "Esperando demandas del backend PSAP",
  soundEnabled: true,
  roomConnected: false,
  videoEnabled: false,
  loading: false,
  streamConnected: false,

  fetchQueue: async () => {
    set({ loading: true });
    try {
      const remoteQueue = await fetchDemandsQueue();
      set((state) => {
        const currentSelected = state.selectedId;
        const stillExists = remoteQueue.some((item) => item.id === currentSelected);
        return {
          queue: remoteQueue,
          selectedId: stillExists ? currentSelected : (remoteQueue[0]?.id ?? ""),
          loading: false,
          notice: state.notice.includes("liberada") || state.notice.includes("asignada") || state.notice.includes("Despachada") || state.notice.includes("despachada") || state.notice.includes("Despachadas")
            ? state.notice
            : "Cola sincronizada con backend PSAP",
        };
      });
    } catch {
      set({
        loading: false,
        notice: "No se pudo actualizar la cola PSAP; se conserva la última información recibida",
      });
    }
  },

  subscribeToStream: () => {
    if (typeof window === "undefined" || !("EventSource" in window)) {
      return () => {};
    }

    try {
      const eventSource = new EventSource("/v1/emergencias/stream");

      eventSource.addEventListener("connected", () => {
        set({
          streamConnected: true,
          notice: "🟢 Telemetría en tiempo real activa (NATS / SSE)",
        });
      });

      eventSource.addEventListener("heartbeat", () => {
        set({ streamConnected: true });
      });

      eventSource.addEventListener("demanda_creada", (e: MessageEvent) => {
        try {
          const newDemand: DemandaItem = JSON.parse(e.data);
          set((state) => {
            const alreadyExists = state.queue.some((q) => q.id === newDemand.id);
            if (alreadyExists) return state;
            return {
              queue: [newDemand, ...state.queue],
              selectedId: newDemand.id,
              notice: `🚨 Nueva demanda en vivo: ${newDemand.id} (${newDemand.priority})`,
            };
          });
          get().playChime(newDemand.priority === "P0");
        } catch {
          // Ignore invalid JSON
        }
      });

      eventSource.addEventListener("demanda_actualizada", (e: MessageEvent) => {
        try {
          const updated: Partial<DemandaItem> & { id: string } = JSON.parse(e.data);
          set((state) => ({
            queue: state.queue.map((q) => (q.id === updated.id ? { ...q, ...updated } : q)),
            notice: updated.transferredToDispatch
              ? `➡️ Demanda ${updated.id} transferida a Despacho CAD`
              : state.notice,
          }));
        } catch {
          // Ignore
        }
      });

      eventSource.addEventListener("demanda_transferida", (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const targetId = payload.demandId || payload.id;
          set((state) => ({
            queue: state.queue.map((q) =>
              q.id === targetId
                ? {
                    ...q,
                    transferredToDispatch: true,
                    triageNotes: payload.notas || q.triageNotes,
                    telemetry: {
                      ...(q.telemetry || {}),
                      quadrant: payload.cuadrante || q.telemetry?.quadrant,
                    },
                  }
                : q
            ),
            notice: `📢 Nueva demanda transferida a Despacho CAD: ${targetId}`,
          }));
          get().playChime(true);
        } catch {
          // Ignore
        }
      });

      eventSource.onerror = () => {
        set({ streamConnected: false });
      };

      return () => {
        eventSource.close();
        set({ streamConnected: false });
      };
    } catch {
      return () => {};
    }
  },

  fetchPsaps: async () => {
    try {
      const psaps = await fetchPsapList();
      set({ psaps, activePsap: psaps[0] || null });
    } catch (error) {
      set({
        psaps: [],
        activePsap: null,
        notice: error instanceof Error ? error.message : "No se pudo cargar la lista PSAP",
      });
    }
  },

  resolveLocationPsap: async (lat: number, lng: number) => {
    try {
      const psap = await resolvePsap(lat, lng);
      if (psap) {
        set({ activePsap: psap });
      }
    } catch (error) {
      set({
        notice: error instanceof Error ? error.message : "No se pudo resolver el PSAP de la ubicación",
      });
    }
  },

  setSelectedId: (id: string) => {
    set({ selectedId: id });
  },

  setActiveFilter: (filter: QueueFilter) => {
    set({ activeFilter: filter });
  },

  setSoundEnabled: (enabled: boolean) => {
    set({ soundEnabled: enabled });
  },

  setRoomConnected: (connectedOrFn) => {
    set((state) => ({
      roomConnected: typeof connectedOrFn === "function" ? connectedOrFn(state.roomConnected) : connectedOrFn,
    }));
  },

  setVideoEnabled: (enabledOrFn) => {
    set((state) => ({
      videoEnabled: typeof enabledOrFn === "function" ? enabledOrFn(state.videoEnabled) : enabledOrFn,
    }));
  },

  setNotice: (notice: string) => {
    set({ notice });
  },

  assignSelected: async () => {
    const { queue, selectedId } = get();
    const item = queue.find((i) => i.id === selectedId) ?? queue[0];
    if (!item) return false;

    const confirmed = await assignDemandApi(item.id);
    if (!confirmed) {
      set({ notice: `No se confirmó la asignación de ${item.id}; la cola no se modificó` });
      return false;
    }

    set({ notice: `El backend confirmó la asignación de ${item.id}` });
    void get().fetchQueue();
    return true;
  },

  releaseSelected: async () => {
    const { queue, selectedId } = get();
    const item = queue.find((i) => i.id === selectedId) ?? queue[0];
    if (!item) return false;

    const confirmed = await releaseDemandApi(item.id);
    if (!confirmed) {
      set({ notice: `No se confirmó la liberación de ${item.id}; la cola no se modificó` });
      return false;
    }

    set({ notice: `El backend confirmó la liberación de ${item.id}` });
    void get().fetchQueue();
    return true;
  },

  dispatchSelected: async (units: DispatchedUnit[], notes?: string) => {
    const { queue, selectedId, playChime } = get();
    const item = queue.find((i) => i.id === selectedId) ?? queue[0];
    if (!item) return false;

    const confirmed = await dispatchDemandApi(item.id, units, notes);
    if (!confirmed) {
      set({ notice: `No se confirmó el despacho de ${item.id}; la cola no se modificó` });
      return false;
    }

    set({ notice: `El backend confirmó el despacho de ${item.id}` });
    playChime(true);
    void get().fetchQueue();
    return true;
  },

  summonCintInterpreter: async (demandId?: string) => {
    const { queue, selectedId, playChime } = get();
    const targetId = demandId || selectedId;
    const item = queue.find((i) => i.id === targetId) ?? queue[0];
    if (!item) return false;

    const confirmed = await summonCintApi(item.id);
    if (!confirmed) {
      set({ notice: `No se confirmó la convocatoria CINT para ${item.id}` });
      return false;
    }

    set({ notice: `El backend confirmó la convocatoria CINT para ${item.id}` });
    playChime(false);
    void get().fetchQueue();
    return true;
  },

  requestEvidence: async (demandId?: string, type: "foto" | "video" | "audio" = "foto") => {
    const { queue, selectedId, playChime } = get();
    const targetId = demandId || selectedId;
    const item = queue.find((i) => i.id === targetId) ?? queue[0];
    if (!item) return false;

    const confirmed = await requestEvidenceApi(item.id, type);
    if (!confirmed) {
      set({ notice: `No se confirmó la solicitud de evidencia para ${item.id}` });
      return false;
    }

    set({ notice: `El backend confirmó la solicitud de evidencia para ${item.id}` });
    playChime(false);
    void get().fetchQueue();
    return true;
  },

  transferToDispatch: async (demandId?: string, notes?: string) => {
    const { queue, selectedId, playChime } = get();
    const targetId = demandId || selectedId;
    const item = queue.find((i) => i.id === targetId) ?? queue[0];
    if (!item) return false;

    const finalNotes = notes || item.triageNotes;

    const confirmed = await transferDemandToDispatchApi(item.id, finalNotes, item.telemetry?.quadrant);
    if (!confirmed) {
      set({ notice: `No se confirmó la transferencia de ${item.id}; la cola no se modificó` });
      return false;
    }

    set({ notice: `El backend confirmó la transferencia de ${item.id} a Despacho CAD` });
    playChime(false);
    void get().fetchQueue();
    return true;
  },

  updateTriageData: async (demandId: string, updates: { triageNotes?: string; quadrant?: string }) => {
    const confirmed = await updateTriageDataApi(demandId, updates);
    if (!confirmed) {
      set({ notice: `No se confirmaron los cambios de triaje para ${demandId}` });
      return false;
    }

    set({ notice: `El backend confirmó los cambios de triaje para ${demandId}` });
    void get().fetchQueue();
    return true;
  },

  refreshQueue: async () => {
    const { fetchQueue } = get();
    await fetchQueue();
  },

  handleKeyNavigation: (key: string, filteredList?: DemandaItem[]) => {
    const list = filteredList ?? get().queue;
    if (!list || list.length === 0) return false;
    const { selectedId, setSelectedId, assignSelected, releaseSelected, queue } = get();
    const effectiveId = selectedId && list.some((item) => item.id === selectedId) ? selectedId : list[0].id;
    const currentIndex = list.findIndex((item) => item.id === effectiveId);

    if (key === "ArrowDown") {
      const nextIndex = currentIndex < list.length - 1 ? currentIndex + 1 : 0;
      setSelectedId(list[nextIndex].id);
      return true;
    }

    if (key === "ArrowUp") {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : list.length - 1;
      setSelectedId(list[prevIndex].id);
      return true;
    }

    if (key === " ") {
      const selected = queue.find((i) => i.id === effectiveId) ?? list[0];
      if (selected.status === "Sin asignar") {
        void assignSelected();
      } else {
        void releaseSelected();
      }
      return true;
    }

    if (key === "Escape") {
      void releaseSelected();
      return true;
    }

    return false;
  },

  playChime: (isCritical = false) => {
    const { soundEnabled } = get();
    if (!soundEnabled || typeof window === "undefined") return;

    // Respect prefers-reduced-motion
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isCritical ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(isCritical ? 880 : 587.33, ctx.currentTime); // A5 or D5
      if (isCritical) {
        osc.frequency.setValueAtTime(440, ctx.currentTime + 0.1);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isCritical ? 0.35 : 0.2));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + (isCritical ? 0.35 : 0.2));
    } catch {
      // Audio context might be restricted before user gesture
    }
  },
}));
