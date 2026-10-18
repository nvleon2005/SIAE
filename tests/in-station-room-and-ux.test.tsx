import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import SalaPage from "@/app/sala/[id]/page";

describe("Sala: capabilities without backend integration", () => {
  afterEach(() => {
    globalThis.__mockSearchParams = undefined;
    if (typeof window !== "undefined") {
      window.__mockSearchParams = undefined;
    }
    vi.unstubAllGlobals();
  });

  it("keeps text communication available without claiming live captions or interpreter integration", async () => {
    const mockParams = new URLSearchParams("role=agente");
    globalThis.__mockSearchParams = mockParams;
    if (typeof window !== "undefined") {
      window.__mockSearchParams = mockParams;
    }

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        room_id: "incident-1",
        server_url: "ws://localhost:7880",
        token: "mock-agent-token",
        participants: [],
      }),
    }));

    render(<SalaPage params={{ id: "incident-1" }} initialRole="agente" />);

    await waitFor(() => {
      const backLink = screen.getByRole("link", { name: /consola cad/i });
      expect(backLink).toHaveAttribute("href", "/admin");
      expect(screen.getByText(/transcripción de voz no está conectada/i)).toBeInTheDocument();
      expect(screen.getByText(/solicitud de intérprete todavía no está conectada/i)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /subtítulos/i })).not.toBeInTheDocument();
    });
  });
});
