import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomControls } from "@/src/components/siae/RoomControls";
import { getUiCopy, type SupportedLocale } from "@/src/lib/ui-copy";

describe("SPRINT-11 sala", () => {
  it("expone controles accesibles de audio, vídeo y colgar", async () => {
    const user = userEvent.setup();
    const onToggleAudio = vi.fn();
    const onToggleVideo = vi.fn();
    const onHangup = vi.fn();

    render(
      <RoomControls
        audioEnabled
        videoEnabled
        disabled={false}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
        onHangup={onHangup}
      />,
    );

    await user.click(screen.getByRole("button", { name: /silenciar micrófono/i }));
    await user.click(screen.getByRole("button", { name: /apagar cámara/i }));
    await user.click(screen.getByRole("button", { name: /colgar/i }));

    expect(onToggleAudio).toHaveBeenCalledOnce();
    expect(onToggleVideo).toHaveBeenCalledOnce();
    expect(onHangup).toHaveBeenCalledOnce();
  });

  it("desactiva audio y vídeo mientras la sala no está conectada", () => {
    render(
      <RoomControls
        audioEnabled={false}
        videoEnabled={false}
        disabled
        onToggleAudio={vi.fn()}
        onToggleVideo={vi.fn()}
        onHangup={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /activar micrófono/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /activar cámara/i })).toBeDisabled();
  });

  it("mantiene copy completo para las seis locales soportadas", () => {
    const locales: SupportedLocale[] = ["es", "es-419", "ca", "eu", "gl", "en"];

    for (const locale of locales) {
      const copy = getUiCopy(locale);
      expect(copy.requestPhoto).toBeTruthy();
      expect(copy.requestInterpreter).toBeTruthy();
      expect(copy.captionsOn).toBeTruthy();
      expect(copy.mediaDecision).toBeTruthy();
    }
  });

  it("abre la sala enviando cabecera x-idempotency-key y cuerpo contractual", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        room_id: "sala-test-1",
        server_url: "ws://localhost:7880",
        token: "livekit-token-test",
        participants: [],
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const SalaPage = (await import("@/app/sala/[id]/page")).default;
    render(<SalaPage params={{ id: "sala-test-1" }} />);

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/v1/salas/sala-test-1/unirse",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "x-idempotency-key": expect.any(String),
          }),
          body: expect.stringContaining('"id":"sala-test-1"'),
        }),
      );
    });
  });

  it("muestra el banner de fallback a RTT si falla la conexión de sala", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }));

    const SalaPage = (await import("@/app/sala/[id]/page")).default;
    render(<SalaPage params={{ id: "sala-test-error" }} />);

    const { waitFor } = await import("@testing-library/react");
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("El vídeo o el audio no están disponibles. Puedes seguir por texto.");
    });
  });
});
