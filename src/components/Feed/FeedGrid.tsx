"use client";

import { useMemo } from "react";
import { useTimeline } from "@/hooks/useTimeline";
import TrackTile from "./TrackTile";
import TrackRow from "./TrackRow";
import Scribble from "@/components/ui/Scribble";

export default function FeedGrid({ artist }: { artist?: string }) {
  const { tracks, isLoading, isFetchingMore, hasMore, loadMore, error } =
    useTimeline(artist);

  // Group tracks by artist for rows (only when we have enough variety)
  const artistGroups = useMemo(() => {
    if (artist) return null;

    const groups = new Map<string, { name: string; address: string; tracks: typeof tracks }>();
    for (const track of tracks) {
      const key = track.artistAddress.toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, { name: track.artist, address: track.artistAddress, tracks: [] });
      }
      groups.get(key)!.tracks.push(track);
    }
    return Array.from(groups.values());
  }, [tracks, artist]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <p className="mb-4">Failed to load tracks</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Scribble className="h-20 w-20 text-zinc-500" />
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-400">
        <p>No tracks found</p>
      </div>
    );
  }

  const multiTrackArtists = artistGroups?.filter((g) => g.tracks.length >= 2) ?? [];

  // Artist page: simple grid
  if (artist) {
    return (
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
    );
  }

  // Home page: always use row layout
  return (
    <div className="space-y-10">
      <TrackRow
        title="Latest"
        tracks={tracks}
        allTracks={tracks}
      />

      {multiTrackArtists.map((group) => (
        <TrackRow
          key={group.address}
          title={group.name}
          tracks={group.tracks}
          allTracks={tracks}
          artistAddress={group.address}
        />
      ))}

      {hasMore && (
        <div className="flex justify-center pb-4">
          <button
            onClick={() => loadMore()}
            disabled={isFetchingMore}
            className="rounded-full border border-zinc-700 px-6 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 disabled:opacity-50"
          >
            {isFetchingMore ? "Loading..." : "Discover more"}
          </button>
        </div>
      )}
    </div>
  );
}
