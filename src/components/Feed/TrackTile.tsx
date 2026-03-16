"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/providers/AudioProvider";
import Scribble from "@/components/ui/Scribble";
import type { Track } from "@/types/audio";
import { truncateAddress } from "@/lib/utils";

export default function TrackTile({
  track,
  queue,
}: {
  track: Track;
  queue: Track[];
}) {
  const { play, currentTrack, isPlaying, toggle } = useAudio();
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

  const displayArtist =
    track.artist.length > 20
      ? truncateAddress(track.artist)
      : track.artist;

  return (
    <div className="group">
      <Link href={`/moment/${track.id}`} className="block">
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
                unoptimized
                onLoad={() => setLoadedSrc(track.artworkUrl)}
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800">
              <Scribble className="h-12 w-12 text-zinc-600" />
            </div>
          )}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
          >
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 ${
                isCurrentTrack && isPlaying
                  ? "scale-100 opacity-100 shadow-[0_0_20px_rgba(255,255,255,0.25)] animate-pulse-slow"
                  : isCurrentTrack
                    ? "scale-100 opacity-100 shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                    : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:shadow-[0_0_15px_rgba(255,255,255,0.15)]"
              }`}
            >
              {isCurrentTrack && isPlaying ? (
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
        </div>
        <div className="mt-2.5">
          <p className="truncate text-[13px] font-medium leading-tight text-zinc-100">
            {track.title}
          </p>
          <p className="mt-0.5 truncate text-[13px] leading-tight text-zinc-500">
            {displayArtist}
          </p>
        </div>
      </Link>
    </div>
  );
}
