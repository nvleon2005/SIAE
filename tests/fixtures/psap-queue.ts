import type { DemandaItem } from "@/src/modules/psap/types";

export const PSAP_TEST_QUEUE: DemandaItem[] = [
  {
    id: "test-demand-1",
    priority: "P1",
    type: "Emergencia de prueba",
    caller: "Alertante de prueba",
    channel: "Voz",
    channels: ["voz"],
    language: "es",
    wait: "00:08",
    waitSeconds: 8,
    location: "Ubicación de prueba",
    coords: { lat: 10.5, lng: -66.9, accuracyM: 7 },
    requiresLse: false,
    requiresLb: false,
    status: "Sin asignar",
    psapId: "test-psap",
    agenteId: null,
    salaId: "test-room",
    token: "test-room-token",
    createdAt: "2025-01-01T00:00:00.000Z",
  },
];
