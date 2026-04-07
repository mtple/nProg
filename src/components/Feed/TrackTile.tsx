"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/providers/AudioProvider";
import Scribble from "@/components/ui/Scribble";
import type { Track } from "@/types/audio";
import { formatArtistName } from "@/lib/utils";

export default function TrackTile({
  track,
  queue,
}: {
  track: Track;
  queue: Track[];
}) {
  const { play, currentTrack, isPlaying, isBuffering, toggle } = useAudio();
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const imageLoaded = loadedSrc === track.artworkUrl;

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCurrentTrack) {
      toggle();
    } else {
      play(track, queue);
    }
  };

  const displayArtist = formatArtistName(track.artist);

  return (
    <div className="group">
      <div className="relative aspect-square overflow-hidden rounded bg-zinc-900">
        {track.artworkUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <Scribble className="h-12 w-12 text-zinc-600" />
              </div>
            )}
            <Image
              src={track.artworkUrl}
              alt={track.title}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-[1.03] group-hover:brightness-75 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 640px) 176px, 208px"
              onLoad={() => setLoadedSrc(track.artworkUrl)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <Scribble className="h-12 w-12 text-zinc-600" />
          </div>
        )}

        {/* Play button */}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center"
          aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
        >
          <div
            className={`relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 ${
              isCurrentTrack && isBuffering
                ? "scale-100 opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
                : isCurrentTrack && isPlaying
                  ? "scale-100 opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.25)] animate-pulse-slow"
                  : isCurrentTrack
                    ? "scale-100 opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
            }`}
          >
            {isCurrentTrack && isBuffering ? (
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : isCurrentTrack && isPlaying ? (
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </button>

        {/* Navigate to detail link — bottom-right corner */}
        <Link
          href={`/moment/${track.id}`}
          className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white/70 opacity-0 backdrop-blur-md transition-all duration-300 hover:bg-black/60 hover:text-white group-hover:opacity-100"
          aria-label={`View ${track.title} details`}
          onClick={(e) => e.stopPropagation()}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </Link>

        {/* Now playing indicator */}
        {isCurrentTrack && isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-[3px]">
            <span className="inline-block w-[3px] animate-now-playing-1 rounded-full bg-white" />
            <span className="inline-block w-[3px] animate-now-playing-2 rounded-full bg-white" />
            <span className="inline-block w-[3px] animate-now-playing-3 rounded-full bg-white" />
          </div>
        )}
      </div>
      <Link href={`/moment/${track.id}`} className="mt-2.5 block">
        <p className="truncate text-[13px] font-medium leading-tight text-zinc-100 transition-colors hover:text-white" title={track.title}>
          {track.title}
        </p>
        <p className="mt-0.5 truncate text-[13px] leading-tight text-zinc-500" title={track.artist}>
          {displayArtist}
        </p>
      </Link>
    </div>
  );
}
