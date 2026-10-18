import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RttPanel } from "@/src/components/siae/RttPanel";
import { clearRttStore } from "@/src/lib/profile-db";

describe("SPRINT-10 RTT", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  beforeEach(async () => {
    await clearRttStore();
  });

  it("envía mensajes y frases rápidas y los conserva localmente", async () => {
    const user = userEvent.setup();
    render(<RttPanel salaId="sala-test" myRole="ciudadano" />);

    await user.type(screen.getByLabelText(/mensaje de texto/i), "Necesito ayuda");
    await user.click(screen.getByRole("button", { name: /enviar mensaje/i }));
    await user.click(screen.getByRole("button", { name: "Sí" }));

    expect(screen.getByText("Necesito ayuda")).toBeInTheDocument();
    expect(screen.getAllByText("Sí").length).toBeGreaterThanOrEqual(2);
  });

  it("expone el panel como log accesible", () => {
    render(<RttPanel salaId="sala-test" myRole="ciudadano" />);
    expect(screen.getByRole("log", { name: "Conversación" })).toHaveAttribute("aria-live", "polite");
  });

  it("recibe mensajes y parciales desde otra pestaña", async () => {
    const rooms = new Map<string, Set<FakeBroadcastChannel>>();

    class FakeBroadcastChannel {
      onmessage: ((event: MessageEvent<unknown>) => void) | null = null;
      private readonly name: string;

      constructor(name: string) {
        this.name = name;
        const members = rooms.get(name) ?? new Set<FakeBroadcastChannel>();
        members.add(this);
        rooms.set(name, members);
      }

      postMessage(data: unknown) {
        queueMicrotask(() => {
          rooms.get(this.name)?.forEach((member) => {
            if (member !== this) member.onmessage?.({ data } as MessageEvent<unknown>);
          });
        });
      }

      close() {
        rooms.get(this.name)?.delete(this);
      }
    }

    vi.stubGlobal("BroadcastChannel", FakeBroadcastChannel);
    const user = userEvent.setup();
    render(
      <>
        <RttPanel salaId="sala-shared" myRole="ciudadano" />
        <RttPanel salaId="sala-shared" myRole="agente" />
      </>,
    );

    const inputs = screen.getAllByLabelText(/mensaje de texto/i);
    await user.type(inputs[0], "Hola");
    expect(screen.getAllByText("Escribiendo...").length).toBeGreaterThan(0);
    await user.click(screen.getAllByRole("button", { name: /enviar mensaje/i })[0]);

    await waitFor(() => expect(screen.getAllByText("Hola")).toHaveLength(2));
  });

  it("conecta por WebSocket y envía frames RTT al servidor", async () => {
    const sentFrames: string[] = [];
    const wsHolder: { current: FakeWebSocket | null } = { current: null };

    class FakeWebSocket {
      static OPEN = 1;
      readyState = 1;
      bufferedAmount = 0;
      url: string;
      onopen: (() => void) | null = null;
      onmessage: ((event: MessageEvent<string>) => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(url: string) {
        this.url = url;
        wsHolder.current = this;
        queueMicrotask(() => this.onopen?.());
      }

      send(data: string) {
        sentFrames.push(data);
      }

      close() {
        this.readyState = 3;
        this.onclose?.();
      }
    }

    vi.stubGlobal("WebSocket", FakeWebSocket);

    const user = userEvent.setup();
    render(
      <RttPanel
        salaId="sala-ws-1"
        myRole="ciudadano"
        token="jwt-token-valido"
        wsUrl="ws://localhost:8080"
      />,
    );

    await waitFor(() => expect(wsHolder.current).not.toBeNull());
    const socket = wsHolder.current!;
    expect(socket.url).toContain("/ws/sala/sala-ws-1");
    expect(socket.url).toContain("room_id=sala-ws-1");
    expect(socket.url).toContain("token=jwt-token-valido");

    const input = screen.getByLabelText(/mensaje de texto/i);
    await user.type(input, "Mensaje via WS");
    await user.click(screen.getByRole("button", { name: /enviar mensaje/i }));

    expect(sentFrames.length).toBeGreaterThanOrEqual(2);
    const finalFrame = JSON.parse(sentFrames[sentFrames.length - 1]) as {
      type: string;
      sala_id: string;
      role: string;
      text: string;
      is_partial: boolean;
    };
    expect(finalFrame).toMatchObject({
      type: "rtt",
      sala_id: "sala-ws-1",
      role: "ciudadano",
      text: "Mensaje via WS",
      is_partial: false,
    });
  });

  it("recibe mensajes y parciales entrantes vía WebSocket", async () => {
    const wsHolder: { current: FakeWebSocket | null } = { current: null };

    class FakeWebSocket {
      static OPEN = 1;
      readyState = 1;
      bufferedAmount = 0;
      url: string;
      onopen: (() => void) | null = null;
      onmessage: ((event: MessageEvent<string>) => void) | null = null;
      onclose: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(url: string) {
        this.url = url;
        wsHolder.current = this;
        queueMicrotask(() => this.onopen?.());
      }

      send() {}
      close() {}
    }

    vi.stubGlobal("WebSocket", FakeWebSocket);

    render(
      <RttPanel
        salaId="sala-ws-2"
        myRole="ciudadano"
        token="jwt-test"
        wsUrl="ws://localhost:8080"
      />,
    );

    await waitFor(() => expect(wsHolder.current).not.toBeNull());
    const socket = wsHolder.current!;

    // Simular recepción de mensaje parcial del agente
    socket.onmessage?.({
      data: JSON.stringify({
        type: "rtt",
        sala_id: "sala-ws-2",
        role: "agente",
        text: "Tranquil",
        is_partial: true,
      }),
    } as MessageEvent<string>);

    await waitFor(() => expect(screen.getByText("Escribiendo...")).toBeInTheDocument());

    // Simular recepción de mensaje finalizado del agente
    socket.onmessage?.({
      data: JSON.stringify({
        type: "rtt",
        sala_id: "sala-ws-2",
        role: "agente",
        text: "Tranquilo, la ayuda va en camino.",
        is_partial: false,
        msg_id: "msg-agente-1",
      }),
    } as MessageEvent<string>);

    await waitFor(() => {
      expect(screen.getByText("Tranquilo, la ayuda va en camino.")).toBeInTheDocument();
    });
  });
});
