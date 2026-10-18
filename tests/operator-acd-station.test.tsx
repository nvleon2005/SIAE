import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OperatorAcdStation } from "@/src/components/siae/OperatorAcdStation";
import { usePsapQueue } from "@/src/modules/psap/use-psap-queue";

describe("OperatorAcdStation — Consola Operativa con Distribución Automática ACD", () => {
  it("renderiza el puesto operativo en espera cuando no hay llamada activa", () => {
    render(<OperatorAcdStation />);

    expect(
      screen.getByText(/puesto operativo de triaje y atención de emergencias/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/distribución acd activa/i)
    ).toBeInTheDocument();
  });

  it("muestra la alerta prioritaria de llamada entrante distribuida por ACD", () => {
    render(<OperatorAcdStation />);

    expect(screen.getByText(/llamada entrante acd/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /contestar ahora/i })).toBeInTheDocument();
  });

  it("al contestar la llamada entrante, pasa a modo atención activa con ficha médica y cuadrante", async () => {
    const user = userEvent.setup();
    render(<OperatorAcdStation />);

    const answerBtn = screen.getByRole("button", { name: /contestar ahora/i });
    await user.click(answerBtn);

    await waitFor(() => {
      expect(screen.getByText(/llamada 911 en curso/i)).toBeInTheDocument();
      expect(screen.getByText(/ficha médica de urgencia/i)).toBeInTheDocument();
      expect(screen.getByText(/cuadrante de paz georreferenciado/i)).toBeInTheDocument();
      expect(screen.getByText(/solo lectura · asignación en cad/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /cambiar cuadrante de paz/i })).not.toBeInTheDocument();
      expect(screen.getByText(/acciones de triaje multicanal/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /derivar a despacho cad/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /concluir atención/i })).toBeInTheDocument();
    });
  });

  it("permite registrar y guardar notas de triaje en tiempo real dentro del expediente de atención", async () => {
    const user = userEvent.setup();
    render(<OperatorAcdStation />);

    const answerBtn = screen.getByRole("button", { name: /contestar ahora/i });
    await user.click(answerBtn);

    await waitFor(() => {
      expect(screen.getByText(/expediente de atención/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /guardar triaje/i })).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(/registrar estado de la víctima/i);
    fireEvent.change(textarea, { target: { value: "Paciente consciente con dificultad respiratoria leve." } });

    const saveBtn = screen.getByRole("button", { name: /guardar triaje/i });
    await user.click(saveBtn);

    await waitFor(() => {
      expect(screen.getByText(/guardado en expediente/i)).toBeInTheDocument();
    });
  }, 15000);
});

