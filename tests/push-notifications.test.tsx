import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationSettingsPage from "@/app/perfil/notificaciones/page";

describe("SPRINT-09 push notifications", () => {
  it("solicita permiso y registra la suscripción en el backend", async () => {
    const user = userEvent.setup();
    const subscribe = vi.fn().mockResolvedValue({ endpoint: "https://push.test/subscription" });
    const getSubscription = vi.fn().mockResolvedValue(null);
    const pushManager = { subscribe, getSubscription };
    const ready = Promise.resolve({ pushManager });

    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("granted"),
    });
    Object.defineProperty(window, "PushManager", { value: class PushManager {}, configurable: true });
    Object.defineProperty(navigator, "serviceWorker", { value: { ready }, configurable: true });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<NotificationSettingsPage />);
    await user.click(screen.getByRole("switch", { name: /notificaciones push/i }));

    await waitFor(() => expect(subscribe).toHaveBeenCalledWith({ userVisibleOnly: true }));
    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/push/subscribe",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "x-idempotency-key": expect.any(String),
        }),
        body: expect.stringContaining('"endpoint":"https://push.test/subscription"'),
      }),
    );
    expect(screen.getByText(/notificaciones activadas/i)).toBeInTheDocument();
  });

  it("muestra el rechazo y no suscribe si el permiso fue denegado", async () => {
    vi.stubGlobal("Notification", {
      permission: "default",
      requestPermission: vi.fn().mockResolvedValue("denied"),
    });
    Object.defineProperty(window, "PushManager", { value: class PushManager {}, configurable: true });
    Object.defineProperty(navigator, "serviceWorker", { value: { ready: Promise.resolve({ pushManager: { subscribe: vi.fn() } }) }, configurable: true });

    render(<NotificationSettingsPage />);
    await userEvent.setup().click(screen.getByRole("switch", { name: /notificaciones push/i }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.some((alert) => /rechazado/i.test(alert.textContent ?? ""))).toBe(true);
  });

  it("envía petición DELETE al backend al desuscribir", async () => {
    const user = userEvent.setup();
    const unsubscribe = vi.fn().mockResolvedValue(true);
    const existingSub = {
      endpoint: "https://push.test/sub-existing",
      unsubscribe,
    };
    const pushManager = {
      subscribe: vi.fn(),
      getSubscription: vi.fn().mockResolvedValue(existingSub),
    };
    const ready = Promise.resolve({ pushManager });

    vi.stubGlobal("Notification", {
      permission: "granted",
      requestPermission: vi.fn().mockResolvedValue("granted"),
    });
    Object.defineProperty(window, "PushManager", { value: class PushManager {}, configurable: true });
    Object.defineProperty(navigator, "serviceWorker", { value: { ready }, configurable: true });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    render(<NotificationSettingsPage />);

    // Esperar a que detecte que está suscrito
    await waitFor(() => {
      expect(screen.getByRole("switch", { name: /notificaciones push/i })).toBeChecked();
    });

    // Desactivar switch
    await user.click(screen.getByRole("switch", { name: /notificaciones push/i }));

    await waitFor(() => expect(unsubscribe).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/push/subscribe",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ endpoint: "https://push.test/sub-existing" }),
      }),
    );
  });
});
