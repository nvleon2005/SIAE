"use client";

import { useEffect, useState } from "react";

export interface GeoLocationResult {
  lat: number;
  lng: number;
  accuracy: number;
  source: "gps" | "network" | "fallback";
  altitude: number | null;
  heading: number | null;
  speed: number | null;
  capturedAt: string;
}

const LAST_KNOWN_LOCATION_KEY = "siae-last-known-location";

function saveLastKnownLocation(location: GeoLocationResult) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LAST_KNOWN_LOCATION_KEY, JSON.stringify(location));
  }
}

function readLastKnownLocation(): GeoLocationResult | null {
  if (typeof window === "undefined") return null;

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(LAST_KNOWN_LOCATION_KEY) ?? "null");
    if (typeof value !== "object" || value === null) return null;
    const location = value as Partial<GeoLocationResult>;
    if (typeof location.lat !== "number" || typeof location.lng !== "number" || typeof location.accuracy !== "number") return null;
    if (typeof location.capturedAt !== "string" || !location.capturedAt) return null;
    return {
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      source: "fallback",
      altitude: typeof location.altitude === "number" ? location.altitude : null,
      heading: typeof location.heading === "number" ? location.heading : null,
      speed: typeof location.speed === "number" ? location.speed : null,
      capturedAt: location.capturedAt,
    };
  } catch {
    return null;
  }
}

export function useGeolocation() {
  const [result, setResult] = useState<GeoLocationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      window.setTimeout(() => {
        setError("Geolocalización no disponible en este dispositivo.");
        setLoading(false);
      }, 0);
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setResult({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        capturedAt: new Date().toISOString(),
        source: "gps",
      });
      saveLastKnownLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        source: "gps",
        altitude: position.coords.altitude,
        heading: position.coords.heading,
        speed: position.coords.speed,
        capturedAt: new Date().toISOString(),
      });
      setLoading(false);
      setError(null);
    };
    const onError = (geoError: GeolocationPositionError) => {
      const fallbackLocation = readLastKnownLocation();
      if (fallbackLocation) {
        setResult(fallbackLocation);
        setError("No se pudo obtener la ubicación actual. Se muestra la última posición guardada; confirma que sigue siendo correcta.");
      } else {
        setError(geoError.message || "No se pudo obtener tu ubicación.");
      }
      setLoading(false);
    };

    if (typeof navigator.geolocation.watchPosition === "function") {
      const watchId = navigator.geolocation.watchPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      });
      return () => navigator.geolocation.clearWatch(watchId);
    }

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      onError,
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 30000,
      },
    );
  }, []);

  return { result, loading, error };
}
