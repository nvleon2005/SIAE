import type { EmergencyIconKey } from "@/src/components/siae/EmergencyPictogramIcon";

export type IncidentCategory = {
  code: string;
  label: string;
  pictogramId: number;
  iconKey?: EmergencyIconKey;
};

export type IncidentSubtype = {
  code: string;
  label: string;
  pictogramId: number;
  iconKey?: EmergencyIconKey;
};

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  { code: "medical", label: "Médico", pictogramId: 2349, iconKey: "medical" },
  { code: "accident", label: "Accidente", pictogramId: 3105, iconKey: "accident" },
  { code: "fire", label: "Fuego", pictogramId: 2438, iconKey: "fire" },
  { code: "violence", label: "Violencia", pictogramId: 24254, iconKey: "violence" },
  { code: "security", label: "Seguridad", pictogramId: 2350, iconKey: "security" },
  { code: "natural_disaster", label: "Desastre", pictogramId: 6410, iconKey: "natural_disaster" },
  { code: "other", label: "Otro", pictogramId: 19524, iconKey: "other" },
];

export const INCIDENT_SUBTYPES: Record<string, IncidentSubtype[]> = {
  medical: [
    { code: "medical.cardiac", label: "Corazón / Dolor", pictogramId: 3418, iconKey: "cardiac" },
    { code: "medical.respiratory", label: "Dificultad respiratoria", pictogramId: 5432, iconKey: "respiratory" },
    { code: "medical.wound", label: "Herida / Sangrado", pictogramId: 8812, iconKey: "wound" },
    { code: "medical.fall", label: "Caída / Golpe", pictogramId: 7120, iconKey: "fall" },
    { code: "medical.ambulance", label: "Ambulancia urgente", pictogramId: 2349, iconKey: "ambulance" },
  ],
  accident: [
    { code: "accident.traffic", label: "Choque vehicular", pictogramId: 3105, iconKey: "traffic" },
    { code: "accident.pedestrian", label: "Atropello peatonal", pictogramId: 5122, iconKey: "pedestrian" },
    { code: "accident.fall", label: "Caída de altura", pictogramId: 7120, iconKey: "fall" },
  ],
  fire: [
    { code: "fire.flames", label: "Fuego / Incendio", pictogramId: 2438, iconKey: "flames" },
    { code: "fire.engine", label: "Camión de bomberos", pictogramId: 2351, iconKey: "fire_engine" },
    { code: "fire.smoke", label: "Humo denso / Gas", pictogramId: 6129, iconKey: "smoke" },
  ],
  violence: [
    { code: "violence.assault", label: "Agresión física", pictogramId: 9140, iconKey: "assault" },
    { code: "violence.robbery", label: "Robo / Atraco", pictogramId: 3573, iconKey: "robbery" },
    { code: "violence.domestic", label: "Violencia doméstica", pictogramId: 3572, iconKey: "violence" },
  ],
  security: [
    { code: "security.police", label: "Policía / Patrulla", pictogramId: 2350, iconKey: "police" },
    { code: "security.theft", label: "Robo / Asalto", pictogramId: 4210, iconKey: "theft" },
  ],
  natural_disaster: [
    { code: "natural_disaster.flood", label: "Inundación / Lluvia", pictogramId: 4669, iconKey: "flood" },
  ],
  other: [
    { code: "other.general", label: "Ayuda general", pictogramId: 19524, iconKey: "general" },
  ],
};

export function getCategoryByCode(code: string) {
  return INCIDENT_CATEGORIES.find((category) => category.code === code) ?? null;
}
