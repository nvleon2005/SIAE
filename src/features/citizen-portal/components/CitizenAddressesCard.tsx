import React from "react";
import Link from "next/link";
import { MapPin, Users, ChevronRight } from "lucide-react";
import { LocalProfileRecord } from "@/src/lib/profile-db";

export interface CitizenAddressesCardProps {
  profile: LocalProfileRecord;
}

export function CitizenAddressesCard({ profile }: CitizenAddressesCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Card: Domicilios */}
      <div className="fluent-card overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-sky-50/60 dark:bg-sky-950/30">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/80 text-sky-700 dark:text-sky-300">
                <MapPin className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Domicilios de Auxilio
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {profile.addresses.length} {profile.addresses.length === 1 ? "ubicación" : "ubicaciones"} registradas
                </p>
              </div>
            </div>
            <Link
              href="/perfil?tab=usuario"
              className="text-xs font-bold text-[var(--accent)] dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
            >
              Gestionar <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-5">
            {profile.addresses.length > 0 ? (
              <div className="space-y-2.5">
                {profile.addresses.slice(0, 2).map((addr) => (
                  <div
                    key={addr.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 p-3 hover:border-[var(--accent)]/40 transition-all"
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[var(--accent)] text-white px-2 py-0.5 text-[9px] font-extrabold uppercase">
                        {addr.label}
                      </span>
                      {addr.parroquia && (
                        <span className="rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 px-1.5 py-0.5 text-[9px] font-bold">
                          Pq. {addr.parroquia}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                      {addr.value}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-6 px-3 text-center">
                <MapPin className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sin domicilios registrados</p>
                <Link href="/perfil?tab=usuario" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] dark:text-sky-400 hover:underline">
                  Registrar con GPS &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card: Contactos de Emergencia */}
      <div className="fluent-card overflow-hidden flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-amber-50/60 dark:bg-amber-950/30">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300">
                <Users className="h-4.5 w-4.5" />
              </span>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Contactos de Emergencia
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {profile.emergencyContacts.length}/5 contactos
                </p>
              </div>
            </div>
            <Link
              href="/perfil?tab=usuario"
              className="text-xs font-bold text-[var(--accent)] dark:text-sky-400 hover:underline inline-flex items-center gap-0.5"
            >
              Gestionar <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="p-5">
            {profile.emergencyContacts.length > 0 ? (
              <div className="space-y-2.5">
                {profile.emergencyContacts.slice(0, 2).map((contact) => (
                  <div key={contact.id} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/60">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/60 text-xs font-black text-amber-800 dark:text-amber-300">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{contact.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{contact.relation}</p>
                      </div>
                    </div>
                    <span className="font-mono text-[11px] text-[var(--accent)] dark:text-sky-400 font-bold ml-2 shrink-0">
                      {contact.phone}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 py-6 px-3 text-center">
                <Users className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sin contactos registrados</p>
                <Link href="/perfil?tab=usuario" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] dark:text-sky-400 hover:underline">
                  Añadir contacto de auxilio &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
