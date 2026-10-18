"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PictogramCell } from "@/src/components/siae/PictogramCell";
import {
  INCIDENT_CATEGORIES,
  INCIDENT_SUBTYPES,
  getCategoryByCode,
  type IncidentCategory,
} from "@/src/data/catalogs/incident-types";
import { useEmergency } from "@/src/modules/emergency/emergency-store";
import { useTypification } from "@/src/modules/typification/typification-store";
import { searchArasaacPictograms, type ArasaacPictogram } from "@/src/modules/typification/arasaac-client";
import { useRouter } from "next/navigation";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { SkeletonPictogramGrid } from "@/src/components/siae/Skeleton";
import { ThemeToggle } from "@/src/components/siae/ThemeToggle";
import { ArrowLeft, BookOpen } from "lucide-react";
import { EasyReadFlow } from "@/src/modules/typification/EasyReadFlow";

export default function TipifyPage() {
  const router = useRouter();
  const setFlowStatus = useEmergency((state) => state.setFlowStatus);
  const setEmergencyTipificacion = useEmergency((state) => state.setTipificacion);
  const afectado = useEmergency((state) => state.afectado);
  const descripcionAfectado = useEmergency((state) => state.descripcionAfectado);
  const setAfectado = useEmergency((state) => state.setAfectado);
  const setTextoIncidente = useEmergency((state) => state.setTextoIncidente);
  const {
    categoryCode,
    subtypeCode,
    freeText,
    pictogramsOnly,
    setCategory,
    setSubtype,
    setFreeText,
    setPictogramsOnly,
    reset,
  } = useTypification();

  const [isEasyReadMode, setIsEasyReadMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ArasaacPictogram[]>([]);
  const [dynamicCategories, setDynamicCategories] = useState<IncidentCategory[]>(INCIDENT_CATEGORIES);

  useEffect(() => {
    let isMounted = true;
    fetch("/v1/catalogos/all")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted || !data) return;
        if (Array.isArray(data.categorias) && data.categorias.length > 0) {
          const mapped: IncidentCategory[] = data.categorias.map((c: { codigo?: string; code?: string; nombre?: string; label?: string; pictograma_id?: number; pictogramId?: number }) => ({
            code: c.codigo || c.code || "other",
            label: c.nombre || c.label || "Emergencia",
            pictogramId: c.pictograma_id || c.pictogramId || 19524,
            iconKey: (c.codigo || c.code || "other") as IncidentCategory["iconKey"],
          }));
          setDynamicCategories(mapped);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const isSearching = Boolean(searchQuery.trim() && searchQuery.trim() !== debouncedQuery);

  useEffect(() => {
    setFlowStatus("typing");
  }, [setFlowStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let active = true;
    if (!debouncedQuery) return;
    void searchArasaacPictograms(debouncedQuery).then((results) => {
      if (active) setSearchResults(results);
    });
    return () => { active = false; };
  }, [debouncedQuery]);

  const displayedSearchResults = useMemo(() => {
    return debouncedQuery ? searchResults : [];
  }, [debouncedQuery, searchResults]);

  const selectedCategory = useMemo(
    () => (categoryCode ? getCategoryByCode(categoryCode) : null),
    [categoryCode],
  );

  const subtypeOptions = categoryCode ? INCIDENT_SUBTYPES[categoryCode] ?? [] : [];
  const categoryRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const subtypeRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleGridKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    itemCount: number,
    itemRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>,
  ) => {
    const columns = 3;
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = Math.min(index + 1, itemCount - 1);
    if (event.key === "ArrowLeft") nextIndex = Math.max(index - 1, 0);
    if (event.key === "ArrowDown") nextIndex = Math.min(index + columns, itemCount - 1);
    if (event.key === "ArrowUp") nextIndex = Math.max(index - columns, 0);
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = itemCount - 1;
    if (nextIndex === index) return;
    event.preventDefault();
    itemRefs.current[nextIndex]?.focus();
  };

  const handleCategorySelect = (code: string) => {
    triggerHapticFeedback("tap");
    setCategory(code);
    const category = getCategoryByCode(code);
    if (category) {
      setEmergencyTipificacion({ code: category.code, label: category.label, arasaacId: category.pictogramId });
    }
  };

  const handleSubtypeSelect = (code: string) => {
    triggerHapticFeedback("tap");
    setSubtype(code);
    const subtype = subtypeOptions.find((item) => item.code === code);
    if (subtype) {
      setEmergencyTipificacion({ code: subtype.code, label: subtype.label, arasaacId: subtype.pictogramId });
    }
  };

  const handleSkip = () => {
    triggerHapticFeedback("tap");
    reset();
    router.push("/ubicacion");
  };

  const handleContinue = () => {
    triggerHapticFeedback("tap");
    setTextoIncidente(freeText);
    router.push("/ubicacion");
  };

  return (
    /* Pantalla completa con estructura fija:
       - Header fijo arriba
       - Contenido scrollable en el medio
       - Botón de acción fijo al fondo */
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950" aria-live="polite">

      {/* ─── HEADER FIJO ─── */}
      <header className="shrink-0 flex items-center justify-between px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-20">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-white text-xs font-black">
            S
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden xs:inline">
            Paso 1 · Tipificación
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ThemeToggle showLabel={false} />
          <button
            type="button"
            className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            onClick={handleSkip}
          >
            Saltar
          </button>
        </div>
      </header>

      {/* ─── CONTENIDO SCROLLABLE ─── */}
      <main className="flex-1 overflow-y-auto pb-24">

        {/* Sub-header: Estado de navegación */}
        {selectedCategory ? (
          <div className="flex items-center gap-2 px-4 pt-3 pb-1">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              onClick={() => setCategory("")}
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Categorías</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">›</span>
          </div>
        ) : null}

        {/* Título contextual */}
        <div className="px-4 pt-3 pb-2">
          {!selectedCategory ? (
            <>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">¿Qué pasa?</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toca el tipo de emergencia o busca por palabra.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                ¿Qué tipo de problema {selectedCategory.label.toLowerCase()}?
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Selecciona la opción más específica.
              </p>
            </>
          )}
        </div>

        {/* Toggle Modo Lectura Fácil (RF-034) */}
        {!selectedCategory && (
          <div className="px-4 mb-3">
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback("tap");
                setIsEasyReadMode(!isEasyReadMode);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl border-2 transition cursor-pointer ${
                isEasyReadMode
                  ? "bg-amber-500 border-amber-600 text-slate-950 font-black shadow-md"
                  : "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50"
              }`}
              aria-pressed={isEasyReadMode}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-amber-700 dark:text-amber-300 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-black uppercase tracking-wider">Modo Lectura Fácil (SÍ / NO)</div>
                  <div className="text-[11px] opacity-80 font-medium">Preguntas guiadas sencillas con voz y botones gigantes</div>
                </div>
              </div>
              <span className="text-xs font-black px-2.5 py-1 bg-white/70 dark:bg-black/40 rounded-lg shrink-0">
                {isEasyReadMode ? "Activo" : "Activar"}
              </span>
            </button>
          </div>
        )}

        {/* ── Flujo de Lectura Fácil o Flujo Convencional de Pictogramas ── */}
        {isEasyReadMode && !selectedCategory ? (
          <div className="px-4 mb-6">
            <EasyReadFlow
              onSelect={(cat, sub, label, summary) => {
                setCategory(cat);
                setSubtype(sub);
                setEmergencyTipificacion({ code: sub, label });
                setTextoIncidente(summary);
                triggerHapticFeedback("warning");
                router.push("/ubicacion");
              }}
              onCancel={() => setIsEasyReadMode(false)}
            />
          </div>
        ) : (
          <>
            {/* ── Búsqueda (solo pantalla inicial sin categoría) ── */}
            {!selectedCategory && (
              <div className="px-4 mb-3">
                <div className="relative">
                  <input
                    id="arasaac-search"
                    type="search"
                    aria-label="Buscar pictograma de emergencia"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="🔍 Buscar (ej: dolor, fuego, accidente)..."
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-sky-500 dark:focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      aria-label="Limpiar búsqueda"
                    >
                      ✕
                    </button>
                  ) : null}
                </div>
              </div>
            )}

        {/* ── Resultados de búsqueda ── */}
        {!selectedCategory && searchQuery.trim() && (
          <div className="px-4 mb-4">
            {isSearching ? (
              <>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400" role="status">
                  Buscando pictogramas...
                </p>
                <SkeletonPictogramGrid count={3} />
              </>
            ) : (
              <>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400" role="status">
                  {displayedSearchResults.length} pictograma{displayedSearchResults.length !== 1 ? "s" : ""} encontrado{displayedSearchResults.length !== 1 ? "s" : ""}
                </p>
                {displayedSearchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {displayedSearchResults.map((pic) => (
                      <button
                        key={pic.id}
                        type="button"
                        onClick={() => {
                          const displayLabel = (pic as any).label || (pic as any).name || "";
                          triggerHapticFeedback("tap");
                          setEmergencyTipificacion({ code: `arasaac.${pic.id}`, label: displayLabel, arasaacId: pic.id });
                          setFreeText(displayLabel);
                          router.push("/ubicacion");
                        }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-sky-400 transition cursor-pointer"
                      >
                        <span className="text-2xl">🏷️</span>
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight line-clamp-2">
                          {(pic as any).label || (pic as any).name}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No se encontraron resultados.</p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Grid de categorías principales (3 columnas) ── */}
        {!selectedCategory && !searchQuery.trim() && (
          <div
            role="group"
            aria-label="Categorías de emergencia"
            className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 px-4 mb-4"
          >
            {dynamicCategories.map((category, index) => (
              <PictogramCell
                key={category.code}
                label={category.label}
                iconKey={category.iconKey}
                pictogramId={category.pictogramId}
                selected={categoryCode === category.code}
                pictogramsOnly={pictogramsOnly}
                buttonRef={(el) => { categoryRefs.current[index] = el; }}
                onKeyDown={(event) => handleGridKeyDown(event, index, dynamicCategories.length, categoryRefs)}
                onClick={() => handleCategorySelect(category.code)}
              />
            ))}
          </div>
        )}
          </>
        )}

        {/* ── Grid de subtipos ── */}
        {selectedCategory && (
          <>
            <div
              role="group"
              aria-label="Subtipos de emergencia"
              className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 px-4 mb-4"
            >
              {subtypeOptions.map((subtype, index) => (
                <PictogramCell
                  key={subtype.code}
                  label={subtype.label}
                  iconKey={subtype.iconKey}
                  pictogramId={subtype.pictogramId}
                  selected={subtypeCode === subtype.code}
                  pictogramsOnly={pictogramsOnly}
                  buttonRef={(el) => { subtypeRefs.current[index] = el; }}
                  onKeyDown={(event) => handleGridKeyDown(event, index, subtypeOptions.length, subtypeRefs)}
                  onClick={() => handleSubtypeSelect(subtype.code)}
                />
              ))}
            </div>

            {/* Selector de afectado */}
            <div className="mx-4 mb-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                ¿A quién le ocurre?
              </p>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Afectado">
                <button
                  type="button"
                  role="radio"
                  aria-checked={afectado === "yo_mismo"}
                  onClick={() => { triggerHapticFeedback("tap"); setAfectado("yo_mismo"); }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center gap-2 cursor-pointer active:scale-95 ${
                    afectado === "yo_mismo"
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-lg shrink-0">👤</span>
                  <div className="min-w-0">
                    <p className="font-bold whitespace-nowrap">A mí mismo</p>
                    <p className="text-xs text-slate-500 font-normal">Auxilio directo</p>
                  </div>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={afectado === "otra_persona"}
                  onClick={() => { triggerHapticFeedback("tap"); setAfectado("otra_persona"); }}
                  className={`p-2.5 rounded-xl border text-xs font-bold text-left transition flex items-center gap-2 cursor-pointer active:scale-95 ${
                    afectado === "otra_persona"
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/20"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="text-lg shrink-0">👥</span>
                  <div className="min-w-0">
                    <p className="font-bold whitespace-nowrap">A otra persona</p>
                    <p className="text-xs text-slate-500 font-normal">Testigo/familiar</p>
                  </div>
                </button>
              </div>

              {afectado === "otra_persona" && (
                <div className="mt-2.5">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1" htmlFor="afectado-descripcion">
                    Descripción breve (opcional)
                  </label>
                  <input
                    id="afectado-descripcion"
                    type="text"
                    value={descripcionAfectado}
                    onChange={(e) => setAfectado("otra_persona", e.target.value)}
                    placeholder="Ej: Adulto mayor con dolor de pecho"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition"
                  />
                </div>
              )}
            </div>

            {/* Notas adicionales */}
            <div className="mx-4 mb-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5" htmlFor="tipification-detail">
                Notas adicionales (opcional)
              </label>
              <textarea
                id="tipification-detail"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition resize-none"
                rows={2}
                value={freeText}
                onChange={(event) => setFreeText(event.target.value)}
                placeholder="Describe brevemente la situación..."
              />
            </div>
          </>
        )}

        {/* Espacio para el botón fijo */}
        <div className="h-4" />
      </main>

      {/* ─── BOTÓN FIJO INFERIOR ─── */}
      {selectedCategory && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-safe pt-3 pb-4 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            className="w-full rounded-2xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 py-4 text-sm font-bold text-white transition shadow-lg shadow-sky-500/20 cursor-pointer flex items-center justify-center gap-2"
            aria-label="Continuar"
            onClick={handleContinue}
          >
            <span>Continuar a Ubicación</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
}
