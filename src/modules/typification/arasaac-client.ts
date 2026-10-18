"use client";

export interface ArasaacPictogram {
  id: number;
  label: string;
  category: string;
  keywords: string[];
  imageUrl: string;
}

// Catálogo nuclear de emergencia pre-sembrado para disponibilidad 100% offline
export const OFFLINE_EMERGENCY_PICTOGRAMS: ArasaacPictogram[] = [
  // Emergencias Médicas
  {
    id: 2349,
    label: "Ambulancia",
    category: "medica",
    keywords: ["ambulancia", "medico", "salud", "urgencia", "transporte", "auxilio"],
    imageUrl: "https://static.arasaac.org/pictograms/2349/2349_500.png",
  },
  {
    id: 3418,
    label: "Dolor en el Pecho",
    category: "medica",
    keywords: ["dolor", "pecho", "infarto", "corazon", "salud", "urgente"],
    imageUrl: "https://static.arasaac.org/pictograms/3418/3418_500.png",
  },
  {
    id: 5432,
    label: "Dificultad para Respirar / Asfixia",
    category: "medica",
    keywords: ["respirar", "aire", "ahogo", "asfixia", "pulmon"],
    imageUrl: "https://static.arasaac.org/pictograms/5432/5432_500.png",
  },
  {
    id: 7120,
    label: "Caída / Golpe Fuerte",
    category: "medica",
    keywords: ["caida", "suelo", "golpe", "fractura", "herida"],
    imageUrl: "https://static.arasaac.org/pictograms/7120/7120_500.png",
  },
  {
    id: 8812,
    label: "Hemorragia / Sangre",
    category: "medica",
    keywords: ["sangre", "herida", "corte", "hemorragia", "curar"],
    imageUrl: "https://static.arasaac.org/pictograms/8812/8812_500.png",
  },

  // Fuego / Bomberos
  {
    id: 2438,
    label: "Fuego / Incendio",
    category: "fuego",
    keywords: ["fuego", "incendio", "llama", "quemar", "peligro"],
    imageUrl: "https://static.arasaac.org/pictograms/2438/2438_500.png",
  },
  {
    id: 2351,
    label: "Bomberos / Camión",
    category: "fuego",
    keywords: ["bomberos", "camion", "apagar", "manguera", "agua"],
    imageUrl: "https://static.arasaac.org/pictograms/2351/2351_500.png",
  },
  {
    id: 6129,
    label: "Humo Denso",
    category: "fuego",
    keywords: ["humo", "gas", "respirar", "intoxicacion", "aire"],
    imageUrl: "https://static.arasaac.org/pictograms/6129/6129_500.png",
  },

  // Seguridad / Policía
  {
    id: 2350,
    label: "Policía / Patrulla",
    category: "seguridad",
    keywords: ["policia", "patrulla", "seguridad", "denuncia", "oficial"],
    imageUrl: "https://static.arasaac.org/pictograms/2350/2350_500.png",
  },
  {
    id: 4210,
    label: "Robo / Atraco",
    category: "seguridad",
    keywords: ["robo", "ladron", "atraco", "arma", "dinero", "asalto"],
    imageUrl: "https://static.arasaac.org/pictograms/4210/4210_500.png",
  },
  {
    id: 9140,
    label: "Agresión Física",
    category: "seguridad",
    keywords: ["pelea", "golpe", "agresion", "violencia", "ataque"],
    imageUrl: "https://static.arasaac.org/pictograms/9140/9140_500.png",
  },

  // Accidentes de Tránsito
  {
    id: 3105,
    label: "Choque de Vehículos",
    category: "accidente",
    keywords: ["choque", "carro", "auto", "accidente", "carretera", "trafico"],
    imageUrl: "https://static.arasaac.org/pictograms/3105/3105_500.png",
  },
  {
    id: 5122,
    label: "Atropello a Peatón",
    category: "accidente",
    keywords: ["atropello", "peaton", "calle", "herido", "caminar"],
    imageUrl: "https://static.arasaac.org/pictograms/5122/5122_500.png",
  },

  // Rescate y Catástrofes
  {
    id: 6410,
    label: "Inundación / Lluvias Fuertes",
    category: "rescate",
    keywords: ["inundacion", "agua", "rio", "lluvia", "desborde", "maturin"],
    imageUrl: "https://static.arasaac.org/pictograms/6410/6410_500.png",
  },
  {
    id: 7330,
    label: "Persona Atrapada",
    category: "rescate",
    keywords: ["atrapado", "encerrado", "ascensor", "derrumbe", "ayuda"],
    imageUrl: "https://static.arasaac.org/pictograms/7330/7330_500.png",
  },
];

