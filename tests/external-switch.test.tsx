import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ExternalSwitchButton } from "@/src/components/siae/ExternalSwitchButton";

class MockHidDevice {
  opened = false;
  listener: ((event: { data: DataView }) => void) | null = null;

  async open() {
    this.opened = true;
  }

  async close() {
    this.opened = false;
  }

  addEventListener(_type: "inputreport", listener: (event: { data: DataView }) => void) {
    this.listener = listener;
  }

  removeEventListener() {
    this.listener = null;
  }
}

describe("switch externo", () => {
  it("activa una vez por pulsación y permite una nueva tras liberar", async () => {
    const device = new MockHidDevice();
    const onEmergency = vi.fn();
    vi.stubGlobal("navigator", {
      ...navigator,
      hid: { requestDevice: vi.fn().mockResolvedValue([device]) },
    });
    render(<ExternalSwitchButton onEmergency={onEmergency} />);

    fireEvent.click(screen.getByRole("button", { name: /conectar switch/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /switch conectado/i })).toBeInTheDocument());

    device.listener?.({ data: new DataView(Uint8Array.from([1]).buffer) });
    device.listener?.({ data: new DataView(Uint8Array.from([1]).buffer) });
    expect(onEmergency).toHaveBeenCalledOnce();

    device.listener?.({ data: new DataView(Uint8Array.from([0]).buffer) });
    device.listener?.({ data: new DataView(Uint8Array.from([1]).buffer) });
    expect(onEmergency).toHaveBeenCalledTimes(2);
  });
});