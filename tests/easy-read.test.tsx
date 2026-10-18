import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EasyReadFlow } from "@/src/modules/typification/EasyReadFlow";

// Mock de audio description
vi.mock("@/src/modules/a11y/audio-description", () => ({
  speak: vi.fn(),
}));

describe("EasyReadFlow Component (RF-034)", () => {
  it("renders the first easy read question and binary buttons SÍ / NO", () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(<EasyReadFlow onSelect={onSelect} onCancel={onCancel} />);

    expect(screen.getByText("Lectura Fácil")).toBeInTheDocument();
    expect(screen.getByText("Pregunta 1 de 5")).toBeInTheDocument();
    expect(screen.getByText(/¿Alguien está sangrando o herido de gravedad\?/i)).toBeInTheDocument();

    const yesBtn = screen.getByRole("button", { name: /SÍ/i });
    const noBtn = screen.getByRole("button", { name: /NO/i });

    expect(yesBtn).toBeInTheDocument();
    expect(noBtn).toBeInTheDocument();
  });

  it("selects critical emergency immediately when SÍ is clicked", () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(<EasyReadFlow onSelect={onSelect} onCancel={onCancel} />);

    const yesBtn = screen.getByRole("button", { name: /SÍ/i });
    fireEvent.click(yesBtn);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      "medical",
      "medical.trauma",
      "Herida o Sangrado Grave",
      expect.stringContaining("Respondió SÍ")
    );
  });

  it("advances to question 2 when NO is clicked on question 1", () => {
    const onSelect = vi.fn();
    const onCancel = vi.fn();

    render(<EasyReadFlow onSelect={onSelect} onCancel={onCancel} />);

    const noBtn = screen.getByRole("button", { name: /NO/i });
    fireEvent.click(noBtn);

    expect(screen.getByText("Pregunta 2 de 5")).toBeInTheDocument();
    expect(screen.getByText(/¿La persona se ahoga, no puede respirar o tiene dolor en el pecho\?/i)).toBeInTheDocument();
  });
});
