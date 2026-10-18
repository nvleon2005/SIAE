import React from "react";
import Link from "next/link";
import {
  UserCheck,
  Lock,
  HeartPulse,
  MapPin,
  Ear,
  Users,
  Eye,
  Accessibility,
  BrainCircuit,
  Smartphone,
  Download,
  HelpCircle,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

export interface CitizenPublicLandingProps {
  onTriggerSosEmergency?: () => void;
  isAuth: boolean;
}

export function CitizenPublicLanding({
  onTriggerSosEmergency,
  isAuth,
}: CitizenPublicLandingProps) {
  return (
    <div className="landing-page -mx-4 space-y-0 bg-[#edf2f6] px-4 py-6 sm:-mx-6 sm:px-6">
      {/* ── HERO: Split Fluent Card con Reveal Highlight y Microsoft Fluent Stage ── */}
      <div className="fluent-card mb-6 overflow-hidden border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,35,58,0.16)] dark:border-slate-800 dark:bg-slate-950">
        <div className="grid lg:grid-cols-5">
          {/* Columna izquierda — fondo blanco luminoso con sutil tinte Fluent */}
          <div className="relative flex flex-col gap-6 overflow-hidden bg-gradient-to-b from-[#102e4c] via-[#0d233a] to-[#071524] px-8 py-10 text-white lg:col-span-3">
            {/* Luz ambiental sutil de fondo */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />

            {/* Etiqueta institucional con Fluent Badges */}
            <div className="flex flex-wrap items-center gap-2 relative z-10">
              <span className="fluent-badge border border-sky-400/30 bg-sky-950/40 text-sky-200 backdrop-blur-md uppercase tracking-widest text-[10px]">
                VEN 911 &middot; Maturín, Monagas
              </span>
              <span className="fluent-badge bg-emerald-500/10 dark:bg-emerald-950/60 border border-emerald-500/20 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px]">
                <span className="relative flex h-2 w-2 mr-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                Operativo 24 / 7
              </span>
            </div>

            {/* Titulo principal — escala tipografica amplia */}
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-[1.08]">
                Emergencias sin<br />
                <span className="text-sky-300">barreras.</span>
              </h2>
              <h3 className="mt-2 text-sm font-bold text-slate-100">
                Acceda a su perfil de ayuda y active asistencia inmediata
              </h3>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300">
                SIAE conecta a ciudadanos con discapacidad auditiva, visual, motora o cognitiva con el Centro de Comando VEN 911 en segundos, usando su propio canal de comunicación.
              </p>
            </div>

            {/* 4 stats en micro-tarjetas interactivas */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 relative z-10">
              {([
                { v: "<3 s", l: "sala creada", c: "text-sky-300" },
                { v: "<8 s", l: "agente asignado", c: "text-emerald-300" },
                { v: "24/7", l: "intérprete LSV", c: "text-amber-300" },
                { v: "40", l: "cuadrantes", c: "text-violet-300" },
              ] as const).map((s) => (
                <div
                  key={s.l}
                  className="fluent-card !border-white/10 !bg-white/5 !shadow-none hover:!bg-white/10 hover:!shadow-sm p-3 flex flex-col gap-0.5 transition-all duration-200 group cursor-default"
                >
                  <span
                    className={`text-xl font-black tabular-nums ${s.c} group-hover:scale-105 transition-transform duration-200 origin-left`}
                  >
                    {s.v}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-300 uppercase tracking-wider leading-tight">
                    {s.l}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA principal con botones Fluent */}
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              <Link
                href="/register"
                className="fluent-btn fluent-btn-accent px-6 py-3.5 text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group flex items-center gap-2 rounded-xl"
              >
                <UserCheck className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                <span>Crear mi Perfil de Ayuda</span>
              </Link>
              <Link
                href="/login"
                className="fluent-btn fluent-btn-subtle border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 flex items-center gap-2 rounded-xl group hover:bg-white/10"
              >
                <Lock className="h-4 w-4 text-sky-200 transition-colors" />
                <span>Ya tengo cuenta</span>
              </Link>
            </div>

            {/* Marco legal institucional */}
            <div className="relative z-10 text-[10px] leading-relaxed text-slate-400">
              Art. 81 CRBV &middot; Ley CONAPDIS &middot; CDPD ONU Arts. 11 y 21 &middot; WCAG 2.1 AA &middot; EN 301 549 &middot; Ley de Infogobierno
              {onTriggerSosEmergency && (
                <>
                  {" "}&mdash;{" "}
                  <button
                    type="button"
                    onClick={onTriggerSosEmergency}
                    className="text-red-500 hover:underline font-semibold cursor-pointer"
                  >
                    Reportar emergencia ajena (testigo)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Columna derecha — Fluent Showcase Stage */}
          <div className="relative flex flex-col justify-between overflow-hidden border-t border-slate-200/80 bg-gradient-to-br from-[#f7fbfe] via-[#edf5fa] to-[#d8eaf6] p-6 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 lg:col-span-2 lg:border-l lg:border-t-0 sm:p-7">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-sky-400/15 blur-3xl dark:bg-sky-500/15" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10" />

            {/* Ventana Fluent: Ficha de Telemetría en Vivo */}
            <div className="relative z-10 flex flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-5 shadow-2xl shadow-[#031c31]/25 backdrop-blur-xl transition-all duration-300 hover:border-cyan-200 hover:shadow-cyan-950/20 dark:border-sky-800 dark:bg-slate-900/95">
              <div className="h-1.5 -mx-5 -mt-5 mb-4 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500" />

              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-600 text-white shadow-xs font-black text-xs">
                    911
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-sky-400 block leading-tight">
                      TELEMETRÍA VEN 911
                    </span>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                      Ficha de Respuesta Inmediata
                    </h4>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[10px] font-bold">
                  <span className="relative flex h-2 w-2 mr-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Enlace Activo
                </span>
              </div>

              {/* 4 Items de Telemetria */}
              <div className="space-y-2 mt-3.5">
                {([
                  {
                    icon: <HeartPulse className="h-4 w-4" />,
                    iconStyle: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200/60 dark:border-red-800/60",
                    title: "Ficha médica vital",
                    desc: "Grupo O+ &middot; Alergias y condiciones crónicas en pantalla.",
                  },
                  {
                    icon: <MapPin className="h-4 w-4" />,
                    iconStyle: "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60",
                    title: "Ubicación GPS y cuadrante",
                    desc: "Maturín Centro &middot; Precisión satelital &lt;3 metros.",
                  },
                  {
                    icon: <Ear className="h-4 w-4" />,
                    iconStyle: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60",
                    title: "Canal de auxilio asignado",
                    desc: "Intérprete LSV o chat RTT en tiempo real sin voz.",
                  },
                  {
                    icon: <Users className="h-4 w-4" />,
                    iconStyle: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60",
                    title: "Red familiar notificada",
                    desc: "Aviso automático por SMS a tus contactos clave.",
                  },
                ] as const).map((item) => (
                  <div
                    key={item.title}
                    className="bg-slate-50/70 hover:bg-blue-50/40 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-100 hover:border-blue-200/80 dark:border-slate-700/60 rounded-xl p-2.5 flex items-start gap-2.5 transition-all duration-200 group cursor-default hover:shadow-xs"
                  >
                    <span className={`mt-0.5 shrink-0 p-1.5 rounded-lg ${item.iconStyle} group-hover:scale-110 transition-transform duration-200`}>
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                        {item.title}
                      </p>
                      <p
                        className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5"
                        dangerouslySetInnerHTML={{ __html: item.desc }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pie de la Ficha Fluent */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                  Cifrado de extremo a extremo
                </span>
                <span className="font-semibold text-blue-600 dark:text-sky-400">Ley de Infogobierno</span>
              </div>
            </div>

            {/* Explicación al usuario */}
            <div className="mt-3 relative z-10 text-center">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight font-medium">
                El operador del VEN 911 recibe esta telemetría automáticamente al activar la alerta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECCION 2: PARA QUIEN ES SIAE ── */}
      <div className="mb-6">
        <div className="flex items-end justify-between mb-4">
          <div>
            <span className="fluent-badge bg-sky-100/70 text-[var(--accent)] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 mb-2 uppercase tracking-widest text-[10px]">
              Diseñado para ti
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              ¿Quién usa SIAE?
            </h3>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {([
            {
              icon: <Ear className="h-5 w-5" />,
              borderTop: "border-t-4 border-t-sky-500",
              iconBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-300",
              tag: "LSV &middot; RTT",
              tagCl: "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800",
              title: "Personas Sordas",
              desc: "Intérprete LSV en menos de 60 s. Chat RTT en tiempo real. Sin hablar ni escuchar.",
            },
            {
              icon: <Eye className="h-5 w-5" />,
              borderTop: "border-t-4 border-t-amber-500",
              iconBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300",
              tag: "Voz &middot; Lectores",
              tagCl: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
              title: "Ceguera y Baja Visión",
              desc: "Activa con tu voz sin tocar la pantalla. Compatible con lectores de pantalla.",
            },
            {
              icon: <Accessibility className="h-5 w-5" />,
              borderTop: "border-t-4 border-t-emerald-500",
              iconBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300",
              tag: "Pulsador &middot; Switch",
              tagCl: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
              title: "Movilidad Reducida",
              desc: "Un solo pulsador Bluetooth activa la emergencia. Zonas táctiles grandes.",
            },
            {
              icon: <BrainCircuit className="h-5 w-5" />,
              borderTop: "border-t-4 border-t-purple-500",
              iconBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300",
              tag: "Pictogramas ARASAAC",
              tagCl: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
              title: "Apoyo Cognitivo",
              desc: "Flujos guiados con pictogramas. Sin texto complejo. Sin sobrecarga cognitiva.",
            },
          ] as const).map((p) => (
            <div
              key={p.title}
              className={`fluent-card group p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-default ${p.borderTop}`}
            >
              <div className="flex items-center justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${p.iconBg} shadow-xs group-hover:scale-110 group-hover:shadow-sm transition-all duration-300`}>
                  {p.icon}
                </span>
                <span
                  className={`fluent-badge ${p.tagCl} text-[10px] font-bold`}
                  dangerouslySetInnerHTML={{ __html: p.tag }}
                />
              </div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight group-hover:text-[var(--accent)] dark:group-hover:text-sky-400 transition-colors">
                {p.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCION 3: COMO FUNCIONA ── */}
      <div className="fluent-card mb-6 overflow-hidden">
        <div className="px-7 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="fluent-badge bg-sky-100/70 text-[var(--accent)] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60 mb-2 uppercase tracking-widest text-[10px]">
              Protocolo de emergencia
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
              Cómo funciona cuando lo necesitas
            </h3>
          </div>
          <span className="fluent-badge bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] hidden sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
            Red VEN 911 en línea
          </span>
        </div>

        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
          {([
            {
              num: "01",
              col: "text-[var(--accent)]",
              bg: "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20",
              title: "Te registras una vez",
              time: "Hoy &mdash; gratuito",
              desc: "Discapacidad, domicilio, contactos y ficha médica básica. Una sola vez, para siempre.",
            },
            {
              num: "02",
              col: "text-purple-600 dark:text-purple-400",
              bg: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800",
              title: "Activas la emergencia",
              time: "menos de 1 segundo",
              desc: "Un toque, tu voz, un pulsador externo o un gesto activa la alerta con tu GPS automático.",
            },
            {
              num: "03",
              col: "text-red-600 dark:text-red-400",
              bg: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800",
              title: "VEN 911 responde",
              time: "menos de 8 segundos",
              desc: "El operador recibe tu perfil completo, tu ubicación y te atiende en tu canal sin barreras.",
            },
          ] as const).map((step) => (
            <div
              key={step.num}
              className="group px-7 py-6 flex flex-col gap-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors duration-200 cursor-default relative"
            >
              <div className="flex items-center gap-3">
                <span className={`text-4xl font-black leading-none ${step.col} group-hover:scale-105 transition-transform duration-200 origin-left`}>
                  {step.num}
                </span>
                <span
                  className={`fluent-badge ${step.bg} text-[10px] font-bold`}
                  dangerouslySetInnerHTML={{ __html: step.time }}
                />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight group-hover:text-[var(--accent)] dark:group-hover:text-sky-400 transition-colors">
                {step.title}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECCION 4: ACCIONES RAPIDAS ── */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* Familiares */}
        <div className="fluent-card group p-6 flex flex-col gap-3.5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default border-t-4 border-t-emerald-500">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 group-hover:scale-110 transition-transform duration-300 shadow-xs">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <span className="fluent-badge bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 mb-1 text-[10px] font-bold uppercase tracking-wider">
              Tutores y familiares
            </span>
            <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight mt-1">
              Registrar a mi familiar
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              Configura el perfil de un familiar con discapacidad y establece los contactos de emergencia.
            </p>
          </div>
          <Link
            href="/register"
            className="fluent-btn bg-emerald-700 hover:bg-emerald-800 text-white mt-auto px-4 py-2.5 text-xs font-bold transition-all w-fit shadow-xs group-hover:shadow-md flex items-center gap-1.5 rounded-xl"
          >
            <UserCheck className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            <span>Registrar familiar</span>
          </Link>
        </div>

        {/* Instala la PWA */}
        <div className="fluent-card group p-6 flex flex-col gap-3.5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default border-t-4 border-t-[var(--accent)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-900/60 text-[var(--accent)] dark:text-sky-300 group-hover:scale-110 transition-transform duration-300 shadow-xs">
            <Smartphone className="h-5 w-5" />
          </span>
          <div>
            <span className="fluent-badge bg-sky-50 dark:bg-sky-950/50 text-[var(--accent)] dark:text-sky-400 border border-sky-200 dark:border-sky-800 mb-1 text-[10px] font-bold uppercase tracking-wider">
              Sin App Store
            </span>
            <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight mt-1">
              Instala en tu móvil
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              SIAE es una PWA instalable desde el navegador. Android, iOS, Windows y macOS.
            </p>
          </div>
          <Link
            href="/register"
            className="fluent-btn fluent-btn-accent mt-auto px-4 py-2.5 text-xs font-bold transition-all w-fit shadow-xs group-hover:shadow-md flex items-center gap-1.5 rounded-xl"
          >
            <Download className="h-3.5 w-3.5 group-hover:translate-y-0.5 transition-transform" />
            <span>Registrarme e instalar</span>
          </Link>
        </div>

        {/* Preguntas frecuentes */}
        <div className="fluent-card group p-6 flex flex-col gap-3.5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 cursor-default border-t-4 border-t-slate-400 dark:border-t-slate-600">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:scale-110 transition-transform duration-300 shadow-xs">
            <HelpCircle className="h-5 w-5" />
          </span>
          <div>
            <span className="fluent-badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 mb-1 text-[10px] font-bold uppercase tracking-wider">
              Soporte y dudas
            </span>
            <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight mt-1">
              ¿Tienes dudas?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
              ¿Necesito internet? ¿Funciona fuera de Maturín? ¿Qué pasa si no puedo hablar?
            </p>
          </div>
          <Link
            href="/ayuda"
            className="fluent-btn fluent-btn-subtle mt-auto px-4 py-2.5 text-xs font-bold transition-all w-fit border border-slate-300 dark:border-slate-700 hover:border-slate-400 group-hover:shadow-sm flex items-center gap-1.5 rounded-xl"
          >
            <span>Ver preguntas frecuentes</span>
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ── PIE INSTITUCIONAL FLUENT CARD ── */}
      <div className="fluent-card px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)] text-xs font-black text-white shadow-xs">
            911
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 dark:text-white">
              Centro de Comando VEN 911 &middot; Maturín, Estado Monagas
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              CONAPDIS &middot; Art. 81 CRBV &middot; CDPD ONU &middot; WCAG 2.1 AA &middot; Ley de Infogobierno
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="fluent-badge bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px]">
            <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
            WCAG 2.1 AA
          </span>
          {!isAuth && (
            <Link
              href="/login?redirect=/admin"
              aria-label="Acceso a red operativa VEN 911"
              className="fluent-btn fluent-btn-subtle px-3 py-1.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 transition rounded-lg"
            >
              Acceso a red operativa VEN 911
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
