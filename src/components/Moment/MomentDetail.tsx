"use client";

import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/providers/AudioProvider";
import { useTimeline } from "@/hooks/useTimeline";
import { truncateAddress, formatDate } from "@/lib/utils";
import type { Track } from "@/types/audio";

export default function MomentDetail({ id }: { id: string }) {
  const { tracks } = useTimeline();
  const { play, currentTrack, isPlaying, toggle } = useAudio();

  const track = tracks.find((t: Track) => t.id === id);

  if (!track) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <div className="skeleton mb-4 h-8 w-48 rounded" />
        <p>Loading track...</p>
      </div>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const displayArtist =
    track.artist.length > 20 ? truncateAddress(track.artist) : track.artist;

  const handlePlay = () => {
    if (isCurrentTrack) {
      toggle();
    } else {
      play(track, tracks);
    }
  };

  return (
    <div>
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="flex flex-col gap-8 md:flex-row md:gap-12">
        {/* Artwork */}
        <div className="w-full flex-shrink-0 md:w-80 lg:w-96">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
            {track.artworkUrl ? (
              <Image
                src={track.artworkUrl}
                alt={track.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 384px"
                priority
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                <svg
                  className="h-20 w-20 text-zinc-600"
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
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-50 md:text-3xl">
              {track.title}
            </h1>
            <Link
              href={`/artist/${track.artistAddress}`}
              className="mt-1 text-lg text-zinc-400 transition-colors hover:text-zinc-50"
            >
              {displayArtist}
            </Link>
          </div>

          <button
            onClick={handlePlay}
            className="flex w-fit items-center gap-2 rounded-full bg-zinc-50 px-6 py-3 font-medium text-zinc-900 transition-transform hover:scale-105"
          >
            {isCurrentTrack && isPlaying ? (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Play
              </>
            )}
          </button>

          {track.description && (
            <p className="max-w-lg whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
              {track.description}
            </p>
          )}

          <p className="text-sm text-zinc-500">{formatDate(track.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}
