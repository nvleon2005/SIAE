"use client";

import { useState } from "react";
import { ContactForm } from "@/src/components/siae/ProfileForms";
import {
  canAddEmergencyContact,
  type ProfileDisability,
} from "@/src/lib/profile-db";
import { useProfile } from "@/src/modules/profile/profile-store";
import {
  Accessibility,
  Activity,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Ear,
  Eye,
  PhoneCall,
  Plus,
  ShieldAlert,
  Trash2,
} from "lucide-react";

export function MedicalWizard() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [adding, setAdding] = useState<"contact" | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactLimitError, setContactLimitError] = useState<string | null>(null);

  const profile = useProfile((state) => state.profile);
  const updateProfile = useProfile((state) => state.update);

  if (!profile) return null;

  const toggleDisability = (disability: ProfileDisability) => {
    const current = profile.disabilities ?? [];
    const exists = current.includes(disability);
    let next: ProfileDisability[];
    if (exists) {
      next = current.filter((d) => d !== disability);
    } else {
      next = [...current, disability];
    }

    const channels = new Set(profile.channels);
    if (next.includes("deaf")) {
      channels.add("video");
      channels.add("rtt");
    }
    if (next.includes("blind")) {
      channels.add("voz");
    }

    void updateProfile({
      disabilities: next,
      channels: Array.from(channels),
    });
  };

  const addItem = () => {
    if (!canAddEmergencyContact((profile.emergencyContacts ?? []).length)) {
      setContactLimitError("Solo puedes guardar hasta 5 contactos de emergencia.");
      return;
    }
    setContactLimitError(null);
    setAdding("contact");
  };

  const removeItem = (id: string) => {
    void updateProfile({
      emergencyContacts: (profile.emergencyContacts ?? []).filter(
        (item) => item.id !== id
      ),
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Stepper Header */}
      <div className="mb-4 flex items-center justify-between relative before:absolute before:inset-0 before:top-1/2 before:-translate-y-1/2 before:h-1 before:bg-slate-200 dark:before:bg-slate-800 before:rounded-full z-0">
        <div className="absolute top-1/2 -translate-y-1/2 h-1 bg-[var(--accent)] transition-all duration-300 z-0 rounded-full" style={{ width: `${((step - 1) / 2) * 100}%` }} />
        
        {[
          { id: 1, label: "Apoyos", icon: Accessibility },
          { id: 2, label: "Salud", icon: Activity },
          { id: 3, label: "Red", icon: PhoneCall },
        ].map((s) => (
          <div key={s.id} className="relative z-10 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setStep(s.id as 1 | 2 | 3)}
              aria-label={`Paso ${s.id}: ${s.label}`}
              className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full font-bold transition-all shadow-md cursor-pointer ${
                step >= s.id
                  ? "bg-[var(--accent)] text-white ring-4 ring-white dark:ring-slate-900"
                  : "bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 ring-4 ring-white dark:ring-slate-900"
              }`}
            >
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>
            <span className={`mt-1.5 text-[10px] font-bold uppercase tracking-wider ${step >= s.id ? "text-[var(--accent-hover)] dark:text-sky-400" : "text-slate-400"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex flex-col">
        {/* Paso 1: Discapacidades */}
        {step === 1 && (
          <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 font-bold shrink-0">
                <Accessibility className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                  Necesidades de Apoyo
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecciona los apoyos para adaptar tu comunicación con el operador.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => toggleDisability("deaf")}
                className={`flex flex-col p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                  profile.disabilities.includes("deaf")
                    ? "border-[var(--accent)] bg-sky-50/80 dark:bg-sky-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/60 text-[var(--accent)] dark:text-sky-300 shrink-0">
                    <Ear className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex-1 leading-tight">Sordera</span>
                  {profile.disabilities.includes("deaf") ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Videollamada LSV y chat RTT.
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleDisability("blind")}
                className={`flex flex-col p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                  profile.disabilities.includes("blind")
                    ? "border-[var(--accent)] bg-sky-50/80 dark:bg-sky-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 shrink-0">
                    <Eye className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex-1 leading-tight">Ceguera</span>
                  {profile.disabilities.includes("blind") ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Activación por voz / Lector.
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleDisability("motor")}
                className={`flex flex-col p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                  profile.disabilities.includes("motor")
                    ? "border-[var(--accent)] bg-sky-50/80 dark:bg-sky-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 shrink-0">
                    <Accessibility className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex-1 leading-tight">Motor</span>
                  {profile.disabilities.includes("motor") ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Pulsadores externos / WebHID.
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleDisability("cognitive")}
                className={`flex flex-col p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                  profile.disabilities.includes("cognitive")
                    ? "border-[var(--accent)] bg-sky-50/80 dark:bg-sky-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 shrink-0">
                    <BrainCircuit className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white flex-1 leading-tight">Cognitivo</span>
                  {profile.disabilities.includes("cognitive") ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  ) : (
                    <span className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Pictogramas ARASAAC.
                </span>
              </button>
            </div>
            
            {profile.channels.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Canales:</span>
                {profile.channels.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" />
                    {c === "video" ? "Videollamada LSV" : c === "rtt" ? "Texto RTT" : "Voz Adaptada"}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Paso 2: Salud */}
        {step === 2 && (
          <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-400 font-bold shrink-0">
                  <Activity className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Perfil Clínico
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Datos vitales para los paramédicos.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex rounded bg-red-100 dark:bg-red-950/60 px-2 py-0.5 text-[10px] font-extrabold uppercase text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                RGPD Art. 9
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label htmlFor="tipo-sangre" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Sangre
                  </label>
                  <select
                    id="tipo-sangre"
                    value={profile.medicalData?.tipoSangre ?? ""}
                    onChange={(e) =>
                      void updateProfile({
                        medicalData: { ...profile.medicalData, tipoSangre: e.target.value, alergias: profile.medicalData?.alergias ?? [], condicionesMedicas: profile.medicalData?.condicionesMedicas ?? [], medicamentos: profile.medicalData?.medicamentos ?? [] },
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition cursor-pointer"
                  >
                    <option value="">No especificado</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alergias Conocidas
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: Penicilina..."
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            void updateProfile({ medicalData: { ...profile.medicalData, tipoSangre: profile.medicalData?.tipoSangre ?? "", alergias: [...(profile.medicalData?.alergias ?? []), val], condicionesMedicas: profile.medicalData?.condicionesMedicas ?? [], medicamentos: profile.medicalData?.medicamentos ?? [] } });
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(profile.medicalData?.alergias ?? []).map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                        {a}
                        <button
                          type="button"
                          onClick={() => {
                            const newAlergias = (profile.medicalData?.alergias ?? []).filter((_, idx) => idx !== i);
                            void updateProfile({ medicalData: { ...profile.medicalData, tipoSangre: profile.medicalData?.tipoSangre ?? "", alergias: newAlergias, condicionesMedicas: profile.medicalData?.condicionesMedicas ?? [], medicamentos: profile.medicalData?.medicamentos ?? [] } });
                          }}
                          className="ml-1 text-amber-600 hover:text-amber-800 cursor-pointer"
                        >×</button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Condiciones Médicas
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: Asma..."
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const val = e.currentTarget.value.trim();
                          if (val) {
                            void updateProfile({ medicalData: { ...profile.medicalData, tipoSangre: profile.medicalData?.tipoSangre ?? "", alergias: profile.medicalData?.alergias ?? [], condicionesMedicas: [...(profile.medicalData?.condicionesMedicas ?? []), val], medicamentos: profile.medicalData?.medicamentos ?? [] } });
                            e.currentTarget.value = "";
                          }
                        }
                      }}
                    />
                  </div>
                   <div className="flex flex-wrap gap-1.5 mt-2">
                    {(profile.medicalData?.condicionesMedicas ?? []).map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 rounded bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-2 py-1 text-[11px] font-bold text-purple-800 dark:text-purple-300">
                        {c}
                        <button
                          type="button"
                          onClick={() => {
                            const newConds = (profile.medicalData?.condicionesMedicas ?? []).filter((_, idx) => idx !== i);
                            void updateProfile({ medicalData: { ...profile.medicalData, tipoSangre: profile.medicalData?.tipoSangre ?? "", alergias: profile.medicalData?.alergias ?? [], condicionesMedicas: newConds, medicamentos: profile.medicalData?.medicamentos ?? [] } });
                          }}
                          className="ml-1 text-purple-600 hover:text-purple-800 cursor-pointer"
                        >×</button>
                      </span>
                    ))}
                  </div>
                </div>

                 <div>
                  <label htmlFor="notas-medicas" className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Notas adicionales
                  </label>
                  <textarea
                    id="notas-medicas"
                    rows={2}
                    value={profile.medicalNotes ?? ""}
                    onChange={(e) => void updateProfile({ medicalNotes: e.target.value })}
                    placeholder="Información extra..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Contactos */}
        {step === 3 && (
          <div className="flex-1 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] dark:text-sky-400 font-bold shrink-0">
                  <PhoneCall className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                    Red de Auxilio
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Familiares o cuidadores (Máx. 5)
                  </p>
                </div>
              </div>
               <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                {(profile.emergencyContacts ?? []).length}/5
              </span>
            </div>

            <div className="flex-1">
              {contactLimitError && (
                <p className="text-xs text-red-600 font-semibold p-2 rounded-lg bg-red-50 border border-red-200 mb-3" role="alert">
                  {contactLimitError}
                </p>
              )}

              {adding === "contact" && !editingContactId ? (
                <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/40 p-4 mb-3 animate-in fade-in zoom-in-95">
                  <ContactForm
                    onSubmit={(values) => {
                      void updateProfile({
                        emergencyContacts: [
                          ...(profile.emergencyContacts ?? []),
                          {
                            id: crypto.randomUUID(),
                            name: values.name,
                            phone: values.phone,
                            relation: values.relation,
                          },
                        ],
                      });
                      setAdding(null);
                    }}
                    onCancel={() => setAdding(null)}
                  />
                </div>
              ) : (
                (profile.emergencyContacts ?? []).length < 5 && (
                  <button
                    type="button"
                    onClick={addItem}
                    className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-sky-50 dark:hover:bg-sky-950/40 transition cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Registrar Nuevo Contacto</span>
                  </button>
                )
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(profile.emergencyContacts ?? []).map((c) => (
                  <div key={c.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-2xs hover:shadow-sm transition">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.name} <span className="font-normal text-[10px] text-slate-500">({c.relation})</span>
                      </p>
                      <p className="text-xs font-mono font-semibold text-[var(--accent)] dark:text-sky-400 mt-0.5">
                        {c.phone}
                      </p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditingContactId(c.id)}
                        className="text-[var(--accent)] hover:text-[var(--accent-hover)] p-2 sm:p-2.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 transition cursor-pointer"
                        title="Editar contacto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a2.121 2.121 0 1 1 3 3L7.5 21l-4 1 1-4Z"/></svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(c.id)}
                        className="text-red-500 hover:text-red-700 p-2 sm:p-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                        title="Eliminar contacto"
                      >
                        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </button>
                    </div>
                  </div>
                  {editingContactId === c.id && (
                    <div className="rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/40 p-4 mb-3 animate-in fade-in zoom-in-95">
                      <ContactForm
                        initialValues={{
                          name: c.name,
                          phone: c.phone,
                          relation: c.relation,
                        }}
                        onSubmit={(values) => {
                          void updateProfile({
                            emergencyContacts: (profile.emergencyContacts ?? []).map((ec) =>
                              ec.id === c.id
                                ? {
                                    ...ec,
                                    ...values,
                                  }
                                : ec
                            ),
                          });
                          setEditingContactId(null);
                        }}
                        onCancel={() => setEditingContactId(null)}
                      />
                    </div>
                  )}
                  </div>
                ))}
              </div>
            </div>
            
            {(profile.emergencyContacts ?? []).length > 0 && !adding && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  ¡Excelente! Tienes {profile.emergencyContacts?.length} contacto(s) registrado(s).
                </span>
              </div>
            )}
          </div>
        )}

        {/* Controles del Wizard */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep(step - 1 as 1 | 2)}
            disabled={step === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition ${
              step === 1
                ? "opacity-0 pointer-events-none"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          
          <button
            type="button"
            onClick={() => setStep(step + 1 as 2 | 3)}
            disabled={step === 3}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              step === 3
                ? "opacity-0 pointer-events-none"
                : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] cursor-pointer"
            }`}
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
