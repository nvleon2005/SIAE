import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MultiProfileSelector } from "@/src/modules/profile/MultiProfileSelector";

const mockUpdate = vi.fn().mockResolvedValue(undefined);

vi.mock("@/src/modules/profile/profile-store", () => ({
  useProfile: () => ({
    profile: { fullName: "Test User", disabilities: [] },
    update: mockUpdate,
  }),
}));

describe("MultiProfileSelector Component (RF-007)", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUpdate.mockClear();
  });

  it("renders the active profile and button to switch", () => {
    render(<MultiProfileSelector />);

    expect(screen.getByText(/Perfil Activo de Emergencia/i)).toBeInTheDocument();
    expect(screen.getByText(/Yo \(Perfil Principal\)/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cambiar/i })).toBeInTheDocument();
  });

  it("opens list of profiles and allows selecting Abuelo Luis", async () => {
    render(<MultiProfileSelector />);

    const changeBtn = screen.getByRole("button", { name: /Cambiar/i });
    fireEvent.click(changeBtn);

    expect(screen.getByText(/Selecciona a quién reportas auxilio/i)).toBeInTheDocument();
    const abueloBtn = screen.getByText(/Abuelo Luis/i);
    expect(abueloBtn).toBeInTheDocument();

    fireEvent.click(abueloBtn);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Abuelo Luis",
      })
    );
  });
});
