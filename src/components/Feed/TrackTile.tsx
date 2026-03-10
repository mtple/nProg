"use client";

import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/providers/AudioProvider";
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
            <Image
              src={track.artworkUrl}
              alt={track.title}
              fill
              className="object-cover transition-all duration-300 group-hover:scale-[1.03] group-hover:brightness-75"
              sizes="(max-width: 640px) 176px, 208px"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-800">
              <svg
                className="h-10 w-10 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
          )}
          <button
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center"
            aria-label={isCurrentTrack && isPlaying ? "Pause" : "Play"}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-lg transition-all ${
                isCurrentTrack
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-100"
              }`}
            >
              {isCurrentTrack && isPlaying ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
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
