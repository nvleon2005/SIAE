"use client";

interface RoomControlsProps {
  audioEnabled: boolean;
  videoEnabled: boolean;
  disabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onHangup: () => void;
}

export function RoomControls({ audioEnabled, videoEnabled, disabled, onToggleAudio, onToggleVideo, onHangup }: RoomControlsProps) {
  return (
    <div className="room-controls" aria-label="Controles de la sala">
      <button type="button" className="secondary-button" aria-pressed={audioEnabled} disabled={disabled} onClick={() => void onToggleAudio()}>
        {audioEnabled ? "Silenciar micrófono" : "Activar micrófono"}
      </button>
      <button type="button" className="secondary-button" aria-pressed={videoEnabled} disabled={disabled} onClick={() => void onToggleVideo()}>
        {videoEnabled ? "Apagar cámara" : "Activar cámara"}
      </button>
      <button type="button" className="danger-button" onClick={onHangup}>Colgar</button>
    </div>
  );
}
