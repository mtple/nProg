"use client";

import Link from "next/link";
import { truncateAddress } from "@/lib/utils";
import { useTimeline } from "@/hooks/useTimeline";

export default function ArtistHeader({ address }: { address: string }) {
  const { tracks } = useTimeline(address);

  const artistName =
    tracks.length > 0 && tracks[0].artist !== tracks[0].artistAddress
      ? tracks[0].artist
      : truncateAddress(address);

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
      <h1 className="text-2xl font-bold text-zinc-50">{artistName}</h1>
    </div>
  );
}
