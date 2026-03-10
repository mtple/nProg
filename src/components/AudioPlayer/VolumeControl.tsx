"use client";

import { useAudio } from "@/providers/AudioProvider";

export default function VolumeControl() {
  const { volume, setVolume } = useAudio();

  return (
    <div className="hidden items-center gap-2 md:flex">
      <button
        onClick={() => setVolume(volume === 0 ? 1 : 0)}
        className="text-zinc-400 transition-colors hover:text-zinc-50"
        aria-label={volume === 0 ? "Unmute" : "Mute"}
      >
        {volume === 0 ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6.253v11.494m0-11.494L7.586 10.5H4a1 1 0 00-1 1v1a1 1 0 001 1h3.586L12 17.747m0-11.494a1 1 0 011 .293 5 5 0 010 6.908 1 1 0 01-1 .293" />
          </svg>
        )}
      </button>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="h-1 w-20"
      />
    </div>
  );
}
