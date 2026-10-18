import { act, fireEvent, render, screen } from "@testing-library/react";
import { VoiceActivationButton } from "@/src/components/siae/VoiceActivationButton";

class MockSpeechRecognition {
  static instance: MockSpeechRecognition;
  lang = "";
  continuous = false;
  interimResults = false;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null = null;
  onerror: (() => void) | null = null;
  onend: (() => void) | null = null;

  constructor() {
    MockSpeechRecognition.instance = this;
  }

  start() {}
  stop() {}
}

describe("activación por voz", () => {
  it("activa la emergencia al reconocer la frase de emergencia", () => {
    const onEmergency = vi.fn();
    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);
    render(<VoiceActivationButton onEmergency={onEmergency} />);

    fireEvent.click(screen.getByRole("button", { name: /activar por voz/i }));
    act(() => {
      MockSpeechRecognition.instance.onresult?.({ results: [[{ transcript: "Oye SIAE, emergencia" }]] });
    });

    expect(onEmergency).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /activar por voz/i })).toHaveAttribute("aria-pressed", "false");
  });
});