import { useEffect } from "react";
import { DemandaItem } from "@/src/modules/psap/types";

export interface UseOperatorShortcutsProps {
  nextAcdIncident: DemandaItem | null;
  activeCallDemand: DemandaItem | null;
  operatorStatus: "disponible" | "pausa" | "ocupado";
  isDispatchModalOpen: boolean;
  isEvidenceModalOpen: boolean;
  onAnswerAcdCall: (incident: DemandaItem) => void;
  onOpenDispatchModal: () => void;
  onSummonInterpreter: (demandId: string) => void;
  onEndAcdCall: () => void;
}

/**
 * Hook para atajos de teclado ergonómicos en la consola PSAP del Operador (VEN 911).
 * Permite responder con Barra Espaciadora, abrir despacho con tecla 1,
 * convocar intérprete LSV con tecla 2 y finalizar llamada con tecla Escape.
 */
export function useOperatorShortcuts({
  nextAcdIncident,
  activeCallDemand,
  operatorStatus,
  isDispatchModalOpen,
  isEvidenceModalOpen,
  onAnswerAcdCall,
  onOpenDispatchModal,
  onSummonInterpreter,
  onEndAcdCall,
}: UseOperatorShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.code === "Space" && nextAcdIncident && !activeCallDemand && operatorStatus === "disponible") {
        e.preventDefault();
        onAnswerAcdCall(nextAcdIncident);
      } else if (e.key === "1" && activeCallDemand && !isDispatchModalOpen && !isEvidenceModalOpen) {
        e.preventDefault();
        onOpenDispatchModal();
      } else if (e.key === "2" && activeCallDemand && !isDispatchModalOpen && !isEvidenceModalOpen) {
        e.preventDefault();
        onSummonInterpreter(activeCallDemand.id);
      } else if (e.key === "Escape" && activeCallDemand && !isDispatchModalOpen && !isEvidenceModalOpen) {
        e.preventDefault();
        onEndAcdCall();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    nextAcdIncident,
    activeCallDemand,
    operatorStatus,
    isDispatchModalOpen,
    isEvidenceModalOpen,
    onAnswerAcdCall,
    onOpenDispatchModal,
    onSummonInterpreter,
    onEndAcdCall,
  ]);
}
