"use client";

import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/providers/AudioProvider";
import { formatArtistName } from "@/lib/utils";
import SeekBar from "./SeekBar";
import VolumeControl from "./VolumeControl";

export default function AudioPlayer() {
  const { currentTrack, isPlaying, isBuffering, toggle, next, previous } = useAudio();

  if (!currentTrack) return null;

  const displayArtist = formatArtistName(currentTrack.artist);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm"
      style={{ paddingBottom: "var(--safe-area-bottom)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Seek bar on top for mobile */}
        <div className="pt-2 md:hidden">
          <SeekBar />
        </div>

        <div className="flex h-16 items-center gap-4 md:h-20">
          {/* Track info */}
          <Link
            href={`/moment/${currentTrack.id}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded md:h-14 md:w-14">
              {currentTrack.artworkUrl ? (
                <Image
                  src={currentTrack.artworkUrl}
                  alt={currentTrack.title}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              ) : (
                <div className="h-full w-full bg-zinc-800" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-50">
                {currentTrack.title}
              </p>
              <p className="truncate text-xs text-zinc-400">{displayArtist}</p>
            </div>
          </Link>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={previous}
              className="p-2 text-zinc-400 transition-colors hover:text-zinc-50"
              aria-label="Previous"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6V6zm3.5 6l8.5 6V6l-8.5 6z" />
              </svg>
            </button>
            <button
              onClick={toggle}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-50 text-zinc-900 transition-transform hover:scale-105"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isBuffering ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : isPlaying ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button
              onClick={next}
              className="p-2 text-zinc-400 transition-colors hover:text-zinc-50"
              aria-label="Next"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z" />
              </svg>
            </button>
          </div>

          {/* Seek bar for desktop */}
          <div className="hidden flex-1 md:block">
            <SeekBar />
          </div>

          <VolumeControl />
        </div>
      </div>
    </div>
  );
}
