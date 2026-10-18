"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Tag,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  ArrowLeft,
  X,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";

interface TipificacionItem {
  id: string;
  codigo: string;
  nombre: string;
  categoria_raiz: "salud" | "bomberos" | "policia" | "transito" | "rescate" | "otro";
  prioridad_defecto: "P0" | "P1" | "P2" | "P3";
  organismo_primario: string;
  sla_minutos: number;
  activo: boolean;
}

export default function AdminTipificacionesPage() {
  const [items, setItems] = useState<TipificacionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string>("todos");
  const [filterPrio, setFilterPrio] = useState<string>("todas");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TipificacionItem | null>(null);
  const [modalCodigo, setModalCodigo] = useState("");
  const [modalNombre, setModalNombre] = useState("");
  const [modalCat, setModalCat] = useState<TipificacionItem["categoria_raiz"]>("salud");
  const [modalPrio, setModalPrio] = useState<TipificacionItem["prioridad_defecto"]>("P1");
  const [modalOrganismo, setModalOrganismo] = useState("Salud Monagas - MPPS / HUMNT");
  const [modalSla, setModalSla] = useState(10);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/v1/catalogos/tipificaciones");
      if (res.ok) {
        const data = await res.json();
        setItems(data.tipificaciones || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchItems();
  }, []);

  const openCreateModal = () => {
    triggerHapticFeedback("tap");
    setEditingItem(null);
    setModalCodigo("");
    setModalNombre("");
    setModalCat("salud");
    setModalPrio("P1");
    setModalOrganismo("Salud Monagas - MPPS / HUMNT");
    setModalSla(10);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TipificacionItem) => {
    triggerHapticFeedback("tap");
    setEditingItem(item);
    setModalCodigo(item.codigo);
    setModalNombre(item.nombre);
    setModalCat(item.categoria_raiz);
    setModalPrio(item.prioridad_defecto);
    setModalOrganismo(item.organismo_primario);
    setModalSla(item.sla_minutos);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCodigo.trim() || !modalNombre.trim()) return;

    triggerHapticFeedback("tap");
    const payload = {
      id: editingItem ? editingItem.id : undefined,
      codigo: modalCodigo.trim().toLowerCase(),
      nombre: modalNombre.trim(),
      categoria_raiz: modalCat,
      prioridad_defecto: modalPrio,
      organismo_primario: modalOrganismo.trim(),
      sla_minutos: Number(modalSla),
      activo: true,
    };

    try {
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch("/v1/catalogos/tipificaciones", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFeedbackMsg({ text: editingItem ? "Tipificación actualizada exitosamente." : "Tipificación registrada en el catálogo oficial." });
        setIsModalOpen(false);
        void fetchItems();
      } else {
        const err = await res.json();
        setFeedbackMsg({ text: err.message || "Error al procesar", error: true });
      }
    } catch {
      setFeedbackMsg({ text: "Error de red con el servidor", error: true });
    }
  };

  const handleDelete = async (id: string, codigo: string) => {
    if (!window.confirm(`¿Confirmas la desincorporación de la tipificación "${codigo}"? Solo el Administrador puede ejecutar esta acción.`)) {
      return;
    }

    triggerHapticFeedback("warning");
    try {
      const res = await fetch(`/v1/catalogos/tipificaciones?id=${id}&role=admin`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFeedbackMsg({ text: `Tipificación ${codigo} eliminada.` });
        void fetchItems();
      } else {
        const err = await res.json();
        setFeedbackMsg({ text: err.message || "Acción denegada (403 Forbidden)", error: true });
      }
    } catch {
      setFeedbackMsg({ text: "Fallo de conexión al eliminar", error: true });
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.codigo.toLowerCase().includes(search.toLowerCase()) ||
      item.nombre.toLowerCase().includes(search.toLowerCase()) ||
      item.organismo_primario.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === "todos" || item.categoria_raiz === filterCat;
    const matchesPrio = filterPrio === "todas" || item.prioridad_defecto === filterPrio;
    return matchesSearch && matchesCat && matchesPrio;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera y Navegación */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
              <Link href="/dashboard" className="hover:text-sky-600 transition flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
              </Link>
              <span>/</span>
              <span className="text-sky-600">Catálogos & Tipificaciones</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Gestión de Tipificaciones y SLAs VEN 911
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Administración centralizada de códigos de emergencia, prioridad de triaje y tiempos máximos de respuesta institucional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchItems}
              disabled={loading}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Recargar catálogo"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tipificación</span>
            </button>
          </div>
        </div>

        {/* Notificación de feedback */}
        {feedbackMsg && (
          <div
            className={`p-3 rounded-2xl flex items-center justify-between text-xs font-bold ${
              feedbackMsg.error
                ? "bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                : "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
            }`}
          >
            <span>{feedbackMsg.text}</span>
            <button type="button" onClick={() => setFeedbackMsg(null)} className="ml-2 hover:opacity-75">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filtros y Búsqueda */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por código, nombre u organismo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          <div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm"
            >
              <option value="todos">Todas las Categorías</option>
              <option value="salud">Salud / Médicas</option>
              <option value="bomberos">Bomberos / Incendios</option>
              <option value="policia">Seguridad / Policía</option>
              <option value="transito">Tránsito / Vial</option>
              <option value="rescate">Protección Civil / Rescate</option>
            </select>
          </div>

          <div>
            <select
              value={filterPrio}
              onChange={(e) => setFilterPrio(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm"
            >
              <option value="todas">Todas las Prioridades</option>
              <option value="P0">P0 — Riesgo Vital Extremo (&lt; 8 min)</option>
              <option value="P1">P1 — Alta Urgencia (&lt; 15 min)</option>
              <option value="P2">P2 — Urgencia Moderada (&lt; 30 min)</option>
              <option value="P3">P3 — Asistencia No Urgente</option>
            </select>
          </div>
        </div>

        {/* Tabla de Tipificaciones */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800/80 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Código Técnico</th>
                  <th className="py-3.5 px-4">Denominación Oficial</th>
                  <th className="py-3.5 px-4">Categoría Raíz</th>
                  <th className="py-3.5 px-4">Prioridad / SLA</th>
                  <th className="py-3.5 px-4">Organismo Primario de Enlace</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                      {item.codigo}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {item.nombre}
                    </td>
                    <td className="py-3.5 px-4 capitalize">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.categoria_raiz}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-black inline-flex items-center gap-1 ${
                          item.prioridad_defecto === "P0"
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400"
                            : item.prioridad_defecto === "P1"
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-400"
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {item.prioridad_defecto} ({item.sla_minutos} min)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {item.organismo_primario}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 transition cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id, item.codigo)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 transition cursor-pointer"
                          title="Eliminar (Solo Admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Alta / Edición */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-sky-600" />
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {editingItem ? "Editar Tipificación" : "Nueva Tipificación VEN 911"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Código Técnico (ej: salud.convulsion, fuego.forestal) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="categoria.subtipo"
                    value={modalCodigo}
                    onChange={(e) => setModalCodigo(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                    Denominación Oficial en Español *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Convulsión Activa / Estado Epiléptico"
                    value={modalNombre}
                    onChange={(e) => setModalNombre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Categoría Raíz
                    </label>
                    <select
                      value={modalCat}
                      onChange={(e) => setModalCat(e.target.value as TipificacionItem["categoria_raiz"])}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    >
                      <option value="salud">Salud</option>
                      <option value="bomberos">Bomberos</option>
                      <option value="policia">Policía</option>
                      <option value="transito">Tránsito</option>
                      <option value="rescate">Rescate / PCAD</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Prioridad Defecto
                    </label>
                    <select
                      value={modalPrio}
                      onChange={(e) => setModalPrio(e.target.value as TipificacionItem["prioridad_defecto"])}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    >
                      <option value="P0">P0 (Riesgo Vital)</option>
                      <option value="P1">P1 (Alta Urgencia)</option>
                      <option value="P2">P2 (Moderada)</option>
                      <option value="P3">P3 (No Urgente)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      SLA Respuesta (minutos)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={modalSla}
                      onChange={(e) => setModalSla(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                      Organismo Primario
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Salud Monagas / HUMNT"
                      value={modalOrganismo}
                      onChange={(e) => setModalOrganismo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm shadow-md cursor-pointer"
                  >
                    {editingItem ? "Actualizar" : "Guardar Tipificación"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
