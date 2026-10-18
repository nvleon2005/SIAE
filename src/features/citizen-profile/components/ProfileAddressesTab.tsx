import React, { useState } from "react";
import { MapPin, Phone, Plus, Pencil, Trash2 } from "lucide-react";
import { ContactForm } from "@/src/components/siae/ProfileForms";
import { AddressDrawer } from "@/src/components/siae/AddressDrawer";
import {
  LocalProfileRecord,
  canAddEmergencyContact,
} from "@/src/lib/profile-db";

interface ProfileAddressesTabProps {
  profile: LocalProfileRecord;
  updateProfile: (patch: Partial<LocalProfileRecord>) => Promise<void>;
  onDeleteAllData: () => void;
}

export function ProfileAddressesTab({
  profile,
  updateProfile,
  onDeleteAllData,
}: ProfileAddressesTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerAddressId, setDrawerAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState<"contact" | null>(null);
  const [contactLimitError, setContactLimitError] = useState<string | null>(null);

  const handleAddContactClick = () => {
    if (!canAddEmergencyContact((profile.emergencyContacts ?? []).length)) {
      setContactLimitError("Límite alcanzado: máximo 5 contactos de emergencia.");
      return;
    }
    setContactLimitError(null);
    setAdding("contact");
  };

  const handleRemoveItem = (type: "address" | "contact", id: string) => {
    if (type === "address") {
      void updateProfile({
        addresses: (profile.addresses ?? []).filter((a) => a.id !== id),
      });
    } else {
      void updateProfile({
        emergencyContacts: (profile.emergencyContacts ?? []).filter((c) => c.id !== id),
      });
    }
  };

  return (
    <div
      role="tabpanel"
      id="panel-domicilios"
      aria-labelledby="tab-domicilios"
      className="space-y-5"
    >
      {/* ROW 1: Domicilios Frecuentes */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[var(--accent)] dark:text-sky-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Domicilios Frecuentes</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Puntos de rescate georreferenciados · Maturín, Monagas</p>
            </div>
          </div>
          <button
            id="btn-add-address"
            data-testid="btn-add-address"
            type="button"
            onClick={() => { setDrawerAddressId(null); setDrawerOpen(true); }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--accent)] text-white text-xs font-bold hover:bg-[var(--accent-hover)] transition cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Añadir Domicilio</span>
          </button>
        </div>

        {(profile.addresses ?? []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {profile.addresses.map((address) => (
              <div key={address.id} className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] text-white px-2 py-0.5 text-[10px] font-extrabold uppercase">
                        <MapPin className="h-3 w-3" />
                        {address.label || "Domicilio"}
                      </span>
                      {address.parroquia && (
                        <span className="rounded-md bg-sky-100 dark:bg-sky-950/70 text-sky-800 dark:text-sky-300 px-2 py-0.5 text-[10px] font-bold">Pq. {address.parroquia}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug truncate">{address.value}</p>
                    {typeof address.lat === "number" && (
                      <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">📍 {address.lat.toFixed(4)}, {address.lng?.toFixed(4)}</p>
                    )}
                    {address.referencePoint && (
                      <p className="mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed line-clamp-2">
                        🏁 {address.referencePoint}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => { setDrawerAddressId(address.id); setDrawerOpen(true); }}
                      className="p-2 rounded-lg text-[var(--accent)] hover:bg-sky-50 dark:hover:bg-sky-950/40 transition cursor-pointer"
                      aria-label={`Editar ${address.label}`}
                      title="Editar domicilio"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem("address", address.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                      aria-label={`Eliminar ${address.label}`}
                      title="Eliminar domicilio"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <MapPin className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">Sin domicilios guardados</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Añade tu residencia, lugar de trabajo o punto de rescate favorito para agilizar la respuesta de las unidades VEN 911.</p>
          </div>
        )}
      </section>

      {/* ROW 2: Contactos de Emergencia */}
      <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Contactos de Emergencia</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personas de confianza para contactar en caso de emergencia</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddContactClick}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Añadir Contacto</span>
          </button>
        </div>

        {contactLimitError && (
          <div className="mb-4 rounded-xl bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            {contactLimitError}
          </div>
        )}

        {adding === "contact" && (
          <div className="mb-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4">
            <ContactForm
              onSubmit={(values) => {
                void updateProfile({
                  emergencyContacts: [
                    ...(profile.emergencyContacts ?? []),
                    { id: crypto.randomUUID(), ...values },
                  ],
                });
                setAdding(null);
              }}
              onCancel={() => setAdding(null)}
            />
          </div>
        )}

        {(profile.emergencyContacts ?? []).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.emergencyContacts?.map((contact) => (
              <div key={contact.id} className="group flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{contact.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{contact.relation} · {contact.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveItem("contact", contact.id)}
                  className="p-2 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/30 transition cursor-pointer"
                  aria-label={`Eliminar a ${contact.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
            <Phone className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">No tienes contactos añadidos</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mx-auto">Añade familiares, amigos o médicos tratantes para contactarlos rápidamente.</p>
          </div>
        )}
      </section>

      {/* Zona de Peligro / Borrado de Datos */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onDeleteAllData}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold hover:bg-rose-100 transition cursor-pointer shadow-2xs"
        >
          <Trash2 className="h-4 w-4" />
          <span>Borrar todos mis datos</span>
        </button>
      </div>

      {/* Address Drawer (slide-in) */}
      <AddressDrawer
        open={drawerOpen}
        mode={drawerAddressId ? "edit" : "add"}
        initialValues={drawerAddressId ? (() => {
          const addr = (profile.addresses ?? []).find((a) => a.id === drawerAddressId);
          return addr ? { label: addr.label, value: addr.value, referencePoint: addr.referencePoint ?? "", parroquia: addr.parroquia ?? "", lat: addr.lat, lng: addr.lng, accuracy: addr.accuracy } : undefined;
        })() : undefined}
        onSubmit={(values) => {
          if (drawerAddressId) {
            void updateProfile({
              addresses: (profile.addresses ?? []).map((a) =>
                a.id === drawerAddressId ? { ...a, ...values } : a
              ),
            });
          } else {
            void updateProfile({
              addresses: [
                ...(profile.addresses ?? []),
                { id: crypto.randomUUID(), label: values.label, value: values.value, referencePoint: values.referencePoint, parroquia: values.parroquia, lat: values.lat, lng: values.lng, accuracy: values.accuracy },
              ],
            });
          }
          setDrawerOpen(false);
          setDrawerAddressId(null);
        }}
        onClose={() => { setDrawerOpen(false); setDrawerAddressId(null); }}
      />
    </div>
  );
}
