import {
  DashboardIncident,
  DashboardOperator,
  DashboardQueueItem,
  DashboardUnit,
} from "./types";

export const initialIncidents: DashboardIncident[] = [];
export const initialOperators: DashboardOperator[] = [];
export const initialQueue: DashboardQueueItem[] = [];
export const initialUnits: DashboardUnit[] = [];

export const filters = ["Todo", "Alta prioridad", "Zona Norte", "Ambulancias", "Bomberos"];

export const filterConfigs: Record<string, (incident: DashboardIncident) => boolean> = {
  Todo: () => true,
  "Alta prioridad": (incident) => incident.priority === "Alta",
  "Zona Norte": (incident) => incident.region.includes("Tipuro") || incident.region.includes("Norte"),
  Ambulancias: (incident) => incident.teams.some((team) => team.includes("Ambulancia") || team.includes("Salud")),
  Bomberos: (incident) => incident.teams.some((team) => team.includes("Bombero") || team.includes("Protección Civil")),
};

export const operationalFeed: Array<{ time: string; text: string }> = [];
export const liveCalls: Array<{ caller: string; channel: string; status: string; duration: string; operator: string }> = [];
export const responsePlan: Array<{ title: string; detail: string }> = [];
export const systemStatus: Array<{ label: string; state: string; tone: string }> = [];
export const zoneStats: Array<{ zone: string; incidents: number; resolve: string; priority: string }> = [];
export const executiveSummary: Array<{ label: string; value: string }> = [];
export const responseMatrix: Array<{ team: string; state: string; progress: number }> = [];
