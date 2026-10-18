import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PictogramCell } from "@/src/components/siae/PictogramCell";

describe("Validación de Carga de Pictogramas ARASAAC y Resiliencia Offline", () => {
  it("renders with the high-speed static CDN url by default", () => {
    const { container } = render(
      <PictogramCell
        pictogramId={3530}
        label="Médico"
        size={96}
      />
    );

    const button = screen.getByRole("button", { name: "Médico" });
    expect(button).toBeDefined();

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toContain("https://static.arasaac.org/pictograms/3530/3530_500.png");
  });

  it("transitions to API fallback if the static CDN encounters an error", () => {
    const { container } = render(
      <PictogramCell
        pictogramId={3560}
        label="Fuego"
        size={96}
      />
    );

    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toContain("https://static.arasaac.org/pictograms/3560/3560_500.png");

    // Simular fallo de red en la CDN primaria
    fireEvent.error(img!);

    // Debe conmutar a api.arasaac.org
    const fallbackImg = container.querySelector("img");
    expect(fallbackImg?.getAttribute("src")).toContain("https://api.arasaac.org/v2/pictograms/3560");
  });

  it("gracefully falls back to offline semantic graphic symbol if all remote networks fail", () => {
    const { container } = render(
      <PictogramCell
        pictogramId={2349}
        label="Ambulancia"
        size={96}
      />
    );

    let img = container.querySelector("img");
    expect(img).not.toBeNull();

    // Fallo 1: static CDN
    fireEvent.error(img!);

    // Fallo 2: API
    img = container.querySelector("img");
    expect(img).not.toBeNull();
    fireEvent.error(img!);

    // Debe mostrar el símbolo gráfico de respaldo offline sin imágenes rotas
    expect(screen.getByText("🚑")).toBeDefined();
    expect(screen.getByText("Ambulancia")).toBeDefined();
  });

  it("hides text label when pictogramsOnly is enabled for cognitive diversity", () => {
    render(
      <PictogramCell
        pictogramId={3580}
        label="Seguridad"
        pictogramsOnly={true}
      />
    );

    // El aria-label sigue accesible para lectores de pantalla
    const button = screen.getByRole("button", { name: "Seguridad" });
    expect(button).toBeDefined();

    // Pero el span textual visible no se renderiza
    expect(screen.queryByText("Seguridad", { selector: "span" })).toBeNull();
  });

  it("reflects selection state with aria-pressed attribute", () => {
    render(
      <PictogramCell
        pictogramId={3550}
        label="Accidente"
        selected={true}
      />
    );

    const button = screen.getByRole("button", { name: "Accidente" });
    expect(button.getAttribute("aria-pressed")).toBe("true");
  });
});
