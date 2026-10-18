"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/src/components/siae/AdminSidebar";
import { AdminRole } from "@/src/modules/psap/types";
import { usePsapQueue } from "@/src/modules/psap/use-psap-queue";
import { Wifi, Clock, ShieldAlert, Volume2, VolumeX } from "lucide-react";

import { ThemeToggle } from "@/src/components/siae/ThemeToggle";

interface AdminShellLayoutProps {
  children: React.ReactNode;
}

export function AdminShellLayout({ children }: AdminShellLayoutProps) {
  const pathname = usePathname();

  // La pantalla de login institucional debe ser 100% limpia sin el shell operativo
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  const {
    queue,
    soundEnabled,
    setSoundEnabled,
    activePsap,
    streamConnected,
  } = usePsapQueue();

  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("es-VE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "America/Caracas",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const p0Count = queue.filter((item) => item.priority === "P0").length;

  return (
    <div className="fixed inset-0 flex h-full w-full overflow-hidden bg-[var(--background)] font-sans text-[var(--foreground)] transition-colors print:static print:overflow-visible print:h-auto print:w-full print:block">
      {/* Sidebar Lateral Permanente */}
      <AdminSidebar
        queueCount={queue.length}
        p0Count={p0Count}
        psapName={activePsap ? `${activePsap.nombre} (${activePsap.pais})` : "PSAP sin asignar"}
      />

      {/* Área Central Operativa */}
      <div className="flex flex-1 flex-col overflow-hidden h-full min-h-0 print:overflow-visible print:h-auto print:block print:w-full">
        {/* TopBar Operativo Superior con Fluent Acrylic Material */}
        <header className="fluent-acrylic flex h-14 shrink-0 items-center justify-between px-5 z-20 sticky top-0 transition-colors border-b border-slate-200/80 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <span className={`fluent-badge text-xs ${
              streamConnected
                ? "bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300"
                : "bg-amber-500/10 dark:bg-amber-950/60 border border-amber-500/25 text-amber-700 dark:text-amber-300"
            }`}>
              <span className={`h-2 w-2 rounded-full ${streamConnected ? "bg-emerald-500" : "bg-amber-500"}`} />
              {streamConnected ? "Flujo de eventos conectado" : "Flujo de eventos desconectado"}
            </span>
            <span className="hidden text-xs text-slate-500 dark:text-slate-400 sm:inline-flex sm:items-center sm:gap-1.5 font-medium">
              <Wifi className="h-3.5 w-3.5 text-[var(--accent)] dark:text-cyan-400" />
              Estado SSE del backend
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Selector Global de Tema Claro / Oscuro */}
            <ThemeToggle showLabel={false} />

            {/* Alerta sonora de cola con Fluent Button */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`fluent-btn fluent-btn-subtle !py-1 !px-2.5 !text-xs transition cursor-pointer ${
                soundEnabled
                  ? "!border-[var(--accent)]/40 !bg-[var(--accent)]/10 text-[var(--accent)] dark:!border-cyan-500/40 dark:!bg-cyan-500/10 dark:text-cyan-300 font-semibold"
                  : "!border-slate-200 dark:!border-slate-700 !bg-slate-50 dark:!bg-slate-800 text-slate-500 dark:text-slate-400"
              }`}
              aria-label={soundEnabled ? "Silenciar alertas sonoras" : "Activar alertas sonoras"}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span className="hidden md:inline">{soundEnabled ? "Audio ON" : "Mute"}</span>
            </button>

            {/* Reloj oficial VEN 911 */}
            <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <Clock className="h-3.5 w-3.5 text-[var(--accent)] dark:text-cyan-400" />
              <span className="font-bold">{time || "--:--:--"}</span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">HLV</span>
            </div>
          </div>
        </header>

        {/* Contenedor de Vistas:
            - Consolas operativas (/operador, /despachador, /admin exact, /admin/cint): overflow-hidden sin padding
            - Páginas de gestión (/admin/cuadrantes, /admin/usuarios, /dashboard, etc.): overflow-y-auto con padding
        */}
        <main
          className="flex-1 flex flex-col min-h-0 h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] overflow-y-auto p-0 bg-[var(--background)] transition-colors print:h-auto print:max-h-none print:overflow-visible print:w-full print:p-0 custom-scrollbar"
          id="main-admin-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
