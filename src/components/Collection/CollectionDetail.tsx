"use client";

import Image from "next/image";
import Link from "next/link";
import FeedGrid from "@/components/Feed/FeedGrid";
import { useTimeline } from "@/hooks/useTimeline";
import Scribble from "@/components/ui/Scribble";

export default function CollectionDetail({ address }: { address: string }) {
  const { tracks } = useTimeline(undefined, address);

  const albumName =
    tracks.length > 0 && tracks[0].artist !== tracks[0].artistAddress
      ? tracks[0].artist
      : null;
  const artworkUrl = tracks.length > 0 ? tracks[0].artworkUrl : null;
  const trackCount = tracks.length;

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {tracks.length > 0 && (
        <div className="mb-8 flex items-center gap-5">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-900 sm:h-32 sm:w-32">
            {artworkUrl ? (
              <Image
                src={artworkUrl}
                alt={albumName || "Collection"}
                fill
                className="object-cover"
                sizes="128px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Scribble className="h-10 w-10 text-zinc-600" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold text-zinc-50 sm:text-3xl">
              {albumName || "Collection"}
            </h1>
            {trackCount > 0 && (
              <p className="mt-1 text-sm text-zinc-400">
                {trackCount} {trackCount === 1 ? "track" : "tracks"}
              </p>
            )}
          </div>
        </div>
      )}

      <FeedGrid collection={address} />
    </div>
  );
}
