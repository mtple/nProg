"use client";

import { useMemo, useEffect, useRef } from "react";
import { useTimeline } from "@/hooks/useTimeline";
import { useRecentlyCollected } from "@/hooks/useRecentlyCollected";
import TrackTile from "./TrackTile";
import TrackRow from "./TrackRow";
import AlbumRow from "./AlbumRow";
import type { Album } from "./AlbumRow";
import ArtistMosaic from "./ArtistMosaic";
import Scribble from "@/components/ui/Scribble";
import { groupTracksByArtist } from "@/lib/artists";

export default function FeedGrid({ artist, collection }: { artist?: string; collection?: string }) {
  const { tracks, isLoading, isFetchingMore, hasMore, loadMore, error } =
    useTimeline(artist, collection);

  const { tracks: collectedTracks, isLoading: isCollectedLoading } = useRecentlyCollected();

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || isFetchingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "1500px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loadMore]);

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
    return groupTracksByArtist(tracks);
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
          <div ref={sentinelRef} className="mt-10 flex justify-center">
            {isFetchingMore && <Scribble className="h-10 w-10 text-zinc-500" />}
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

      {!artist && !collection && resolvedCollectedTracks.length > 0 && (
        <TrackRow
          title="Recently Collected"
          tracks={resolvedCollectedTracks}
          allTracks={resolvedCollectedTracks}
        />
      )}

      {albums && albums.length > 0 && (
        <AlbumRow albums={albums} />
      )}

      {artistGroups && artistGroups.length > 0 && (
        <ArtistMosaic groups={artistGroups} allTracks={tracks} />
      )}

      {hasMore && !isLoading && (
        <div ref={sentinelRef} className="flex justify-center pb-4">
          {isFetchingMore && <Scribble className="h-10 w-10 text-zinc-500" />}
        </div>
      )}
    </div>
  );
}
