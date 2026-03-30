"use client";

import Link from "next/link";
import { useMyCollection } from "@/hooks/useMyCollection";
import TrackTile from "@/components/Feed/TrackTile";
import Scribble from "@/components/ui/Scribble";

export default function MyCollectionPage() {
  const {
    tracks,
    totalCount,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    error,
    isLoggedIn,
  } = useMyCollection();

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <p>Log in to see your collected music</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-zinc-50 sm:text-3xl">
          My Collection
        </h1>
        {totalCount > 0 && (
          <p className="mt-1 text-sm text-zinc-400">
            {totalCount} {totalCount === 1 ? "track" : "tracks"}
          </p>
        )}
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <p className="mb-4">Failed to load your collection</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Scribble className="h-20 w-20 text-zinc-500" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <p>No collected tracks yet</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tracks.map((track) => (
              <TrackTile key={track.id} track={track} queue={tracks} />
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => loadMore()}
                disabled={isFetchingMore}
                className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
              >
                {isFetchingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
