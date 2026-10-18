export type DemandaPriority = "P0" | "P1" | "P2" | "P3";

export type QueueFilter = "Todas" | "Sin asignar" | "Mis demandas" | "Prioridad alta" | "Con LSE";

export type AdminRole = "Agente PSAP" | "Supervisor" | "Intérprete LSE" | "Despachador";

export type DemandaEstado = "Sin asignar" | "Asignada" | "Despachada" | "En llamada" | "Cerrada";

export type UnitEntityType = "policia" | "bomberos" | "ambulancia" | "proteccion_civil";

export interface DispatchedUnit {
  id: string;
  unitId?: string;
  name: string;
  label?: string;
  entity?: string;
  type: UnitEntityType;
  etaMin: number;
  status: "en_ruta" | "en_sitio" | "disponible";
}

export interface DispatchInfo {
  dispatchedAt: string;
  dispatchedBy?: string;
  units: DispatchedUnit[];
  notes?: string;
}

export interface CallerTelemetry {
  batteryLevel?: number;
  isCharging?: boolean;
  accuracyM?: number;
  quadrant?: string;
  deviceType?: string;
}

export interface CallerMedicalRecord {
  bloodType?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation?: string;
  };
  disability?: {
    type?: "auditiva" | "visual" | "motora" | "cognitiva" | "ninguna";
    requiresLsv?: boolean;
    requiresEasyRead?: boolean;
  };
}

export interface PSAPInfo {
  id: string;
  nombre: string;
  pais: string;
  telefono_principal: string;
  soporta_lse: boolean;
  soporta_lsc: boolean;
  soporta_pictogramas: boolean;
}

export interface DemandaItem {
  id: string;
  priority: DemandaPriority;
  type: string;
  caller: string;
  channel: string;
  channels: string[];
  language: string;
  wait: string;
  waitSeconds?: number;
  location: string;
  coords?: {
    lat: number;
    lng: number;
    accuracyM?: number;
  };
  requiresLse: boolean;
  requiresLb: boolean;
  status: DemandaEstado;
  psapId: string;
  psapNombre?: string;
  agenteId?: string | null;
  salaId?: string | null;
  token?: string | null;
  createdAt: string;
  telemetry?: CallerTelemetry;
  medicalRecord?: CallerMedicalRecord;
  dispatchInfo?: DispatchInfo;
  pictogramCode?: string;
  cintSummoned?: boolean;
  evidenceRequested?: boolean;
  evidenceType?: "foto" | "video" | "audio";
  transferredToDispatch?: boolean;
  triageNotes?: string;
}