const ARASAAC_STORAGE_KEY = "siae-arasaac-cache";

function normalizeString(val: string): string {
  return val
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getCachedPictograms(): ArasaacPictogram[] {
  if (typeof window === "undefined") return OFFLINE_EMERGENCY_PICTOGRAMS;
  try {
    const raw = window.localStorage.getItem(ARASAAC_STORAGE_KEY);
    if (!raw) return OFFLINE_EMERGENCY_PICTOGRAMS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge unique with offline seeds
      const map = new Map<number, ArasaacPictogram>();
      OFFLINE_EMERGENCY_PICTOGRAMS.forEach((p) => map.set(p.id, p));
      parsed.forEach((p: ArasaacPictogram) => map.set(p.id, p));
      return Array.from(map.values());
    }
  } catch {
    // Fallback to seeds on parsing error
  }
  return OFFLINE_EMERGENCY_PICTOGRAMS;
}

export function saveToArasaacCache(pictograms: ArasaacPictogram[]): void {
  if (typeof window === "undefined") return;
  try {
    const existing = getCachedPictograms();
    const map = new Map<number, ArasaacPictogram>();
    existing.forEach((p) => map.set(p.id, p));
    pictograms.forEach((p) => map.set(p.id, p));
    window.localStorage.setItem(ARASAAC_STORAGE_KEY, JSON.stringify(Array.from(map.values())));
  } catch {
    // Silent fail if quota exceeded
  }
}

export async function searchArasaacPictograms(
  query: string,
  category?: string
): Promise<ArasaacPictogram[]> {
  const normQuery = normalizeString(query);
  const pool = getCachedPictograms();

  // Local match logic (keywords or label matching)
  const localMatches = pool.filter((item) => {
    const matchCategory = !category || item.category === category;
    if (!matchCategory) return false;

    if (!normQuery) return true;

    const normLabel = normalizeString(item.label);
    if (normLabel.includes(normQuery)) return true;

    return item.keywords.some((kw) => normalizeString(kw).includes(normQuery));
  });

  // If we already have strong local matches or offline, return them
  if (localMatches.length >= 3 || typeof window === "undefined" || !navigator.onLine || !normQuery) {
    return localMatches;
  }

  // Attempt dynamic fetch from ARASAAC API if online
  try {
    const res = await fetch(`https://api.arasaac.org/v1/pictograms/es/bestsearch/${encodeURIComponent(normQuery)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2000), // Max 2s timeout
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const dynamicPictograms: ArasaacPictogram[] = data.slice(0, 10).map((raw) => ({
          id: raw._id,
          label: raw.keywords?.[0]?.keyword || query,
          category: category || "general",
          keywords: raw.keywords?.map((k: { keyword: string }) => k.keyword) || [query],
          imageUrl: `https://static.arasaac.org/pictograms/${raw._id}/${raw._id}_500.png`,
        }));

        saveToArasaacCache(dynamicPictograms);

        // Combine unique
        const combined = [...localMatches];
        dynamicPictograms.forEach((dp) => {
          if (!combined.some((c) => c.id === dp.id)) {
            combined.push(dp);
          }
        });
        return combined;
      }
    }
  } catch {
    // Network / timeout error: fallback to local matches
  }

  return localMatches;
}
