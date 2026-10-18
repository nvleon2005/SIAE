"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Activity, ZoomIn, ZoomOut, Crosshair, Maximize2, Minimize2 } from "lucide-react";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";

export interface TacticalUnit {
  id: string;
  code: string;
  type: "ambulancia" | "patrulla" | "bomberos" | "pcad";
  name: string;
  lat: number;
  lng: number;
  status: "disponible" | "en_ruta" | "en_sitio" | "preparada";
  etaMinutes?: number;
  speedKmh?: number;
}

interface TacticalMapLibreProps {
  emergencyLat?: number;
  emergencyLng?: number;
  emergencyTitle?: string;
  priority?: "P0" | "P1" | "P2" | "P3";
  cuadranteId?: string;
  units?: TacticalUnit[];
  height?: number | string;
  interactive?: boolean;
  className?: string;
}

const UNIT_COLORS: Record<TacticalUnit["type"], string> = {
  ambulancia: "#10b981",
  patrulla: "#3b82f6",
  bomberos: "#f97316",
  pcad: "#a855f7",
};

const PRIORITY_COLORS: Record<string, string> = {
  P0: "#ef4444",
  P1: "#f97316",
  P2: "#eab308",
  P3: "#6b7280",
};

const EMPTY_UNITS: TacticalUnit[] = [];

