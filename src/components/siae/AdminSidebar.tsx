"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Inbox,
  LayoutDashboard,
  MapPin,
  PhoneCall,
  Video,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Radio,
  Users,
  Layers,
  Navigation,
  Tag,
  CheckCircle2,
  Building2,
  Headphones,
} from "lucide-react";
import { logoutCurrentSession, useAuth } from "@/src/modules/auth/auth-store";

interface AdminSidebarProps {
  queueCount?: number;
  p0Count?: number;
  operatorName?: string;
  psapName?: string;
}

export function AdminSidebar({
  queueCount = 0,
  p0Count = 0,
  operatorName = "",
  psapName = "PSAP sin asignar",
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const user = useAuth((state) => state.user);
  // Infiere el rol a partir de la ruta actual si el usuario aún no se ha cargado en el cliente
  const inferRoleFromPath = (): string => {
    if (pathname.startsWith("/despachador")) return "despachador";
    if (pathname.startsWith("/operador")) return "operador";
    if (pathname.startsWith("/admin/cint")) return "interprete_lsv";
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/admin/usuarios") ||
      pathname.startsWith("/admin/cuadrantes") ||
      pathname.startsWith("/admin/organismos") ||
      pathname.startsWith("/admin/auditoria") ||
      pathname.startsWith("/admin/tipificaciones")
    )
      return "admin";
    if (pathname.startsWith("/admin")) return "supervisor";
    return "operador";
  };

  // En rutas de consolas dedicadas (/despachador, /operador, /admin/cint), la consola siempre determina
  // la navegación de manera determinista e idéntica tanto en SSR como en cliente.
  const pathConsoleRole = pathname.startsWith("/despachador")
    ? "despachador"
    : pathname.startsWith("/operador")
    ? "operador"
    : pathname.startsWith("/admin/cint")
    ? "interprete_lsv"
    : null;

  const rawRole = (
    pathConsoleRole ||
    (mounted ? user?.role : null) ||
    inferRoleFromPath()
  ).toLowerCase();
  const role = rawRole === "operator" ? "operador"
    : rawRole === "dispatcher" ? "despachador"
    : rawRole === "admin_psap" ? "admin"
    : rawRole === "supervisor_psap" ? "supervisor"
    : rawRole === "interprete_lse" ? "interprete_lsv"
    : rawRole;

  const isAdmin = role === "admin";
  const isSupervisor = role === "supervisor";
  const isDispatcher = role === "despachador";
  const isOperator = role === "operador";
  const isInterpreter = role === "interprete_lsv";

  // ── Etiqueta de rol visible para el badge ──────────────────────────────────
  const roleLabel = isDispatcher ? "Despachador CAD"
    : isAdmin ? "Admin Global"
    : isSupervisor ? "Supervisor PSAP"
    : isInterpreter ? "Intérprete LSV"
    : "Operador PSAP";

  const roleBadgeClass = isAdmin
    ? "bg-[var(--emergency)]/10 text-[var(--emergency)]"
    : isDispatcher
    ? "bg-[var(--accent)]/15 text-[var(--accent)] dark:bg-sky-500/20 dark:text-sky-300"
    : isSupervisor
    ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
    : isInterpreter
    ? "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300"
    : "bg-[var(--accent)]/10 text-[var(--accent)] dark:bg-sky-500/15 dark:text-sky-300";


  // ─── Navegación estrictamente aislada por rol (doctrina VEN 911) ───────────
  // Cada rol ve ÚNICAMENTE sus herramientas propias. Sin acceso cruzado.
  type NavLink = {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    alertBadge?: string;
    shortcut?: string;
  };

  const navLinks: NavLink[] = isOperator
    ? [
        // OPERADOR: Solo puesto de atención ACD, incidencias atendidas, CINT y ajustes de puesto
        { href: "/operador", label: "Puesto de Atención ACD", icon: Headphones, badge: queueCount, alertBadge: p0Count > 0 ? `${p0Count} P0` : undefined, shortcut: "1" },
        { href: "/operador#atendidas", label: "Incidencias Atendidas", icon: CheckCircle2, shortcut: "2" },
        { href: "/admin/cint", label: "Centro Intermediación (LSV)", icon: Video, shortcut: "3" },
        { href: "/admin/ajustes", label: "Ajustes de Puesto", icon: Settings },
      ]
    : isDispatcher
    ? [
        // DESPACHADOR: Solo consola CAD, expedientes cerrados, entes registrados y mapa
        { href: "/despachador", label: "Consola Táctica CAD", icon: Layers, badge: queueCount, alertBadge: p0Count > 0 ? `${p0Count} P0` : undefined, shortcut: "1" },
        { href: "/despachador#cerrados", label: "Expedientes Cerrados", icon: CheckCircle2, shortcut: "2" },
        { href: "/despachador#entes", label: "Entes Registrados", icon: Building2, shortcut: "3" },
        { href: "/despachador#mapa", label: "Mapa de Cuadrantes CAD", icon: MapPin, shortcut: "4" },
        { href: "/admin/ajustes", label: "Ajustes de Puesto", icon: Settings },
      ]
    : role === "interprete_lsv"
    ? [
        // INTÉRPRETE LSV: Solo sala de interpretación y ajustes
        { href: "/admin/cint", label: "Cola de Interpretación LSV", icon: Video, badge: queueCount, shortcut: "1" },
        { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
      ]
    : isSupervisor
    ? [
        // SUPERVISOR: Vista transversal de supervisión, analítica y acceso a consolas
        { href: "/admin", label: "Supervisión de Sala y KPIs", icon: LayoutDashboard, shortcut: "1" },
        { href: "/admin/reportes", label: "Reportes y Auditoría", icon: FileText, shortcut: "2" },
        { href: "/operador", label: "Puesto Operador PSAP", icon: PhoneCall, shortcut: "3" },
        { href: "/despachador", label: "Puesto Despachador CAD", icon: Layers, shortcut: "4" },
        { href: "/admin/cint", label: "Centro Intermediación (LSV)", icon: Video, shortcut: "5" },
        { href: "/admin/ajustes", label: "Ajustes de Puesto", icon: Settings },
      ]
    : isAdmin
    ? [
        // ADMIN GLOBAL: Panel ejecutivo, reportes forenses, CINT y módulos de gestión
        { href: "/admin", label: "Panel de Mando y KPIs", icon: LayoutDashboard, shortcut: "1" },
        { href: "/admin/reportes", label: "Reportes y Expedientes", icon: FileText, shortcut: "2" },
        { href: "/admin/cint", label: "Centro Intermediación (LSV)", icon: Video, shortcut: "3" },
        { href: "/admin/usuarios", label: "Gestión de Usuarios y Roles", icon: Users, shortcut: "4" },
        { href: "/admin/cuadrantes", label: "Cuadrantes de Paz", icon: MapPin, shortcut: "5" },
        { href: "/admin/organismos", label: "Organismos Registrados", icon: Layers, shortcut: "6" },
        { href: "/admin/auditoria", label: "Auditoría Criptográfica SHA", icon: FileText, shortcut: "7" },
        { href: "/admin/tipificaciones", label: "Catálogo Tipificaciones", icon: Tag, shortcut: "8" },
        { href: "/admin/ajustes", label: "Ajustes del Sistema", icon: Settings },
      ]
    : [
        // Fallback genérico
        { href: "/admin", label: "Panel PSAP", icon: Inbox, badge: queueCount },
        { href: "/admin/ajustes", label: "Ajustes", icon: Settings },
      ];

  return (
    <aside
      aria-label="Menú lateral de despacho"
      suppressHydrationWarning
      className={`relative flex flex-col h-full min-h-0 overflow-hidden overflow-x-hidden fluent-sidebar text-[var(--foreground)] transition-all duration-200 z-30 print:hidden ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Botón para colapsar / expandir */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--muted)] hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Cabecera del Sidebar */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200/80 dark:border-slate-800 px-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)] font-black text-white shadow-sm text-sm">
          S
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[var(--accent)] dark:text-sky-400 truncate block leading-none">
              SIAE · VEN 911
            </span>
            <h2 className="truncate text-xs font-bold text-[var(--foreground)] leading-snug mt-0.5">{psapName}</h2>
          </div>
        )}
      </div>

      {/* Info de Perfil y Rol del Operador (Mismo estilo que el Solicitante) */}
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-white shadow-xs bg-[var(--accent)] text-xs">
                O
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-bold text-[var(--foreground)] truncate" title={operatorName || user?.nombre_completo || "Sesión no disponible"}>
                    {operatorName || user?.nombre_completo || "Sesión no disponible"}
                  </p>
                </div>
                {mounted && (
                  <span suppressHydrationWarning className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider mt-1 ${roleBadgeClass}`}>
                    {roleLabel}
                  </span>
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="flex justify-center" aria-label={user?.nombre_completo ?? "Sesión no disponible"} />
        )}
      </div>

      {/* Enlaces de Navegación */}
      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3" suppressHydrationWarning aria-label="Enlaces de navegación">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href.includes("#") && pathname === link.href.split("#")[0]);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? link.label : undefined}
              onClick={() => {
                if (link.href.includes("#")) {
                  const [basePath, hash] = link.href.split("#");
                  if (pathname === basePath && typeof window !== "undefined") {
                    window.location.hash = hash;
                    window.dispatchEvent(new HashChangeEvent("hashchange"));
                    if (hash === "mapa") {
                      setTimeout(() => {
                        document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }
                  }
                }
              }}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-[var(--accent)] text-white shadow-xs dark:bg-sky-600 dark:text-white"
                  : "text-[var(--muted)] hover:bg-[var(--accent)]/8 hover:text-[var(--foreground)] dark:hover:bg-slate-800/80"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  isActive ? "text-white" : "text-[var(--muted)]"
                }`}
                aria-hidden="true"
              />
              {!collapsed && (
                <div className="flex flex-1 items-center justify-between">
                  <span className="truncate">{link.label}</span>
                  <div className="flex items-center gap-1.5">
                    {link.alertBadge && (
                      <span className="rounded-md bg-red-600 text-white px-1.5 py-0.5 text-[10px] font-black border border-red-500 shadow-xs">
                        {link.alertBadge}
                      </span>
                    )}
                    {link.badge !== undefined && !link.alertBadge && (
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-slate-900/30 dark:text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent"
                      }`}>
                        {link.badge}
                      </span>
                    )}
                    {link.shortcut && (
                      <kbd className={`hidden rounded px-1.5 py-0.5 text-[9px] font-mono xl:inline-block ${
                        isActive
                          ? "bg-white/20 text-white dark:bg-slate-900/30 dark:text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-transparent"
                      }`}>
                        {link.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar: Cerrar Sesión */}
      <div className="border-t border-slate-200/80 dark:border-slate-800 p-3 pb-6 flex flex-col gap-2">
        <button
          type="button"
          onClick={logoutCurrentSession}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-[var(--emergency)] hover:bg-[var(--emergency)]/10 transition cursor-pointer"
          aria-label="Cerrar sesión"
          title={collapsed ? "Cerrar sesión" : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0 text-[var(--emergency)]" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
