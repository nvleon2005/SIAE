"use client";

import { useState } from "react";
import { defaultLocalProfile, saveProfileToDb, type LocalProfileRecord } from "@/src/lib/profile-db";

interface AccessibilityMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: LocalProfileRecord;
  onProfileChange: (next: LocalProfileRecord) => void;
}

export function AccessibilityMenu({ open, onOpenChange, profile, onProfileChange }: AccessibilityMenuProps) {
  const [draft, setDraft] = useState(profile);

  const applyPreset = (preset: "standard" | "low_vision" | "deaf" | "motor" | "elderly") => {
    const presets = {
      standard: { ...defaultLocalProfile, id: profile.id },
      low_vision: { ...defaultLocalProfile, id: profile.id, fontScale: 1.6, theme: "high_contrast", pictogramsOnly: false, reducedMotion: true },
      deaf: { ...defaultLocalProfile, id: profile.id, fontScale: 1.2, theme: "dark", pictogramsOnly: false },
      motor: { ...defaultLocalProfile, id: profile.id, fontScale: 1.3, reducedMotion: true },
      elderly: { ...defaultLocalProfile, id: profile.id, fontScale: 1.5, theme: "light", pictogramsOnly: true },
    } as const;

    const next = presets[preset];
    setDraft(next);
    onProfileChange(next);
    void saveProfileToDb(next);
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Accesibilidad" className="fixed inset-0 z-50 flex items-end bg-slate-950/80">
      <div className="w-full rounded-t-3xl border border-slate-700 bg-slate-900 p-5 text-white">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Accesibilidad</h2>
          <button type="button" className="rounded-full border border-slate-600 px-3 py-1 text-sm" onClick={() => onOpenChange(false)}>
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-slate-300">Perfiles</p>
            <div className="flex flex-wrap gap-2">
              {(["standard", "low_vision", "deaf", "motor", "elderly"] as const).map((preset) => (
                <button key={preset} type="button" className="rounded-full border border-slate-600 px-3 py-1 text-xs" onClick={() => applyPreset(preset)}>
                  {preset === "standard" ? "Estándar" : preset === "low_vision" ? "Baja visión" : preset === "deaf" ? "Sordera" : preset === "motor" ? "Motora" : "Mayor 65"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="font-scale" className="mb-2 block text-sm text-slate-300">Tamaño de texto</label>
            <input
              id="font-scale"
              type="range"
              min={0.9}
              max={3}
              step={0.1}
              value={draft.fontScale}
              onChange={(event) => {
                const value = Number(event.target.value);
                const next = { ...draft, fontScale: value };
                setDraft(next);
                onProfileChange(next);
                void saveProfileToDb(next);
              }}
              className="w-full"
            />
            <p className="mt-1 text-xs text-slate-400">{draft.fontScale.toFixed(1)}x</p>
          </div>

          <div>
            <label htmlFor="theme-select" className="mb-2 block text-sm text-slate-300">Tema</label>
            <select
              id="theme-select"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2"
              value={draft.theme}
              onChange={(event) => {
                const next = { ...draft, theme: event.target.value as LocalProfileRecord["theme"] };
                setDraft(next);
                onProfileChange(next);
                void saveProfileToDb(next);
              }}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="high_contrast">Alto contraste</option>
              <option value="yellow_black">Amarillo sobre negro (Baja visión)</option>
            </select>
          </div>

          <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm">
            <span>Modo fácil lectura (Easy Read)</span>
            <input
              type="checkbox"
              checked={Boolean(draft.easyRead)}
              onChange={(event) => {
                const next = { ...draft, easyRead: event.target.checked };
                setDraft(next);
                onProfileChange(next);
                void saveProfileToDb(next);
              }}
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm">
            <span>Movimiento reducido</span>
            <input
              type="checkbox"
              checked={draft.reducedMotion}
              onChange={(event) => {
                const next = { ...draft, reducedMotion: event.target.checked };
                setDraft(next);
                onProfileChange(next);
                void saveProfileToDb(next);
              }}
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-3 text-sm">
            <span>Solo pictogramas</span>
            <input
              type="checkbox"
              checked={draft.pictogramsOnly}
              onChange={(event) => {
                const next = { ...draft, pictogramsOnly: event.target.checked };
                setDraft(next);
                onProfileChange(next);
                void saveProfileToDb(next);
              }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
