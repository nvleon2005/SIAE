"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Check, MapPin, Phone, Search, Shield } from "lucide-react";
import type { CuadranteDePaz } from "@/src/modules/territory/cuadrantes-paz";

interface CuadranteSelectorProps {
  currentQuadrantIdOrName?: string;
  coords?: { lat: number; lng: number };
  locationText?: string;
  isEditable?: boolean;
  onSelectCuadrante?: (cuadrante: CuadranteDePaz) => void;
  className?: string;
}

export function CuadranteSelector({
  currentQuadrantIdOrName,
  coords,
  locationText,
  isEditable = true,
  onSelectCuadrante,
  className = "",
}: CuadranteSelectorProps) {
  const [cuadrantes, setCuadrantes] = useState<CuadranteDePaz[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCuadrantes() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/v1/geo/cuadrantes");
        const data = await response.json().catch(() => null) as { cuadrantes?: unknown } | null;
        if (!response.ok) throw new Error(`No se pudo cargar el catálogo de cuadrantes (${response.status}).`);
        if (!Array.isArray(data?.cuadrantes)) {
          throw new Error("El servidor devolvió un catálogo de cuadrantes inválido.");
        }

        let available = data.cuadrantes as CuadranteDePaz[];
        let current = currentQuadrantIdOrName
          ? available.find((quadrant) =>
              quadrant.id === currentQuadrantIdOrName ||
              String(quadrant.numero) === currentQuadrantIdOrName
            )
          : undefined;

        if (!current && (coords || locationText)) {
          const params = new URLSearchParams();
          if (coords) {
            params.set("lat", String(coords.lat));
            params.set("lng", String(coords.lng));
          }
          if (locationText) params.set("sector", locationText);
          const resolutionResponse = await fetch(`/v1/geo/cuadrantes?${params.toString()}`);
          const resolution = await resolutionResponse.json().catch(() => null) as { cuadrante?: CuadranteDePaz } | null;
          if (!resolutionResponse.ok) {
            throw new Error(`No se pudo resolver el cuadrante (${resolutionResponse.status}).`);
          }
          current = resolution?.cuadrante;
          if (current && !available.some((quadrant) => quadrant.id === current?.id)) {
            available = [...available, current];
          }
        }

        if (cancelled) return;
        setCuadrantes(available);
        setSelectedId(current?.id ?? null);
      } catch (loadError) {
        if (cancelled) return;
        setCuadrantes([]);
        setSelectedId(null);
        setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catálogo de cuadrantes.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadCuadrantes();
    return () => {
      cancelled = true;
    };
  }, [coords?.lat, coords?.lng, currentQuadrantIdOrName, locationText]);

  const activeCuadrante = useMemo(
    () => cuadrantes.find((quadrant) => quadrant.id === selectedId),
    [cuadrantes, selectedId],
  );

  const filteredCuadrantes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return cuadrantes;
    return cuadrantes.filter((quadrant) =>
      quadrant.nombre.toLowerCase().includes(query) ||
      quadrant.parroquia.toLowerCase().includes(query) ||
      quadrant.sectorPrincipal.toLowerCase().includes(query) ||
      quadrant.organismoResponsable.toLowerCase().includes(query) ||
      quadrant.sectoresAbarcados.some((sector) => sector.toLowerCase().includes(query))
    );
  }, [cuadrantes, searchQuery]);

  const handleSelect = (quadrant: CuadranteDePaz) => {
    setSelectedId(quadrant.id);
    onSelectCuadrante?.(quadrant);
    setIsOpen(false);
  };

  const badgeColor = (siglas: string) => {
    switch (siglas) {
      case "PNB":
        return "bg-blue-900/80 text-blue-100 border-blue-700/80";
      case "PoliMonagas":
        return "bg-indigo-900/80 text-indigo-100 border-indigo-700/80";
      case "GNB":
        return "bg-emerald-950 text-emerald-200 border-emerald-800";
      case "Bomberos":
        return "bg-rose-950 text-rose-200 border-rose-800";
      default:
        return "bg-slate-800 text-slate-200 border-slate-700";
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="rounded-xl border border-slate-700/60 bg-[#0B192C]/90 p-3 text-slate-100 shadow-md">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 rounded-lg border border-sky-600/50 bg-sky-950/80 p-1.5 text-sky-400">
              <Shield className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              {activeCuadrante ? (
                <>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded border border-sky-800/60 bg-sky-950/90 px-1.5 py-0.5 font-mono text-[10px] font-black tracking-wider text-sky-400">
                      {activeCuadrante.id}
                    </span>
                    <p className="truncate text-xs font-bold text-white">{activeCuadrante.nombre}</p>
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-300">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span>{activeCuadrante.parroquia} · {activeCuadrante.sectorPrincipal}</span>
                  </p>
                </>
              ) : (
                <p className="text-xs font-semibold text-slate-200" role={error ? "alert" : "status"}>
                  {loading ? "Cargando cuadrantes…" : error || "No hay un cuadrante disponible del backend."}
                </p>
              )}
            </div>
          </div>

          {isEditable && cuadrantes.length > 0 && (
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-600/80 bg-slate-800/90 px-2.5 py-1 text-[11px] font-semibold text-sky-300 transition hover:bg-slate-700"
              aria-expanded={isOpen}
              aria-label="Cambiar Cuadrante de Paz"
            >
              <span>{isOpen ? "Cerrar" : "Cambiar"}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>

        {activeCuadrante && (
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-700/60 pt-2 text-xs">
            <span className={`truncate rounded-md border px-2 py-0.5 text-[10px] font-bold ${badgeColor(activeCuadrante.organismoSiglas)}`}>
              {activeCuadrante.organismoResponsable}
            </span>
            {activeCuadrante.telefonoPatrulla && (
              <a
                href={`tel:${activeCuadrante.telefonoPatrulla}`}
                className="flex items-center gap-1 rounded-md border border-emerald-800/60 bg-emerald-950/60 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-400 transition hover:text-emerald-300"
              >
                <Phone className="h-3 w-3" />
                <span>{activeCuadrante.telefonoPatrulla}</span>
              </a>
            )}
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-700 bg-[#071426] shadow-2xl">
          <div className="border-b border-slate-800 bg-[#0B192C] p-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por sector, parroquia o cuadrante…"
                className="w-full rounded-lg border border-slate-700 bg-slate-900/90 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 focus:border-sky-500 focus:outline-hidden"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 divide-y divide-slate-800/60 overflow-y-auto p-1">
            {filteredCuadrantes.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-400" role="status">
                No se encontraron cuadrantes del backend con ese criterio.
              </p>
            ) : filteredCuadrantes.map((quadrant) => (
              <button
                key={quadrant.id}
                type="button"
                onClick={() => handleSelect(quadrant)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg p-2.5 text-left text-xs transition ${
                  quadrant.id === selectedId
                    ? "border border-sky-700/50 bg-sky-950/80 font-bold text-white"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="rounded bg-sky-950 px-1 font-mono text-[10px] text-sky-400">{quadrant.id}</span>
                    <span className="truncate font-bold text-white">{quadrant.nombre}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                    {quadrant.parroquia} · {quadrant.sectorPrincipal} · {quadrant.organismoSiglas}
                  </span>
                </span>
                {quadrant.id === selectedId && <Check className="h-4 w-4 shrink-0 text-sky-400" />}
              </button>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 bg-[#071426] p-2 text-[10px] text-slate-400">
            <span>Catálogo del backend</span>
            <span className="font-mono text-slate-500">{filteredCuadrantes.length} disponibles</span>
          </div>
        </div>
      )}
    </div>
  );
}
