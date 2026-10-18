"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Shield,
  Ambulance,
  Flame,
  LifeBuoy,
  Plus,
  Pencil,
  Trash2,
  X,
  Phone,
  Radio,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Building2,
  Clock,
  Layers,
  Table,
  LayoutGrid,
  Search,
  Loader2,
} from "lucide-react";
import type { OrganismoUnidad } from "@/src/modules/admin/organism-types";

export default function AdminOrganismosPage() {
  const [unidades, setUnidades] = useState<OrganismoUnidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [notice, setNotice] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"tabla" | "cards">("tabla");

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState<OrganismoUnidad | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulario
  const [formData, setFormData] = useState({
    organismo: "Red de Ambulancias — Salud Monagas / MPPS",
    organismoSiglas: "Salud Monagas",
    tipo: "ambulancia" as OrganismoUnidad["tipo"],
    nombreUnidad: "",
    placa: "",
    baseOperaciones: "",
    telefonoDespacho: "+58 291-",
    frecuenciaVhf: "155.000 MHz",
    etaBaseMin: 5,
    estado: "disponible" as OrganismoUnidad["estado"],
  });

  const showSaved = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchUnidades = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/v1/admin/organismos");
      if (res.ok) {
        const data = await res.json();
        setUnidades(data.unidades || []);
      }
    } catch (err) {
      console.error("Error al cargar organismos:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUnidades();
  }, [fetchUnidades]);

  const openCreateModal = () => {
    setEditingUnidad(null);
    setFormData({
      organismo: "Red de Ambulancias — Salud Monagas / MPPS",
      organismoSiglas: "Salud Monagas",
      tipo: "ambulancia",
      nombreUnidad: "",
      placa: "",
      baseOperaciones: "Hospital Central · Maturín",
      telefonoDespacho: "+58 291-",
      frecuenciaVhf: "155.000 MHz",
      etaBaseMin: 5,
      estado: "disponible",
    });
    setShowModal(true);
  };

  const openEditModal = (u: OrganismoUnidad) => {
    setEditingUnidad(u);
    setFormData({
      organismo: u.organismo,
      organismoSiglas: u.organismoSiglas,
      tipo: u.tipo,
      nombreUnidad: u.nombreUnidad,
      placa: u.placa,
      baseOperaciones: u.baseOperaciones,
      telefonoDespacho: u.telefonoDespacho,
      frecuenciaVhf: u.frecuenciaVhf,
      etaBaseMin: u.etaBaseMin,
      estado: u.estado,
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombreUnidad.trim()) return;

    setSubmitting(true);
    try {
      if (editingUnidad) {
        const res = await fetch("/v1/admin/organismos", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingUnidad.id,
            ...formData,
          }),
        });

        if (res.ok) {
          showSaved(`Unidad ${formData.nombreUnidad} actualizada en backend.`);
          await fetchUnidades();
          setShowModal(false);
        } else {
          alert("Error al actualizar unidad en el backend.");
        }
      } else {
        const res = await fetch("/v1/admin/organismos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          showSaved(`Unidad ${formData.nombreUnidad} registrada en el backend.`);
          await fetchUnidades();
          setShowModal(false);
        } else {
          alert("Error al crear unidad en el backend.");
        }
      }
    } catch {
      alert("Error de conexión al guardar.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/v1/admin/organismos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConfirmDeleteId(null);
        showSaved(`Unidad ${id} eliminada por el Administrador.`);
        await fetchUnidades();
      } else {
        alert("Error al eliminar del backend.");
      }
    } catch {
      alert("Error de conexión al eliminar.");
    }
  };

  const filteredUnidades = useMemo(() => {
    return unidades.filter((u) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        u.nombreUnidad.toLowerCase().includes(q) ||
        u.organismo.toLowerCase().includes(q) ||
        u.placa.toLowerCase().includes(q) ||
        u.baseOperaciones.toLowerCase().includes(q);

      const matchesTipo = tipoFilter === "Todos" || u.tipo === tipoFilter;
      return matchesQuery && matchesTipo;
    });
  }, [unidades, searchQuery, tipoFilter]);

  return (
    <div className="flex-1 w-full p-6 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Encabezado */}
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/admin"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold">
                Articulación de Socorro · VEN 911 Monagas
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Building2 className="h-6 w-6 text-emerald-600" />
              Directorio de Organismos y Flotas Externas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Administración de números de despacho, frecuencias VHF y unidades tácticas asignadas a Cuadrantes de Paz.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Selector de Modo de Vista para Optimización de Espacios */}
            <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700" role="group" aria-label="Modo de visualización">
              <button
                type="button"
                onClick={() => setViewMode("tabla")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "tabla"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Vista compacta de tabla (Alta densidad)"
              >
                <Table className="h-3.5 w-3.5" />
                <span>Tabla</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === "cards"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="Vista en tarjetas (Cards)"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Tarjetas</span>
              </button>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Registrar Unidad
            </button>
          </div>
        </header>

        {notice && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {notice}
          </div>
        )}

        {/* Doctrina VEN 911 */}
        <section className="rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 p-4 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <Shield className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-950 dark:text-amber-100">
                Doctrina Operativa VEN 911 — Articulación Institucional:
              </h3>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                El Centro VEN 911 Monagas actúa como <strong>plataforma de enlace y comando</strong>. Ninguna de estas unidades pertenece al parque automotor interno del 911. Todas corresponden a las instituciones competentes de auxilio (MPPS, Bomberos, PNB, PCAD) con las cuales se coordina el despacho inmediato.
              </p>
            </div>
          </div>
        </section>

        {/* Filtros de Búsqueda */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar unidad, organismo, placa o base..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-900 dark:text-white"
          >
            <option value="Todos">Todos los Tipos de Auxilio</option>
            <option value="ambulancia">Ambulancias (Salud Monagas)</option>
            <option value="bomberos">Cuerpo de Bomberos</option>
            <option value="policia">Policía Nacional Bolivariana (PNB)</option>
            <option value="proteccion_civil">Protección Civil (PCAD)</option>
          </select>
        </section>

        {/* Contenido según Modo de Vista */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <p className="text-xs">Cargando unidades tácticas del clúster...</p>
          </div>
        ) : filteredUnidades.length === 0 ? (
          <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-sm">No se encontraron unidades registradas con los criterios dados.</p>
          </div>
        ) : viewMode === "tabla" ? (
          /* ─── VISTA TABLA COMPACTA (ALTA DENSIDAD — OPTIMIZACIÓN DE ESPACIO) ─── */
          <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Table className="h-4 w-4 text-emerald-600" />
                Flota y Entes Registrados ({filteredUnidades.length}) — Modo Alta Densidad
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50">
                    <th className="py-2.5 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Código</th>
                    <th className="py-2.5 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unidad Táctica</th>
                    <th className="py-2.5 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">Organismo</th>
                    <th className="py-2.5 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Base Operativa</th>
                    <th className="py-2.5 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Placa / VHF</th>
                    <th className="py-2.5 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Despacho</th>
                    <th className="py-2.5 px-3 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">ETA</th>
                    <th className="py-2.5 px-3 text-center font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24">Estado</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {filteredUnidades.map((u) => {
                    const Icon =
                      u.tipo === "ambulancia"
                        ? Ambulance
                        : u.tipo === "bomberos"
                        ? Flame
                        : u.tipo === "policia"
                        ? Shield
                        : LifeBuoy;

                    return (
                      <tr
                        key={u.id}
                        className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px] leading-none">
                            {u.id}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">{u.nombreUnidad}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{u.organismoSiglas}</span>
                        </td>
                        <td className="py-2.5 px-3 hidden md:table-cell">
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[200px] block">{u.baseOperaciones}</span>
                        </td>
                        <td className="py-2.5 px-3 hidden lg:table-cell font-mono text-[11px] text-slate-500">
                          {u.placa} · {u.frecuenciaVhf}
                        </td>
                        <td className="py-2.5 px-3 hidden sm:table-cell font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3 w-3 text-emerald-500 shrink-0" />
                            {u.telefonoDespacho}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-xs">
                            {u.etaBaseMin}m
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                              u.estado === "disponible"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : u.estado === "en_guardia"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            }`}
                          >
                            {u.estado === "disponible"
                              ? "Disponible"
                              : u.estado === "en_guardia"
                              ? "En Guardia"
                              : "Mantenimiento"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(u)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                              title="Editar Unidad"
                              aria-label={`Editar ${u.nombreUnidad}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(u.id)}
                              className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 transition"
                              title="Eliminar Unidad"
                              aria-label={`Eliminar ${u.nombreUnidad}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          /* ─── VISTA TARJETAS (CARDS) ─── */
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnidades.map((u) => {
              const Icon =
                u.tipo === "ambulancia"
                  ? Ambulance
                  : u.tipo === "bomberos"
                  ? Flame
                  : u.tipo === "policia"
                  ? Shield
                  : LifeBuoy;

              const iconColor =
                u.tipo === "ambulancia"
                  ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60"
                  : u.tipo === "bomberos"
                  ? "text-red-600 bg-red-50 dark:bg-red-950/60"
                  : u.tipo === "policia"
                  ? "text-blue-600 bg-blue-50 dark:bg-blue-950/60"
                  : "text-orange-600 bg-orange-50 dark:bg-orange-950/60";

              return (
                <div
                  key={u.id}
                  className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-xl ${iconColor}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            {u.organismoSiglas}
                          </span>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                            {u.nombreUnidad}
                          </h3>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          u.estado === "disponible"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : u.estado === "en_guardia"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {u.estado === "disponible"
                          ? "Disponible"
                          : u.estado === "en_guardia"
                          ? "En Guardia"
                          : "Mantenimiento"}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                      <p>
                        <strong>Base:</strong> {u.baseOperaciones}
                      </p>
                      <p className="font-mono text-[11px] text-slate-500">
                        Placa: {u.placa} · VHF: {u.frecuenciaVhf}
                      </p>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" /> {u.telefonoDespacho}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                        <Clock className="h-3.5 w-3.5" /> ETA: {u.etaBaseMin} min
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => openEditModal(u)}
                      className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 transition"
                      title="Editar Unidad"
                      aria-label={`Editar ${u.nombreUnidad}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(u.id)}
                      className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-700 dark:text-red-300 transition"
                      title="Eliminar Unidad"
                      aria-label={`Eliminar ${u.nombreUnidad}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* ─── MODAL CREAR / EDITAR UNIDAD ────────────────────────────────────── */}
      {showModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-org-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 id="modal-org-title" className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-600" />
                {editingUnidad ? "Editar Unidad Táctica" : "Registrar Unidad de Auxilio"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organismo Responsable:
                </label>
                <select
                  value={formData.organismo}
                  onChange={(e) => {
                    const org = e.target.value;
                    const siglas = org.includes("Salud")
                      ? "Salud Monagas"
                      : org.includes("Bomberos")
                      ? "Bomberos Monagas"
                      : org.includes("Policía")
                      ? "PNB"
                      : "PCAD";
                    const tipo = org.includes("Salud")
                      ? "ambulancia"
                      : org.includes("Bomberos")
                      ? "bomberos"
                      : org.includes("Policía")
                      ? "policia"
                      : "proteccion_civil";
                    setFormData({ ...formData, organismo: org, organismoSiglas: siglas, tipo });
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Red de Ambulancias — Salud Monagas / MPPS">
                    Red de Ambulancias — Salud Monagas / MPPS
                  </option>
                  <option value="Cuerpo de Bomberos del Estado Monagas">
                    Cuerpo de Bomberos del Estado Monagas
                  </option>
                  <option value="Policía Nacional Bolivariana (PNB)">
                    Policía Nacional Bolivariana (PNB)
                  </option>
                  <option value="Protección Civil y Administración de Desastres">
                    Protección Civil y Administración de Desastres (PCAD)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre e Identificador de la Unidad:
                </label>
                <input
                  type="text"
                  value={formData.nombreUnidad}
                  onChange={(e) => setFormData({ ...formData, nombreUnidad: e.target.value })}
                  placeholder="ej. Ambulancia SAV #05 (Soporte Vital Avanzado)"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Placa Identificadora:
                  </label>
                  <input
                    type="text"
                    value={formData.placa}
                    onChange={(e) => setFormData({ ...formData, placa: e.target.value })}
                    placeholder="ej. AMB-05-MN"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Frecuencia Radial VHF:
                  </label>
                  <input
                    type="text"
                    value={formData.frecuenciaVhf}
                    onChange={(e) => setFormData({ ...formData, frecuenciaVhf: e.target.value })}
                    placeholder="ej. 155.200 MHz"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base de Operaciones / Puesto de Comando:
                </label>
                <input
                  type="text"
                  value={formData.baseOperaciones}
                  onChange={(e) => setFormData({ ...formData, baseOperaciones: e.target.value })}
                  placeholder="ej. Hospital Universitario Dr. Manuel Núñez Tovar (HUMNT)"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono Despacho VHF/Directo:
                  </label>
                  <input
                    type="tel"
                    value={formData.telefonoDespacho}
                    onChange={(e) => setFormData({ ...formData, telefonoDespacho: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tiempo Estimado de Salida (ETA min):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.etaBaseMin}
                    onChange={(e) => setFormData({ ...formData, etaBaseMin: parseInt(e.target.value) || 5 })}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado Operativo Inicial:
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as OrganismoUnidad["estado"] })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="disponible">Disponible (En Base Lista)</option>
                  <option value="en_guardia">En Guardia / Patrullaje</option>
                  <option value="mantenimiento">Mantenimiento Preventivo</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingUnidad ? "Actualizar Unidad" : "Dar de Alta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL CONFIRMAR ELIMINACIÓN ────────────────────────────────────── */}
      {confirmDeleteId && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-del-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <h3 id="modal-del-title" className="font-bold text-base text-slate-900 dark:text-white">
                ¿Eliminar Unidad Táctica?
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Esta acción desincorporará permanentemente la unidad del catálogo operativo.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white"
              >
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
