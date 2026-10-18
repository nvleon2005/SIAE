import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SignAssistantBanner } from "@/src/components/siae/SignAssistantBanner";
import { useSignAssistant, type SignDetectionResult } from "@/src/modules/ai/sign-assistant";

function TestSignAssistantWrapper({ onConfirmed }: { onConfirmed?: (sign: SignDetectionResult) => void }) {
  const { detectedSign, processDetection, confirmSign, dismissSign } = useSignAssistant({
    confidenceThreshold: 0.8,
    throttleMs: 0,
    onSignConfirmed: onConfirmed,
  });

  return (
    <div>
      <button
        type="button"
        onClick={() => processDetection("sos_universal", 0.92)}
      >
        Detectar SOS
      </button>
      <button
        type="button"
        onClick={() => processDetection("auxilio", 0.65)}
      >
        Detectar Bajo Umbral
      </button>
      <SignAssistantBanner
        detectedSign={detectedSign}
        onConfirm={confirmSign}
        onDismiss={dismissSign}
      />
    </div>
  );
}

describe("G.2: Detección y Asistencia de Lengua de Señas con MediaPipe Hands (LSV)", () => {
  it("does not render banner when no sign is detected", () => {
    const { container } = render(
      <SignAssistantBanner
        detectedSign={null}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders detected sign with confidence percentage and alert role", () => {
    const detected: SignDetectionResult = {
      signCode: "sos_universal",
      label: "Señal Universal de Auxilio (Signal for Help)",
      confidence: 0.94,
      detectedAt: Date.now(),
    };

    render(
      <SignAssistantBanner
        detectedSign={detected}
        onConfirm={vi.fn()}
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/94% Confianza/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Señal Universal de Auxilio \(Signal for Help\)/i)
    ).toBeInTheDocument();
  });

  it("triggers onConfirm when button is clicked", () => {
    const onConfirm = vi.fn();
    const detected: SignDetectionResult = {
      signCode: "auxilio",
      label: "Auxilio / Ayuda (LSV)",
      confidence: 0.88,
      detectedAt: Date.now(),
    };

    render(
      <SignAssistantBanner
        detectedSign={detected}
        onConfirm={onConfirm}
        onDismiss={vi.fn()}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: /Confirmar y Enviar/i });
    fireEvent.click(confirmBtn);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("triggers onConfirm with Enter or Space key and dismiss with Escape key", () => {
    const onConfirm = vi.fn();
    const onDismiss = vi.fn();
    const detected: SignDetectionResult = {
      signCode: "sos_universal",
      label: "Señal Universal de Auxilio (Signal for Help)",
      confidence: 0.9,
      detectedAt: Date.now(),
    };

    render(
      <SignAssistantBanner
        detectedSign={detected}
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />
    );

    fireEvent.keyDown(window, { key: "Enter" });
    expect(onConfirm).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("hook ignores detections below confidence threshold and confirms valid ones", () => {
    const onConfirmed = vi.fn();
    render(<TestSignAssistantWrapper onConfirmed={onConfirmed} />);

    // Click low threshold (0.65 vs threshold 0.8)
    const lowBtn = screen.getByText("Detectar Bajo Umbral");
    act(() => {
      fireEvent.click(lowBtn);
    });
    expect(screen.queryByRole("alert")).toBeNull();

    // Click high threshold (0.92 vs threshold 0.8)
    const highBtn = screen.getByText("Detectar SOS");
    act(() => {
      fireEvent.click(highBtn);
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Confirm
    const confirmBtn = screen.getByRole("button", { name: /Confirmar y Enviar/i });
    act(() => {
      fireEvent.click(confirmBtn);
    });

    expect(onConfirmed).toHaveBeenCalledTimes(1);
    expect(onConfirmed).toHaveBeenCalledWith(
      expect.objectContaining({ signCode: "sos_universal", confidence: 0.92 })
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
