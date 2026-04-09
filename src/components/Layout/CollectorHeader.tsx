"use client";

import Image from "next/image";
import Link from "next/link";
import { truncateAddress } from "@/lib/utils";
import type { Track } from "@/types/audio";

export default function CollectorHeader({
  address,
  username,
  totalCount,
  tracks,
}: {
  address: string;
  username: string | null;
  totalCount: number;
  tracks: Track[];
}) {
  const displayName = username || truncateAddress(address);
  const heroArtwork = tracks.length > 0 ? tracks[0].artworkUrl : null;

  return (
    <div className="mb-8">
      <Link
        href="/collectors"
        className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="relative -mx-4 overflow-hidden rounded-xl px-4 py-8 sm:py-10">
        {heroArtwork && (
          <div className="absolute inset-0">
            <Image
              src={heroArtwork}
              alt=""
              fill
              className="object-cover blur-3xl brightness-[0.3] saturate-150"
              sizes="100vw"
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-zinc-950/40" />
          </div>
        )}
        <div className="relative flex items-center gap-5">
          {heroArtwork && (
            <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg shadow-xl sm:h-28 sm:w-28">
              <Image
                src={heroArtwork}
                alt={displayName}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-zinc-400">Collector</p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-zinc-50 sm:text-3xl">
              {displayName}
            </h1>
            {totalCount > 0 && (
              <p className="mt-1 text-sm text-zinc-400">
                {totalCount} {totalCount === 1 ? "collection" : "collections"}
              </p>
            )}
            <a
              href={`https://basescan.org/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {truncateAddress(address)} ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
