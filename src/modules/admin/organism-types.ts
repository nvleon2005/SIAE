export type OrganismUnitType = "ambulancia" | "bomberos" | "policia" | "proteccion_civil";
export type OrganismUnitStatus = "disponible" | "en_guardia" | "en_ruta" | "en_sitio";

export interface OrganismoUnidad {
  id: string;
  organismo: string;
  organismoSiglas: string;
  tipo: OrganismUnitType;
  nombreUnidad: string;
  placa: string;
  baseOperaciones: string;
  telefonoDespacho: string;
  frecuenciaVhf: string;
  etaBaseMin: number;
  estado: OrganismUnitStatus;
}
