"use client";

import type { LocalParticipant, RemoteParticipant } from "livekit-client";
import { VideoTile } from "@/src/components/siae/VideoTile";

interface VideoRoomProps {
  participants: RemoteParticipant[];
  localParticipant: LocalParticipant | null;
}

export function VideoRoom({ participants, localParticipant }: VideoRoomProps) {
  return (
    <section className="video-room" aria-label="Vídeo de la sala">
      {participants.length > 0 ? participants.map((participant) => (
        <VideoTile key={participant.identity} participant={participant} label="Agente" />
      )) : (
        <div className="video-placeholder" role="status">El vídeo del agente aparecerá al conectarse.</div>
      )}
      {localParticipant ? <VideoTile participant={localParticipant} label="Tú" muted /> : null}
    </section>
  );
}
