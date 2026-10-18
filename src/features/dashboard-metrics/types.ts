export interface DashboardIncident {
  id: string;
  title: string;
  region: string;
  priority: string;
  eta: string;
  description: string;
  status: string;
  teams: string[];
  coords?: { latitude: string; longitude: string };
}

export interface DashboardOperator {
  name: string;
  status: "Disponible" | "En atención" | "Pausa";
  shift: string;
  ext: string;
}

export interface DashboardQueueItem {
  caller: string;
  type: string;
  wait: string;
  priority: string;
  channel: string;
}

export interface DashboardUnit {
  id: string;
  area: string;
  status: string;
  eta: string;
  type: string;
}

export interface LiveMetricsData {
  resumen?: {
    totalEmergencias: number;
    enEspera: number;
    enTriaje: number;
    despachadas: number;
    tiempoMedioEspera: string;
    tiempoMedioRespuesta: string;
  };
  cuadrantes?: Array<{ cuadrante: string; count: number }>;
}
