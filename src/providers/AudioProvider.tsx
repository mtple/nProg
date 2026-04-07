"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Track } from "@/types/audio";

interface AudioContextValue {
  currentTrack: Track | null;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  toggle: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  next: () => void;
  previous: () => void;
}

const AudioContext = createContext<AudioContextValue | null>(null);

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}

export default function AudioProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [queue, setQueue] = useState<Track[]>([]);

  // Use refs for values needed in event handlers to avoid stale closures
  const currentTrackRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>([]);
  currentTrackRef.current = currentTrack;
  queueRef.current = queue;

  // Lazily create the Audio element on first use
  const getOrCreateAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      const cur = currentTrackRef.current;
      const q = queueRef.current;
      if (!cur || q.length === 0) return;
      const idx = q.findIndex((t) => t.id === cur.id);
      if (idx >= 0 && idx + 1 < q.length) {
        const nextTrack = q[idx + 1];
        setCurrentTrack(nextTrack);
        audio.src = nextTrack.audioUrl;
        audio.play().catch(() => {});
      }
    });
    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("waiting", () => setIsBuffering(true));
    audio.addEventListener("playing", () => setIsBuffering(false));

    return audio;
  }, []);

  // Clean up audio element on unmount
  useEffect(() => {
    return () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    const audio = getOrCreateAudio();
    setCurrentTrack(track);
    setIsBuffering(true);
    audio.src = track.audioUrl;
    audio.play().catch(() => {});
  }, [getOrCreateAudio]);

  const play = useCallback(
    (track: Track, newQueue?: Track[]) => {
      if (newQueue) setQueue(newQueue);
      playTrack(track);
    },
    [playTrack]
  );

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = vol;
    setVolumeState(vol);
  }, []);

  const next = useCallback(() => {
    const cur = currentTrackRef.current;
    const q = queueRef.current;
    if (!cur || q.length === 0) return;
    const idx = q.findIndex((t) => t.id === cur.id);
    if (idx >= 0 && idx + 1 < q.length) {
      playTrack(q[idx + 1]);
    }
  }, [playTrack]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const cur = currentTrackRef.current;
    const q = queueRef.current;
    if (!cur || q.length === 0) return;

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    const idx = q.findIndex((t) => t.id === cur.id);
    if (idx > 0) {
      playTrack(q[idx - 1]);
    } else {
      audio.currentTime = 0;
    }
  }, [playTrack]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isBuffering,
        currentTime,
        duration,
        volume,
        queue,
        play,
        pause,
        toggle,
        seek,
        setVolume,
        next,
        previous,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
