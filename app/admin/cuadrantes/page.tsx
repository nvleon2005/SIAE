"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/modules/auth/auth-store";
import {
  MapPin,
  Shield,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Navigation,
  Car,
  Layers,
  Loader2,
  Radio,
} from "lucide-react";
import type { CuadranteDePaz, OrganismoSeguridad } from "@/src/modules/territory/cuadrantes-paz";

const ORGANISMOS_DISPONIBLES: OrganismoSeguridad[] = [
  "Policía Nacional Bolivariana (PNB)",
  "PoliMonagas (Policía del Estado Monagas)",
  "Guardia Nacional Bolivariana (GNB)",
  "Cuerpo de Bomberos del Estado Monagas",
  "Protección Civil y Administración de Desastres (PC)",
];

const PARROQUIAS_MATURIN = [
  "San Simón",
  "Boquerón",
  "Las Cocuizas",
  "Alto de Los Godos",
  "Santa Cruz",
  "La Pica",
  "San Vicente",
  "Jusepín",
  "El Furrial",
  "El Corozo",
];

export default function AdminCuadrantesPage() {
  const router = useRouter();
  const user = useAuth((state) => state.user);
  const isAuthenticated = useAuth((state) => state.isAuthenticated);

  const [cuadrantes, setCuadrantes] = useState<CuadranteDePaz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParroquia, setSelectedParroquia] = useState("Todas");
  const [selectedOrganismo, setSelectedOrganismo] = useState("Todos");

  // Modales
  const [showModal, setShowModal] = useState(false);
  const [editingCuadrante, setEditingCuadrante] = useState<CuadranteDePaz | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Campos de formulario
  const [formData, setFormData] = useState({
    numero: "",
    nombre: "",
    parroquia: "San Simón",
    sectorPrincipal: "",
    sectoresAbarcados: "",
    organismoResponsable: "Policía Nacional Bolivariana (PNB)" as OrganismoSeguridad,
    telefonoPatrulla: "",
    lat: "",
    lng: "",
    descripcionRuta: "",
  });

  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 4000);
  };

  const fetchCuadrantes = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/v1/geo/cuadrantes");
      const data = await res.json().catch(() => null) as { cuadrantes?: unknown } | null;
      if (!res.ok) throw new Error(`No se pudieron cargar los cuadrantes (${res.status}).`);
      if (!Array.isArray(data?.cuadrantes)) throw new Error("El servidor devolvió un catálogo inválido.");
      const seen = new Set<string>();
      const uniqueList: CuadranteDePaz[] = data.cuadrantes.filter((c: CuadranteDePaz) => {
        if (!c?.id || seen.has(c.id)) return false;
        seen.add(c.id);
        return true;
      });
      setCuadrantes(uniqueList);
    } catch (error) {
      setCuadrantes([]);
      setLoadError(error instanceof Error ? error.message : "No se pudieron cargar los cuadrantes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCuadrantes();
  }, [fetchCuadrantes]);

  const openCreateModal = () => {
    setEditingCuadrante(null);
    const maxNum = cuadrantes.reduce((max, c) => Math.max(max, c.numero || 0), 0);
    const nextNum = maxNum + 1;
    setFormData({
      numero: String(nextNum),
      nombre: `Cuadrante de Paz N° ${nextNum} · `,
      parroquia: "San Simón",
      sectorPrincipal: "",
      sectoresAbarcados: "",
      organismoResponsable: "Policía Nacional Bolivariana (PNB)",
      telefonoPatrulla: "",
      lat: "",
      lng: "",
      descripcionRuta: "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const openEditModal = (c: CuadranteDePaz) => {
    setEditingCuadrante(c);
    setFormData({
      numero: String(c.numero),
      nombre: c.nombre,
      parroquia: c.parroquia,
      sectorPrincipal: c.sectorPrincipal,
      sectoresAbarcados: c.sectoresAbarcados.join(", "),
      organismoResponsable: c.organismoResponsable,
      telefonoPatrulla: c.telefonoPatrulla,
      lat: c.coordsReferencia ? String(c.coordsReferencia.lat) : "",
      lng: c.coordsReferencia ? String(c.coordsReferencia.lng) : "",
      descripcionRuta: c.descripcionRuta || "",
    });
    setFormError(null);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.sectorPrincipal.trim()) {
      setFormError("El nombre y el sector principal son requeridos.");
      return;
    }
    const latitude = Number(formData.lat);
    const longitude = Number(formData.lng);
    const number = Number(formData.numero);
    if (!Number.isFinite(number) || number <= 0) {
      setFormError("Ingresa un número de cuadrante válido.");
      return;
    }
    if (!formData.lat.trim() || !formData.lng.trim() ||
        !Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      setFormError("Ingresa coordenadas válidas para el cuadrante.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      id: editingCuadrante ? editingCuadrante.id : `CP-${String(formData.numero).padStart(2, "0")}`,
      numero: number,
      nombre: formData.nombre.trim(),
      parroquia: formData.parroquia,
      sectorPrincipal: formData.sectorPrincipal.trim(),
      sectoresAbarcados: formData.sectoresAbarcados
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      organismoResponsable: formData.organismoResponsable,
      organismoSiglas: formData.organismoResponsable.includes("PNB")
        ? "PNB"
        : formData.organismoResponsable.includes("PoliMonagas")
        ? "PoliMonagas"
        : formData.organismoResponsable.includes("Bomberos")
        ? "Bomberos"
        : formData.organismoResponsable.includes("PC")
        ? "PCAD"
        : "GNB",
      telefonoPatrulla: formData.telefonoPatrulla.trim(),
      coordsReferencia: {
        lat: latitude,
        lng: longitude,
      },
      descripcionRuta: formData.descripcionRuta.trim(),
    };

    try {
      const res = await fetch("/v1/geo/cuadrantes", {
        method: editingCuadrante ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        showNotice(
          editingCuadrante
            ? `Cuadrante ${payload.id} actualizado correctamente.`
            : `Cuadrante ${payload.id} registrado exitosamente.`
        );
        fetchCuadrantes();
      } else {
        const data = await res.json().catch(() => ({}));
        setFormError(data.error || "Ocurrió un error al guardar.");
      }
    } catch {
      setFormError("Error de comunicación con el servidor.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/v1/geo/cuadrantes?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setConfirmDeleteId(null);
        showNotice(`Cuadrante ${id} eliminado por el Administrador.`);
        fetchCuadrantes();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Error al eliminar cuadrante.");
      }
    } catch {
      alert("Error de comunicación al intentar eliminar.");
    }
  };

  const filteredCuadrantes = useMemo(() => {
    return cuadrantes.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        c.nombre.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.sectorPrincipal.toLowerCase().includes(q) ||
        c.sectoresAbarcados.some((s) => s.toLowerCase().includes(q));

      const matchesParroquia = selectedParroquia === "Todas" || c.parroquia === selectedParroquia;
      const matchesOrganismo = selectedOrganismo === "Todos" || c.organismoResponsable === selectedOrganismo;

      return matchesSearch && matchesParroquia && matchesOrganismo;
    });
  }, [cuadrantes, searchQuery, selectedParroquia, selectedOrganismo]);

  return (
    <div className="flex-1 w-full p-6 overflow-y-auto bg-[var(--background)] text-[var(--foreground)] transition-colors">
      <div className="mx-auto max-w-7xl space-y-6">
        {loadError && (
          <p className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300" role="alert">
            {loadError}
          </p>
        )}
        {/* Encabezado */}
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition"
                title="Volver al Dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-xs uppercase tracking-widest text-[var(--accent)] font-bold">
                Administración Territorial · VEN 911 Monagas
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="h-6 w-6 text-red-600" />
              Gestión de Cuadrantes de Paz (Maturín)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Administración exclusiva de polígonos, organismos de auxilio asignados y números de patrulla.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Registrar Cuadrante
            </button>
            <Link
              href="/admin/usuarios"
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Gestión Personal
            </Link>
          </div>
        </header>

        {notice && (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-500/10 p-3.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            {notice}
          </div>
        )}

        {/* Filtros de Búsqueda */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cuadrante, sector o calle..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-red-500 text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedParroquia}
            onChange={(e) => setSelectedParroquia(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-900 dark:text-white"
          >
            <option value="Todas">Todas las Parroquias</option>
            {PARROQUIAS_MATURIN.map((p) => (
              <option key={p} value={p}>
                Parroquia {p}
              </option>
            ))}
          </select>

          <select
            value={selectedOrganismo}
            onChange={(e) => setSelectedOrganismo(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none text-slate-900 dark:text-white"
          >
            <option value="Todos">Todos los Organismos</option>
            {ORGANISMOS_DISPONIBLES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </section>

        {/* Listado de Cuadrantes */}
        <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-red-600" />
              Cuadrantes Registrados ({filteredCuadrantes.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-red-600" />
              <p className="text-xs">Cargando catálogo territorial...</p>
            </div>
          ) : filteredCuadrantes.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm">No se encontraron cuadrantes con los filtros seleccionados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">ID</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-24 hidden sm:table-cell">Parroquia</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden md:table-cell">Organismo</th>
                    <th className="py-2 px-3 text-left font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-36 hidden lg:table-cell">Patrulla</th>
                    <th className="py-2 px-3 text-right font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-20">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {filteredCuadrantes.map((c, idx) => (
                    <tr
                      key={`${c.id}-${c.numero ?? idx}`}
                      className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-600 text-white font-mono font-bold text-[10px] leading-none">
                          {c.id}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-100 leading-snug">{c.nombre}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">
                          {c.sectorPrincipal}
                        </p>
                      </td>
                      <td className="py-2.5 px-3 hidden sm:table-cell">
                        <span className="text-slate-600 dark:text-slate-300">{c.parroquia}</span>
                      </td>
                      <td className="py-2.5 px-3 hidden md:table-cell">
                        <span className="text-blue-600 dark:text-blue-400 font-medium leading-snug">
                          {c.organismoResponsable.replace(" (PNB)", "").replace(" del Estado Monagas", "")}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 hidden lg:table-cell">
                        <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Phone className="h-3 w-3 text-emerald-500 shrink-0" />
                          {c.telefonoPatrulla}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition opacity-0 group-hover:opacity-100"
                            title="Editar Cuadrante"
                            aria-label={`Editar ${c.id}`}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(c.id)}
                            className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 hover:bg-red-200 text-red-600 dark:text-red-400 transition opacity-0 group-hover:opacity-100"
                            title="Eliminar Cuadrante"
                            aria-label={`Eliminar ${c.id}`}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ─── MODAL CREAR / EDITAR CUADRANTE ──────────────────────────────────── */}
      {showModal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-cuadrante-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 id="modal-cuadrante-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-red-600" />
                {editingCuadrante ? `Editar Cuadrante ${editingCuadrante.id}` : "Registrar Nuevo Cuadrante de Paz"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 font-semibold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Número Oficial:
                  </label>
                  <input
                    type="number"
                    value={formData.numero}
                    onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Parroquia:
                  </label>
                  <select
                    value={formData.parroquia}
                    onChange={(e) => setFormData({ ...formData, parroquia: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {PARROQUIAS_MATURIN.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Cuadrante:
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="ej. Cuadrante de Paz N° 21 · Boquerón Centro"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sector Principal:
                  </label>
                  <input
                    type="text"
                    value={formData.sectorPrincipal}
                    onChange={(e) => setFormData({ ...formData, sectorPrincipal: e.target.value })}
                    placeholder="ej. Boquerón"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de Patrulla:
                  </label>
                  <input
                    type="text"
                    value={formData.telefonoPatrulla}
                    onChange={(e) => setFormData({ ...formData, telefonoPatrulla: e.target.value })}
                    placeholder="+58 416-6912321"
                    required
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sectores Abarcados (separados por coma):
                </label>
                <input
                  type="text"
                  value={formData.sectoresAbarcados}
                  onChange={(e) => setFormData({ ...formData, sectoresAbarcados: e.target.value })}
                  placeholder="ej. Calle 1, Res. Los Olivos, Av. Principal"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Organismo de Seguridad Responsable:
                </label>
                <select
                  value={formData.organismoResponsable}
                  onChange={(e) =>
                    setFormData({ ...formData, organismoResponsable: e.target.value as OrganismoSeguridad })
                  }
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {ORGANISMOS_DISPONIBLES.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Latitud Referencia:
                  </label>
                  <input
                    type="text"
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Longitud Referencia:
                  </label>
                  <input
                    type="text"
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ruta de Patrullaje / Observaciones:
                </label>
                <textarea
                  value={formData.descripcionRuta}
                  onChange={(e) => setFormData({ ...formData, descripcionRuta: e.target.value })}
                  rows={2}
                  placeholder="Descripción del patrullaje..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {editingCuadrante ? "Guardar Cambios" : "Crear Cuadrante"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL CONFIRMAR ELIMINACIÓN ─────────────────────────────────────── */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-red-200 dark:border-red-900/60 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-950 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ¿Eliminar Cuadrante de Paz {confirmDeleteId}?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Esta acción eliminará el registro territorial del sistema. Las llamadas históricas registradas bajo este cuadrante mantendrán su trazabilidad forense.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
