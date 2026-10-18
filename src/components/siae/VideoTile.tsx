"use client";

import { useEffect, useRef } from "react";
import type { LocalParticipant, RemoteParticipant } from "livekit-client";
import { Track } from "livekit-client";

interface VideoTileProps {
  participant: LocalParticipant | RemoteParticipant;
  label: string;
  muted?: boolean;
}

export function VideoTile({ participant, label, muted = false }: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const publication = participant.getTrackPublication(Track.Source.Camera);
    const track = publication?.track;
    const videoElement = videoRef.current;
    if (!videoElement || !track) return;

    track.attach(videoElement);
    return () => {
      track.detach(videoElement);
    };
  }, [participant]);

  return (
    <figure className="video-tile">
      <video ref={videoRef} autoPlay playsInline muted={muted} aria-label={`Vídeo de ${label}`} />
      <figcaption>{label}</figcaption>
    </figure>
  );
}
