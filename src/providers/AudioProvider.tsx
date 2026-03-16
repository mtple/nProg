"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { getAudioFallbackUrl } from "@/lib/resolveMediaUrl";
import type { Track } from "@/types/audio";

interface AudioContextValue {
  currentTrack: Track | null;
  isPlaying: boolean;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [queue, setQueue] = useState<Track[]>([]);

  // Use refs for values needed in event handlers to avoid stale closures
  const currentTrackRef = useRef<Track | null>(null);
  const queueRef = useRef<Track[]>([]);
  const triedFallbackRef = useRef<Set<string>>(new Set());
  currentTrackRef.current = currentTrack;
  queueRef.current = queue;

  const playTrack = useCallback((track: Track) => {
    const audio = audioRef.current;
    if (!audio) return;
    triedFallbackRef.current.clear();
    setCurrentTrack(track);
    audio.src = track.audioUrl;
    audio.play().catch(() => {});
  }, []);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
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
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      const currentSrc = audio.src;
      if (!currentSrc || triedFallbackRef.current.has(currentSrc)) return;
      triedFallbackRef.current.add(currentSrc);
      const fallback = getAudioFallbackUrl(currentSrc);
      if (fallback) {
        audio.src = fallback;
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
    };
  }, []);

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
