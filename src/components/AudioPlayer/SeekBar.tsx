"use client";

import { useAudio } from "@/providers/AudioProvider";
import { formatDuration } from "@/lib/utils";

export default function SeekBar() {
  const { currentTime, duration, seek } = useAudio();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-right text-xs tabular-nums text-zinc-400">
        {formatDuration(currentTime)}
      </span>
      <input
        type="range"
        min={0}
        max={duration || 0}
        value={currentTime}
        onChange={handleChange}
        className="h-1 flex-1"
        step={0.1}
      />
      <span className="w-10 text-xs tabular-nums text-zinc-400">
        {formatDuration(duration)}
      </span>
    </div>
  );
}
