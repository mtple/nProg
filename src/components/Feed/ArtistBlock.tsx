"use client";

import Link from "next/link";
import TrackTile from "./TrackTile";
import { useScrollArrows } from "@/hooks/useScrollArrows";
import type { Track } from "@/types/audio";

interface ArtistBlockProps {
  name: string;
  address: string;
  tracks: Track[];
  allTracks: Track[];
}

export default function ArtistBlock({
  name,
  address,
  tracks,
  allTracks,
}: ArtistBlockProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useScrollArrows();

  return (
    <div className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href={`/artist/${address}`}
          className="font-serif text-sm font-semibold text-zinc-50 transition-colors hover:text-zinc-300 truncate"
        >
          {name}
        </Link>
        {tracks.length > 1 && (
          <div className="flex gap-0.5 flex-shrink-0 ml-2">
            <button
              onClick={() => scroll("left", 0.6)}
              disabled={!canScrollLeft}
              className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Scroll left"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right", 0.6)}
              disabled={!canScrollRight}
              className="rounded-full p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
              aria-label="Scroll right"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-3 overflow-x-auto scroll-smooth pb-1"
      >
        {tracks.map((track) => (
          <div key={track.id} className="w-36 flex-shrink-0 sm:w-44">
            <TrackTile track={track} queue={allTracks} />
          </div>
        ))}
      </div>
    </div>
  );
}
