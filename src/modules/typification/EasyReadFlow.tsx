"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Volume2, ArrowRight, RotateCcw, AlertTriangle, HeartPulse, Flame, ShieldAlert, Car } from "lucide-react";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { speak } from "@/src/modules/a11y/audio-description";

interface EasyReadQuestion {
  id: string;
  categoryCode: string;
  subtypeCode: string;
  label: string;
  questionText: string;
  icon: any;
  priority: "P0" | "P1" | "P2";
}

const EASY_QUESTIONS: EasyReadQuestion[] = [
  {
    id: "sangrado",
    categoryCode: "medical",
    subtypeCode: "medical.trauma",
    label: "Herida o Sangrado Grave",
    questionText: "¿Alguien está sangrando o herido de gravedad?",
    icon: HeartPulse,
    priority: "P0",
  },
  {
    id: "respiracion",
    categoryCode: "medical",
    subtypeCode: "medical.cardiac",
    label: "Dificultad para Respirar / Infarto",
    questionText: "¿La persona se ahoga, no puede respirar o tiene dolor en el pecho?",
    icon: HeartPulse,
    priority: "P0",
  },
  {
    id: "fuego",
    categoryCode: "fire",
    subtypeCode: "fire.building",
    label: "Fuego o Humo Denso",
    questionText: "¿Hay fuego, explosión o humo que no deja respirar?",
    icon: Flame,
    priority: "P0",
  },
  {
    id: "peligro_seguridad",
    categoryCode: "police",
    subtypeCode: "police.assault",
    label: "Peligro de Agresión o Armas",
    questionText: "¿Hay una persona armada o en peligro inminente de agresión?",
    icon: ShieldAlert,
    priority: "P0",
  },
  {
    id: "accidente_vial",
    categoryCode: "traffic",
    subtypeCode: "traffic.collision",
    label: "Choque o Accidente de Tránsito",
    questionText: "¿Ocurrió un choque de vehículos, moto o atropellamiento?",
    icon: Car,
    priority: "P1",
  },
];

interface EasyReadFlowProps {
  onSelect: (category: string, subtype: string, label: string, summaryNote: string) => void;
  onCancel: () => void;
}

export function EasyReadFlow({ onSelect, onCancel }: EasyReadFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});

  const currentQ = EASY_QUESTIONS[currentIndex];

  const handleSpeak = (text: string) => {
    triggerHapticFeedback("tap");
    speak(text);
  };

  const handleAnswer = (isYes: boolean) => {
    triggerHapticFeedback(isYes ? "warning" : "tap");
    const updated = { ...answers, [currentQ.id]: isYes };
    setAnswers(updated);

    if (isYes) {
      // Si responde SÍ a una emergencia crítica, configurar y permitir confirmar inmediatamente
      const summary = `Triaje Lectura Fácil: ${currentQ.label} (Respondió SÍ a: "${currentQ.questionText}")`;
      onSelect(currentQ.categoryCode, currentQ.subtypeCode, currentQ.label, summary);
      return;
    }

    // Si responde NO, avanzar a la siguiente pregunta
    if (currentIndex < EASY_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Llegó al final sin responder SÍ a ninguna específica
      const summary = "Triaje Lectura Fácil: Asistencia general requerida (No indicó riesgo vital inmediato en preguntas binarias)";
      onSelect("other", "other.general", "Emergencia General / Otra", summary);
    }
  };

  const handleReset = () => {
    triggerHapticFeedback("tap");
    setCurrentIndex(0);
    setAnswers({});
  };

  const CurrentIcon = currentQ.icon;

  return (
    <div className="flex flex-col items-center justify-between p-4 max-w-lg mx-auto w-full min-h-[500px] bg-amber-50/50 dark:bg-slate-900/80 rounded-3xl border-2 border-amber-300 dark:border-amber-700/60 shadow-xl" role="region" aria-label="Modo de Lectura Fácil de Emergencia">
      {/* Cabecera y progreso */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-amber-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-full text-xs uppercase tracking-wider">
            Lectura Fácil
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            Pregunta {currentIndex + 1} de {EASY_QUESTIONS.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition px-2 py-1"
        >
          Volver a Pictogramas
        </button>
      </div>

      {/* Tarjeta de la pregunta actual */}
      <div className="flex-1 flex flex-col items-center justify-center text-center my-6 px-2 w-full">
        <div className="p-4 bg-amber-100 dark:bg-amber-950/80 rounded-2xl mb-4 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400">
          <CurrentIcon className="w-16 h-16 animate-pulse" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-snug tracking-tight max-w-md">
          {currentQ.questionText}
        </h2>

        <button
          type="button"
          onClick={() => handleSpeak(currentQ.questionText)}
          className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 rounded-full border border-sky-300 dark:border-sky-800 text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
          aria-label="Escuchar pregunta en voz alta"
        >
          <Volume2 className="w-4 h-4" />
          <span>Escuchar pregunta</span>
        </button>
      </div>

      {/* Botones Dicotómicos Gigantes: SÍ / NO */}
      <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-amber-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => handleAnswer(true)}
          className="flex flex-col items-center justify-center p-6 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-2xl shadow-lg border-2 border-emerald-400 transition cursor-pointer"
        >
          <CheckCircle2 className="w-12 h-12 mb-1" />
          <span className="text-2xl font-black uppercase tracking-wider">SÍ</span>
          <span className="text-xs opacity-90 font-medium">Es esto</span>
        </button>

        <button
          type="button"
          onClick={() => handleAnswer(false)}
          className="flex flex-col items-center justify-center p-6 bg-slate-700 hover:bg-slate-600 active:scale-95 text-white rounded-2xl shadow-lg border-2 border-slate-500 transition cursor-pointer"
        >
          <XCircle className="w-12 h-12 mb-1" />
          <span className="text-2xl font-black uppercase tracking-wider">NO</span>
          <span className="text-xs opacity-90 font-medium">Siguiente</span>
        </button>
      </div>

      {/* Barra de progreso inferior */}
      <div className="w-full flex items-center justify-between pt-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reiniciar</span>
        </button>
        <div className="flex gap-1.5">
          {EASY_QUESTIONS.map((q, i) => (
            <span
              key={q.id}
              className={`h-2 rounded-full transition-all ${
                i === currentIndex
                  ? "w-6 bg-amber-500"
                  : i < currentIndex
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-slate-300 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
