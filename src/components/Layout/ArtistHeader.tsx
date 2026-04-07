"use client";

import Image from "next/image";
import Link from "next/link";
import { truncateAddress } from "@/lib/utils";
import { useTimeline } from "@/hooks/useTimeline";

export default function ArtistHeader({ address }: { address: string }) {
  const { tracks } = useTimeline(address);

  const artistName =
    tracks.length > 0 && tracks[0].artist !== tracks[0].artistAddress
      ? tracks[0].artist
      : truncateAddress(address);

  const heroArtwork = tracks.length > 0 ? tracks[0].artworkUrl : null;
  const trackCount = tracks.length;

  return (
    <div className="mb-8">
      <Link
        href="/"
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
                alt={artistName}
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-zinc-50 sm:text-3xl">
              {artistName}
            </h1>
            {trackCount > 0 && (
              <p className="mt-1 text-sm text-zinc-400">
                {trackCount} {trackCount === 1 ? "track" : "tracks"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
