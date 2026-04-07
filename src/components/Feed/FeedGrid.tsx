"use client";

import { useMemo } from "react";
import { useTimeline } from "@/hooks/useTimeline";
import { useRecentlyCollected } from "@/hooks/useRecentlyCollected";
import TrackTile from "./TrackTile";
import TrackRow from "./TrackRow";
import AlbumRow from "./AlbumRow";
import type { Album } from "./AlbumRow";
import ArtistMosaic from "./ArtistMosaic";
import Scribble from "@/components/ui/Scribble";

export default function FeedGrid({ artist, collection }: { artist?: string; collection?: string }) {
  const { tracks, isLoading, isFetchingMore, hasMore, loadMore, error } =
    useTimeline(artist, collection);

  const { tracks: collectedTracks, isLoading: isCollectedLoading } = useRecentlyCollected();

  // Build address->username lookup from timeline tracks and apply to collected tracks
  const artistNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const track of tracks) {
      const key = track.artistAddress.toLowerCase();
      if (!map.has(key) && track.artist !== track.artistAddress) {
        map.set(key, track.artist);
      }
    }
    return map;
  }, [tracks]);

  const resolvedCollectedTracks = useMemo(() => {
    if (!artistNames.size) return collectedTracks;
    return collectedTracks.map((track) => {
      const name = artistNames.get(track.artistAddress.toLowerCase());
      return name && name !== track.artist ? { ...track, artist: name } : track;
    });
  }, [collectedTracks, artistNames]);

  // Group tracks by artist (home page only)
  const artistGroups = useMemo(() => {
    if (artist || collection) return null;

    const groups = new Map<string, { name: string; address: string; tracks: typeof tracks }>();
    for (const track of tracks) {
      const key = track.artistAddress.toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, { name: track.artist, address: track.artistAddress, tracks: [] });
      }
      groups.get(key)!.tracks.push(track);
    }
    return Array.from(groups.values());
  }, [tracks, artist, collection]);

  // Derive albums from audio tracks (home page only)
  const albums = useMemo(() => {
    if (artist || collection) return null;

    const groups = new Map<string, { tracks: typeof tracks }>();
    for (const track of tracks) {
      const key = track.address.toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, { tracks: [] });
      }
      groups.get(key)!.tracks.push(track);
    }

    const result: Album[] = [];
    for (const [addr, group] of groups) {
      if (group.tracks.length < 2) continue;
      const first = group.tracks[0];
      result.push({
        address: addr,
        name: first.artist,
        artist: first.artist,
        artworkUrl: first.artworkUrl,
        trackCount: group.tracks.length,
      });
    }

    // Sort by track count descending
    result.sort((a, b) => b.trackCount - a.trackCount);
    return result;
  }, [tracks, artist, collection]);

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

  // Artist or collection page: block on loading
  if (artist || collection) {
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

  // Home page: sections render independently
  return (
    <div className="space-y-7">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Scribble className="h-16 w-16 text-zinc-500" />
        </div>
      ) : tracks.length > 0 ? (
        <TrackRow
          title="Latest"
          tracks={tracks}
          allTracks={tracks}
        />
      ) : null}

      {!artist && !collection && (
        isCollectedLoading && !isLoading ? (
          <section>
            <h2 className="mb-3 font-serif text-lg font-semibold text-zinc-200">Recently Collected</h2>
            <div className="flex gap-4 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-44 w-44 flex-shrink-0 animate-pulse rounded-lg bg-zinc-800/50" />
              ))}
            </div>
          </section>
        ) : resolvedCollectedTracks.length > 0 ? (
          <TrackRow
            title="Recently Collected"
            tracks={resolvedCollectedTracks}
            allTracks={resolvedCollectedTracks}
          />
        ) : null
      )}

      {albums && albums.length > 0 && (
        <AlbumRow albums={albums} />
      )}

      {artistGroups && artistGroups.length > 0 && (
        <ArtistMosaic groups={artistGroups} allTracks={tracks} />
      )}

      {hasMore && !isLoading && (
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
