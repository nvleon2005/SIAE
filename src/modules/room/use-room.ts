"use client";

import { useEffect, useRef, useState } from "react";
import { LocalParticipant, RemoteParticipant, Room, RoomEvent } from "livekit-client";

export type RoomStatus = "connecting" | "connected" | "reconnecting" | "fallback" | "ended";

export function useRoom(serverUrl: string | null, token: string | null) {
  const roomRef = useRef<Room | null>(null);
  const [status, setStatus] = useState<RoomStatus>(serverUrl && token ? "connecting" : "fallback");
  const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<LocalParticipant | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serverUrl || !token || token.startsWith("mock-")) {
      setStatus("fallback");
      setError(!serverUrl || !token
        ? "El servicio de sala no devolvió la URL y las credenciales necesarias."
        : "El servicio de sala devolvió credenciales inválidas.");
      return;
    }

    setError(null);
    setStatus("connecting");
    const room = new Room({ adaptiveStream: true, dynacast: true });
    roomRef.current = room;
    const updateParticipants = () => setParticipants(Array.from(room.remoteParticipants.values()));
    const handleConnected = () => {
      setStatus("connected");
      setLocalParticipant(room.localParticipant);
      setAudioEnabled(room.localParticipant.isMicrophoneEnabled);
      setVideoEnabled(room.localParticipant.isCameraEnabled);
      updateParticipants();
    };
    const handleReconnecting = () => setStatus("reconnecting");
    const handleReconnected = () => setStatus("connected");
    const handleDisconnected = () => setStatus("ended");
    const handleTrackChange = () => {
      setLocalParticipant(room.localParticipant);
      updateParticipants();
    };

    room.on(RoomEvent.Connected, handleConnected);
    room.on(RoomEvent.Reconnecting, handleReconnecting);
    room.on(RoomEvent.Reconnected, handleReconnected);
    room.on(RoomEvent.Disconnected, handleDisconnected);
    room.on(RoomEvent.ParticipantConnected, updateParticipants);
    room.on(RoomEvent.ParticipantDisconnected, updateParticipants);
    room.on(RoomEvent.TrackSubscribed, handleTrackChange);
    room.on(RoomEvent.TrackUnsubscribed, handleTrackChange);

    void room.connect(serverUrl, token).catch((connectionError: unknown) => {
      setError(connectionError instanceof Error ? connectionError.message : "No se pudo conectar a la sala.");
      setStatus("fallback");
    });

    return () => {
      room.removeAllListeners();
      room.disconnect();
      roomRef.current = null;
    };
  }, [serverUrl, token]);

  const toggleAudio = async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
      setAudioEnabled(localParticipant.isMicrophoneEnabled);
      setError(null);
    } catch (toggleError: unknown) {
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo cambiar el micrófono.");
    }
  };

  const toggleVideo = async () => {
    if (!localParticipant) return;
    try {
      await localParticipant.setCameraEnabled(!localParticipant.isCameraEnabled);
      setVideoEnabled(localParticipant.isCameraEnabled);
      setError(null);
    } catch (toggleError: unknown) {
      setError(toggleError instanceof Error ? toggleError.message : "No se pudo cambiar la cámara.");
    }
  };

  const disconnect = () => {
    roomRef.current?.disconnect();
    setStatus("ended");
  };

  return {
    participants,
    localParticipant,
    audioEnabled,
    videoEnabled,
    status,
    error,
    toggleAudio,
    toggleVideo,
    disconnect,
  };
}