export function TacticalMapLibre({
  emergencyLat,
  emergencyLng,
  emergencyTitle = "Incidente",
  priority,
  cuadranteId = "Sin cuadrante",
  units,
  height = 360,
  interactive = true,
  className = "",
}: TacticalMapLibreProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const routeIdsRef = useRef<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<TacticalUnit | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const parsedBaseHeight =
    typeof height === "number"
      ? height
      : typeof height === "string" && height.includes("%")
      ? 480
      : parseInt(String(height), 10) || 380;
  const effectiveHeight = isExpanded ? Math.max(parsedBaseHeight + 200, 560) : height;

  const activeUnits = units ?? EMPTY_UNITS;
  const emergencyLocation = useMemo(() => (
    typeof emergencyLat === "number"
      && typeof emergencyLng === "number"
      && Number.isFinite(emergencyLat)
      && Number.isFinite(emergencyLng)
      && emergencyLat >= -90
      && emergencyLat <= 90
      && emergencyLng >= -180
      && emergencyLng <= 180
      ? { lat: emergencyLat, lng: emergencyLng }
      : null
  ), [emergencyLat, emergencyLng]);

  const triggerResize = useCallback(() => {
    if (mapRef.current) {
      try {
        mapRef.current.resize();
      } catch {}
    }
  }, []);

  useEffect(() => {
    triggerResize();
    const t1 = setTimeout(triggerResize, 80);
    const t2 = setTimeout(triggerResize, 250);
    const t3 = setTimeout(triggerResize, 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isExpanded, height, triggerResize]);

  useEffect(() => {
    if (!containerRef.current || typeof window === "undefined") return;
    let mapInstance: any = null;
    let resizeObserver: ResizeObserver | null = null;

    const initMap = async () => {
      if (!emergencyLocation) return;
      try {
        const ml = await import("maplibre-gl");
        await import("maplibre-gl/dist/maplibre-gl.css");

        try { ml.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs"); } catch {}

        const map = new ml.Map({
          container: containerRef.current!,
          style: "https://tiles.openfreemap.org/styles/liberty",
          center: [emergencyLocation.lng, emergencyLocation.lat],
          zoom: 14,
          interactive,
          attributionControl: false,
        });

        mapInstance = map;
        mapRef.current = map;

        // Auto-resize on container dimensions change
        if (typeof ResizeObserver !== "undefined" && containerRef.current) {
          resizeObserver = new ResizeObserver(() => {
            triggerResize();
          });
          resizeObserver.observe(containerRef.current);
        }

        window.addEventListener("resize", triggerResize);

        map.on("load", () => {
          setMapReady(true);
          triggerResize();
          requestAnimationFrame(triggerResize);
          setTimeout(triggerResize, 100);
          setTimeout(triggerResize, 300);
          setTimeout(triggerResize, 700);
          setTimeout(triggerResize, 1400);

          // ── Inject pulse animation ──────────────────────────────────
          if (!document.getElementById("tmap-pulse-style")) {
            const s = document.createElement("style");
            s.id = "tmap-pulse-style";
            s.textContent = `
              @keyframes tmap-pulse {
                0%{box-shadow:0 0 0 0 rgba(239,68,68,.7)}
                70%{box-shadow:0 0 0 18px rgba(239,68,68,0)}
                100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}
              }
            `;
            document.head.appendChild(s);
          }

          const pColor = PRIORITY_COLORS[priority ?? ""] ?? "#6b7280";

          // ── Emergency marker ──────────────────────────────────────
          const emEl = document.createElement("div");
          emEl.style.cssText = `
            width:26px;height:26px;border-radius:50%;
            background:${pColor};border:3px solid white;
            box-shadow:0 0 0 0 ${pColor}88;
            animation:tmap-pulse 1.4s ease-in-out infinite;
            cursor:default;position:relative;z-index:10;
          `;

          const emPopup = new ml.Popup({ offset: 22, closeButton: false })
            .setHTML(
              `<div style="font-size:11px;font-weight:700;white-space:nowrap;color:#0f172a">
                <span style="color:${pColor}">${priority}</span> · ${emergencyTitle}
               </div>`
            );

          new ml.Marker({ element: emEl, anchor: "center" })
            .setLngLat([emergencyLocation.lng, emergencyLocation.lat])
            .setPopup(emPopup)
            .addTo(map);

          // ── Route lines + unit markers ─────────────────────────────
          activeUnits.forEach((unit) => {
            const color = UNIT_COLORS[unit.type] ?? "#6b7280";
            const routeId = `route-${unit.id}`;

            map.addSource(routeId, {
              type: "geojson",
              data: {
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: [
                    [unit.lng, unit.lat],
                    [emergencyLocation.lng, emergencyLocation.lat],
                  ],
                },
              },
            });
            map.addLayer({
              id: routeId,
              type: "line",
              source: routeId,
              layout: { "line-join": "round", "line-cap": "round" },
              paint: {
                "line-color": color,
                "line-width": 2.5,
                "line-dasharray": [3, 3],
                "line-opacity": 0.85,
              },
            });
            routeIdsRef.current.push(routeId);

            // Unit marker element
            const uEl = document.createElement("div");
            uEl.style.cssText = `
              width:20px;height:20px;border-radius:50%;
              background:${color};border:2.5px solid white;
              cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.35);
              transition:transform .15s ease;
            `;
            uEl.title = `${unit.code} — ETA ${unit.etaMinutes ?? "?"}m`;
            uEl.addEventListener("mouseenter", () => { uEl.style.transform = "scale(1.3)"; });
            uEl.addEventListener("mouseleave", () => { uEl.style.transform = "scale(1)"; });
            uEl.addEventListener("click", (e) => {
              e.stopPropagation();
              triggerHapticFeedback("tap");
              setSelectedUnit(unit);
            });

            const uPopup = new ml.Popup({ offset: 16, closeButton: false })
              .setHTML(
                `<div style="font-size:10px;font-weight:700;color:#0f172a;white-space:nowrap">
                  <span style="color:${color}">${unit.code}</span> · ETA ${unit.etaMinutes ?? "?"}m
                 </div>`
              );

            const marker = new ml.Marker({ element: uEl, anchor: "center" })
              .setLngLat([unit.lng, unit.lat])
              .setPopup(uPopup)
              .addTo(map);

            markersRef.current.push(marker);
          });
        });

        map.on("error", () => setMapError(true));
      } catch {
        setMapError(true);
      }
    };

    initMap();

    return () => {
      window.removeEventListener("resize", triggerResize);
      try { resizeObserver?.disconnect(); } catch {}
      markersRef.current.forEach((m) => { try { m.remove(); } catch {} });
      markersRef.current = [];
      try { mapInstance?.remove(); } catch {}
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeUnits, emergencyLocation, emergencyTitle, interactive, priority, cuadranteId, triggerResize]);

  const handleZoomIn = () => { triggerHapticFeedback("tap"); mapRef.current?.zoomIn(); };
  const handleZoomOut = () => { triggerHapticFeedback("tap"); mapRef.current?.zoomOut(); };
  const handleRecenter = () => {
    triggerHapticFeedback("tap");
    if (!emergencyLocation) return;
    mapRef.current?.flyTo({ center: [emergencyLocation.lng, emergencyLocation.lat], zoom: 14, duration: 700 });
    setSelectedUnit(null);
  };

  if (!emergencyLocation) {
    return (
      <div
        className={`flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 p-6 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 ${className}`}
        style={{ height }}
        role="status"
      >
        No hay coordenadas reales para mostrar este mapa.
      </div>
    );
  }

  // Fallback when map tiles fail (offline / no internet)
  if (mapError) {
    return (
      <div
        className={`relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 ${className}`}
        style={{ height }}
        aria-label="Mapa táctico — modo sin conexión"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Activity className="w-10 h-10 text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Mapa no disponible — modo offline</p>
          <p className="text-xs text-slate-500">
            {emergencyLocation.lat.toFixed(4)}°N {Math.abs(emergencyLocation.lng).toFixed(4)}°W — {cuadranteId}
          </p>
          <div className="mt-2 flex flex-col gap-1 text-xs font-mono w-full max-w-xs px-6">
            {activeUnits.map((u) => (
              <div key={u.id} className="flex items-center justify-between">
                <span style={{ color: UNIT_COLORS[u.type] }} className="font-bold">{u.code}</span>
                <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{u.name}</span>
                <span className="text-emerald-500 font-bold">{u.etaMinutes}m</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden shadow-md transition-all duration-300 ${className}`}
      style={{
        height: effectiveHeight,
        minHeight: typeof effectiveHeight === "number" ? `${effectiveHeight}px` : effectiveHeight,
        border: "1px solid var(--border)",
      }}
      aria-label="Mapa táctico con ubicación del incidente"
    >
      {/* Real map canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full min-h-full min-w-full" />

      {/* HUD badge top-left */}
      <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur border border-slate-700/60 pointer-events-none">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase font-mono">
          ENTES EXTERNOS · {cuadranteId}
        </span>
        <span className="text-[9px] text-slate-400 font-mono hidden sm:inline">
          {emergencyLocation.lat.toFixed(4)}°N {Math.abs(emergencyLocation.lng).toFixed(4)}°W
        </span>
      </div>

      {/* Priority badge top-right */}
      <div className="absolute top-2.5 right-2.5 z-10">
        <span
          className="px-2 py-0.5 rounded text-[10px] font-black font-mono text-white shadow"
          style={{ background: PRIORITY_COLORS[priority ?? ""] ?? "#6b7280" }}
        >
          {priority ?? "—"}
        </span>
      </div>

      {/* Zoom / recenter / maximize controls */}
      {interactive && (
        <div className="absolute bottom-3 right-3 z-10 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback("tap");
              setIsExpanded((prev) => !prev);
            }}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white shadow transition cursor-pointer"
            aria-label={isExpanded ? "Reducir tamaño del mapa táctico" : "Ampliar mapa táctico"}
            title={isExpanded ? "Reducir tamaño del mapa táctico" : "Ampliar mapa táctico"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white shadow transition cursor-pointer"
            aria-label="Acercar mapa"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white shadow transition cursor-pointer"
            aria-label="Alejar mapa"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRecenter}
            className="p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 border border-sky-400 text-white shadow transition cursor-pointer"
            aria-label="Centrar en emergencia"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Unit detail panel */}
      {selectedUnit && (
        <div className="absolute bottom-3 left-3 z-10 max-w-[200px] p-2.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-700 shadow-lg text-xs space-y-1.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
            <span
              className="font-black font-mono text-[11px]"
              style={{ color: UNIT_COLORS[selectedUnit.type] }}
            >
              {selectedUnit.code}
            </span>
            <button
              onClick={() => setSelectedUnit(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer leading-none"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-[10px] leading-tight">{selectedUnit.name}</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-mono text-slate-500 dark:text-slate-400">
            <div>Vel: <span className="text-slate-700 dark:text-slate-200 font-bold">{selectedUnit.speedKmh ?? "—"} km/h</span></div>
            <div>ETA: <span className="text-emerald-500 font-bold">{selectedUnit.etaMinutes ?? "?"}m</span></div>
            <div className="col-span-2">Estado: <span className="capitalize text-slate-700 dark:text-slate-200 font-bold">{selectedUnit.status.replace("_", " ")}</span></div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {!mapReady && !mapError && (
        <div className="absolute inset-0 bg-slate-100 dark:bg-slate-950 flex items-center justify-center z-20">
          <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-300 dark:border-slate-700 border-t-sky-500 rounded-full animate-spin" />
            <span className="text-xs">Cargando mapa…</span>
          </div>
        </div>
      )}
    </div>
  );
}
