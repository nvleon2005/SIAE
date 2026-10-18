"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapPickerProps {
  initialLat: number;
  initialLng: number;
  onChange: (lat: number, lng: number) => void;
  height?: number;
}

export function MapPicker({ initialLat, initialLng, onChange, height = 280 }: MapPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });

  useEffect(() => {
    if (!ref.current || typeof window === "undefined") {
      return;
    }

    try {
      maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

      const map = new maplibregl.Map({
        container: ref.current,
        style: "https://tiles.openfreemap.org/styles/liberty",
        center: [initialLng, initialLat],
        zoom: 14,
      });

      mapRef.current = map;
      (window as any).__map = map;

      // Add zoom and rotation controls for accessibility
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }), "top-right");

      const marker = new maplibregl.Marker({ draggable: true, color: "#D32F2F" })
        .setLngLat([initialLng, initialLat])
        .addTo(map);

      markerRef.current = marker;

      marker.on("dragend", () => {
        const { lng, lat } = marker.getLngLat();
        const nextCoords = { lat, lng };
        setCoords(nextCoords);
        onChangeRef.current(lat, lng);
      });

      map.on("click", (e) => {
        const { lng, lat } = e.lngLat;
        marker.setLngLat([lng, lat]);
        setCoords({ lat, lng });
        onChangeRef.current(lat, lng);
      });

      map.on("load", () => {
        map.resize();
        requestAnimationFrame(() => map.resize());
        setTimeout(() => map.resize(), 150);
        setTimeout(() => map.resize(), 400);
      });

      let resizeObserver: ResizeObserver | null = null;
      if (typeof ResizeObserver !== "undefined" && ref.current) {
        resizeObserver = new ResizeObserver(() => {
          map.resize();
        });
        resizeObserver.observe(ref.current);
      }

      const handleWindowResize = () => map.resize();
      window.addEventListener("resize", handleWindowResize);

      return () => {
        window.removeEventListener("resize", handleWindowResize);
        try { resizeObserver?.disconnect(); } catch {}
        marker.remove();
        map.remove();
      };
    } catch (err) {
      console.error("Map initialization error:", err);
      mapRef.current = null;
      markerRef.current = null;
      return undefined;
    }
  }, []);

  // Update center and marker when initialLat or initialLng changes from outside
  useEffect(() => {
    setCoords({ lat: initialLat, lng: initialLng });
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLngLat([initialLng, initialLat]);
      mapRef.current.flyTo({ center: [initialLng, initialLat], zoom: 14 });
    }
  }, [initialLat, initialLng]);
  return (
    <div className="map-picker" aria-label="Mapa de ubicación">
      <div ref={ref} className="map-picker__map" style={{ height }} />
      <p className="map-picker__coords font-mono text-xs text-slate-600 dark:text-slate-400 mt-2">
        📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
      </p>
    </div>
  );
}
