"use client";

import Link from "next/link";
import TrackTile from "./TrackTile";
import { useScrollArrows } from "@/hooks/useScrollArrows";
import type { Track } from "@/types/audio";

interface TrackRowProps {
  title: string;
  tracks: Track[];
  allTracks: Track[];
  artistAddress?: string;
}

export default function TrackRow({
  title,
  tracks,
  allTracks,
  artistAddress,
}: TrackRowProps) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useScrollArrows();

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {artistAddress ? (
            <Link
              href={`/artist/${artistAddress}`}
              className="font-serif text-lg font-semibold text-zinc-50 transition-colors hover:text-zinc-300"
            >
              {title}
            </Link>
          ) : (
            <h2 className="font-serif text-lg font-semibold text-zinc-50">{title}</h2>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Scroll left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Scroll right"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {tracks.map((track) => (
          <div key={track.id} className="w-44 flex-shrink-0 sm:w-52">
            <TrackTile track={track} queue={allTracks} />
          </div>
        ))}
      </div>
    </section>
  );
}
