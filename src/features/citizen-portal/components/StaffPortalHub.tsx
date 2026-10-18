import React from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Radio,
  ArrowRight,
  Users,
  LayoutDashboard,
} from "lucide-react";

export interface StaffPortalHubProps {
  activeUser: {
    nombre_completo?: string;
    role?: string;
    [key: string]: any;
  } | null;
}

export function StaffPortalHub({ activeUser }: StaffPortalHubProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 items-start">
      <div className="lg:col-span-8 fluent-card p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="fluent-badge bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <ShieldAlert className="h-3.5 w-3.5" />
              {activeUser?.role === "admin"
                ? "Centro de Control Administrativo"
                : "Consola Operativa PSAP"}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-[var(--accent-hover)] dark:text-white sm:text-3xl">
              Bienvenido, {activeUser?.nombre_completo}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Tiene una sesión activa con privilegios de comando y atención de emergencias.
              Acceda a sus herramientas operativas especializadas:
            </p>
          </div>
        </div>

        {/* Tarjetas de Acceso a Consolas */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Link
            href="/admin"
            className="group fluent-card p-5 hover:border-red-400 dark:hover:border-red-500 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <Radio className="h-5 w-5" />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              Cola de Despacho PSAP
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Atención directa a incidentes en tiempo real, videollamadas LSV y despacho georreferenciado.
            </p>
          </Link>

          {activeUser?.role === "admin" ? (
            <Link
              href="/admin/usuarios"
              className="group fluent-card p-5 hover:border-purple-400 dark:hover:border-purple-500 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                  <Users className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Gestión de Usuarios y Roles
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Bloquear o desbloquear identidades, asignar roles de operador y eliminar cuentas del sistema.
              </p>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="group fluent-card p-5 hover:border-cyan-400 dark:hover:border-cyan-500 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-400">
                  <LayoutDashboard className="h-5 w-5" />
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
                Panel de Métricas del PSAP
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Monitoreo en vivo de tiempos de respuesta, saturación de líneas y latencia de red.
              </p>
            </Link>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 space-y-4">
        <div className="fluent-card p-5 border-l-4 border-l-[var(--accent)]">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-[var(--accent)] dark:bg-sky-950/80 dark:text-sky-400">
              <Radio className="h-4 w-4" />
            </span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Puesto de Mando VEN 911
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Estación de Trabajo de Escritorio</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
            Esta consola opera en modo web de alta densidad para atención continua de emergencias, coordinación de cuadrantes y despacho táctico.
          </p>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Rol Activo:</span>
              <span className="font-bold text-slate-900 dark:text-white capitalize">
                {activeUser?.role?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Conexión:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Red Segura Militar/Policial</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Latencia SSE:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">&lt; 25 ms</span>
            </div>
          </div>
          <Link
            href="/admin"
            className="mt-4 flex items-center justify-center gap-2 w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white hover:bg-[var(--accent-hover)] transition shadow-sm"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Abrir Consola Operativa</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
