"use client";

import { useEffect, useRef } from "react";
import { useCollectorTracks } from "@/hooks/useCollectorTracks";
import CollectorHeader from "@/components/Layout/CollectorHeader";
import TrackTile from "@/components/Feed/TrackTile";
import Scribble from "@/components/ui/Scribble";

export default function CollectorPageClient({ address }: { address: string }) {
  const {
    tracks,
    totalCount,
    username,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore,
    error,
  } = useCollectorTracks(address);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || isFetchingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "1500px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loadMore]);

  return (
    <>
      <CollectorHeader
        address={address}
        username={username}
        totalCount={totalCount}
        tracks={tracks}
      />

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <p className="mb-4">Failed to load collection</p>
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
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <p>No collected tracks found</p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {tracks.map((track) => (
              <TrackTile key={track.id} track={track} queue={tracks} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="mt-10 flex justify-center">
              {isFetchingMore && <Scribble className="h-10 w-10 text-zinc-500" />}
            </div>
          )}
        </div>
      )}
    </>
  );
}
