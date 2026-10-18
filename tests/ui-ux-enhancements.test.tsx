import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EmptyState } from "@/src/components/siae/EmptyState";
import { Toast } from "@/src/components/siae/Toast";
import { triggerHapticFeedback } from "@/src/modules/a11y/haptics";
import { AccessibilityMenu } from "@/src/components/siae/AccessibilityMenu";
import { defaultLocalProfile, type LocalProfileRecord } from "@/src/lib/profile-db";

describe("UI/UX Enhancements — Excelencia Visual y Microinteracciones Accesibles", () => {
  describe("EmptyState Component", () => {
    it("renders title, description and accessible role", () => {
      render(
        <EmptyState
          title="Sin incidentes"
          description="No hay emergencias registradas en este cuadrante."
        />
      );

      const region = screen.getByRole("region", { name: "Sin incidentes" });
      expect(region).toBeDefined();
      expect(screen.getByText("Sin incidentes")).toBeDefined();
      expect(screen.getByText("No hay emergencias registradas en este cuadrante.")).toBeDefined();
    });

    it("renders action button and triggers callback on click", () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          title="Lista vacía"
          description="Prueba con otros filtros."
          actionLabel="Restablecer"
          onAction={onAction}
        />
      );

      const button = screen.getByRole("button", { name: "Restablecer" });
      fireEvent.click(button);
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe("Toast Notification Component", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("renders polite status role for info and success types", () => {
      render(
        <Toast
          type="success"
          title="Guardado exitoso"
          message="Los cambios se aplicaron correctamente."
          onClose={vi.fn()}
        />
      );

      const toast = screen.getByRole("status");
      expect(toast).toBeDefined();
      expect(screen.getByText("Guardado exitoso")).toBeDefined();
      expect(screen.getByText("Los cambios se aplicaron correctamente.")).toBeDefined();
    });

    it("renders assertive alert role for error type", () => {
      render(
        <Toast
          type="error"
          title="Error de red"
          message="No se pudo contactar al servidor."
          onClose={vi.fn()}
        />
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeDefined();
      expect(screen.getByText("Error de red")).toBeDefined();
    });

    it("invokes onClose when clicking the dismiss button", () => {
      const onClose = vi.fn();
      render(
        <Toast
          title="Alerta"
          onClose={onClose}
        />
      );

      const closeBtn = screen.getByRole("button", { name: /cerrar notificación/i });
      fireEvent.click(closeBtn);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("auto closes after the duration expires", () => {
      const onClose = vi.fn();
      render(
        <Toast
          title="Temporal"
          durationMs={3000}
          onClose={onClose}
        />
      );

      expect(onClose).not.toHaveBeenCalled();
      act(() => {
        vi.advanceTimersByTime(3100);
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Haptics Module", () => {
    let mockVibrate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockVibrate = vi.fn().mockReturnValue(true);
      Object.defineProperty(navigator, "vibrate", {
        value: mockVibrate,
        writable: true,
        configurable: true,
      });
      document.documentElement.removeAttribute("data-reduced-motion");
    });

    it("triggers vibration pattern for tap and sos", () => {
      const tapResult = triggerHapticFeedback("tap");
      expect(tapResult).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith(50);

      const sosResult = triggerHapticFeedback("sos");
      expect(sosResult).toBe(true);
      expect(mockVibrate).toHaveBeenCalledWith([150, 80, 250, 80, 150]);
    });

    it("suppresses vibration if data-reduced-motion is active", () => {
      document.documentElement.setAttribute("data-reduced-motion", "true");
      const result = triggerHapticFeedback("tap");
      expect(result).toBe(false);
      expect(mockVibrate).not.toHaveBeenCalled();
    });
  });

  describe("AccessibilityMenu Enhancements", () => {
    it("exposes Yellow-on-Black theme and Easy Read mode", () => {
      const onProfileChange = vi.fn();
      const profile: LocalProfileRecord = {
        ...defaultLocalProfile,
        theme: "light",
        easyRead: false,
      };

      render(
        <AccessibilityMenu
          open={true}
          onOpenChange={vi.fn()}
          profile={profile}
          onProfileChange={onProfileChange}
        />
      );

      // Verificar que la opción "Amarillo sobre negro" está disponible en el selector de tema
      const themeSelect = screen.getByLabelText("Tema") as HTMLSelectElement;
      expect(themeSelect).toBeDefined();

      fireEvent.change(themeSelect, { target: { value: "yellow_black" } });
      expect(onProfileChange).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "yellow_black" })
      );

      // Verificar checkbox de Modo fácil lectura
      const easyReadCheckbox = screen.getByLabelText(/Modo fácil lectura/i) as HTMLInputElement;
      expect(easyReadCheckbox).toBeDefined();
      expect(easyReadCheckbox.checked).toBe(false);

      fireEvent.click(easyReadCheckbox);
      expect(onProfileChange).toHaveBeenCalledWith(
        expect.objectContaining({ easyRead: true })
      );
    });
  });

  describe("Ajustes Page UI/UX", () => {
    it("renders settings sections: theme, font scale, easy read and language", async () => {
      const { default: AjustesPage } = await import("@/app/ajustes/page");
      const { I18nProvider } = await import("@/src/modules/i18n/i18n-context");

      render(
        <I18nProvider initialLocale="es">
          <AjustesPage />
        </I18nProvider>
      );

      // Verificar títulos de sección
      expect(screen.getByText("Paleta de Color y Contraste")).toBeDefined();
      expect(screen.getByText("Escala Tipográfica y Lectura Fácil")).toBeDefined();
      expect(screen.getByText("Pulsación del Botón de Emergencia (SOS)")).toBeDefined();
      expect(screen.getByText("Idioma del Sistema")).toBeDefined();
      expect(screen.getByText("Respuesta Táctil / Háptica")).toBeDefined();

      // Probar botón de prueba háptica
      const vibrateBtn = screen.getByRole("button", { name: /probar vibración/i });
      fireEvent.click(vibrateBtn);

      // Verificar que se disparó la vibración o notificación
      const toast = await screen.findByRole("status");
      expect(toast).toBeDefined();
    });
  });
});
