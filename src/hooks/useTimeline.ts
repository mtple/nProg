"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchTimeline, fetchMetadata } from "@/lib/api";
import { resolveMediaUrl, resolveAudioUrl } from "@/lib/resolveMediaUrl";
import { BLOCKED_ADDRESSES, TIMELINE_PAGE_SIZE, MIN_INITIAL_TRACKS } from "@/lib/consts";
import type { Track } from "@/types/audio";
import type { TimelineMoment } from "@/types/timeline";
import type { TokenMetadata } from "@/types/metadata";

const blockedSet = new Set(BLOCKED_ADDRESSES.map((a) => a.toLowerCase()));

function isBlocked(moment: TimelineMoment): boolean {
  return (
    moment.creator.hidden ||
    blockedSet.has(moment.creator.address.toLowerCase())
  );
}

function isAudio(metadata: TokenMetadata): boolean {
  return !!metadata.content?.mime?.includes("audio");
}

function toTrack(moment: TimelineMoment, metadata: TokenMetadata): Track {
  const audioUrl =
    resolveAudioUrl(metadata.content?.uri || "") ||
    resolveAudioUrl(metadata.animation_url || "");

  return {
    id: moment.id,
    title: metadata.name || "Untitled",
    artist: moment.creator.username || moment.creator.address,
    artistAddress: moment.creator.address,
    artworkUrl: resolveMediaUrl(metadata.image || ""),
    audioUrl,
    createdAt: moment.created_at,
    description: metadata.description,
  };
}

/**
 * Interleave tracks by artist so one doesn't dominate the grid.
 * Round-robin: take one from each artist in turn.
 */
function diversifyTracks(tracks: Track[]): Track[] {
  const byArtist = new Map<string, Track[]>();
  for (const track of tracks) {
    const key = track.artistAddress.toLowerCase();
    if (!byArtist.has(key)) byArtist.set(key, []);
    byArtist.get(key)!.push(track);
  }

  // If only one artist, just return as-is
  if (byArtist.size <= 1) return tracks;

  const result: Track[] = [];
  const groups = Array.from(byArtist.values());
  let maxLen = 0;
  for (const g of groups) maxLen = Math.max(maxLen, g.length);

  for (let i = 0; i < maxLen; i++) {
    for (const group of groups) {
      if (i < group.length) {
        result.push(group[i]);
      }
    }
  }

  return result;
}

/**
 * Fetch metadata for all moments. Catalog = guaranteed audio.
 * In_process = check mime type. 400 errors return null and are skipped.
 * No retries — failures are fast and silent.
 */
async function resolveMoments(
  moments: TimelineMoment[],
  queryClient: ReturnType<typeof useQueryClient>
): Promise<Track[]> {
  const valid = moments.filter((m) => !isBlocked(m));

  const results = await Promise.allSettled(
    valid.map((m) =>
      queryClient.fetchQuery({
        queryKey: ["metadata", m.uri],
        queryFn: () => fetchMetadata(m.uri),
        staleTime: Infinity,
        retry: false,
      })
    )
  );

  const tracks: Track[] = [];
  results.forEach((result, i) => {
    if (result.status !== "fulfilled" || !result.value) return;
    const metadata = result.value;
    const moment = valid[i];

    // Catalog protocol is always audio; in_process needs mime check
    const audio =
      moment.protocol === "catalog" || isAudio(metadata);
    if (audio) {
      const track = toTrack(moment, metadata);
      if (track.audioUrl) tracks.push(track);
    }
  });

  return tracks;
}

const PAGES_PER_BATCH = 5;

export function useTimeline(artist?: string) {
  const queryClient = useQueryClient();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const nextPageRef = useRef(1);
  const totalPagesRef = useRef<number | null>(null);
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);

  const fetchBatch = useCallback(async () => {
    if (fetchingRef.current || !mountedRef.current) return;
    if (totalPagesRef.current !== null && nextPageRef.current > totalPagesRef.current) {
      setHasMore(false);
      setIsLoading(false);
      setIsFetchingMore(false);
      return;
    }

    fetchingRef.current = true;
    setIsFetchingMore(true);

    try {
      const startPage = nextPageRef.current;
      const endPage = totalPagesRef.current
        ? Math.min(startPage + PAGES_PER_BATCH - 1, totalPagesRef.current)
        : startPage + PAGES_PER_BATCH - 1;

      const pageNumbers = Array.from(
        { length: endPage - startPage + 1 },
        (_, i) => startPage + i
      );

      const timelineResults = await Promise.allSettled(
        pageNumbers.map((p) => fetchTimeline(p, TIMELINE_PAGE_SIZE, artist))
      );

      for (const result of timelineResults) {
        if (result.status === "fulfilled") {
          totalPagesRef.current = result.value.pagination.total_pages;
          break;
        }
      }

      const allMoments: TimelineMoment[] = [];
      for (const result of timelineResults) {
        if (result.status === "fulfilled") {
          allMoments.push(...result.value.moments);
        }
      }

      const newTracks = await resolveMoments(allMoments, queryClient);

      if (mountedRef.current) {
        setTracks((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const unique = newTracks.filter((t) => !existingIds.has(t.id));
          return [...prev, ...unique];
        });

        nextPageRef.current = endPage + 1;

        const done =
          totalPagesRef.current !== null &&
          endPage >= totalPagesRef.current;
        setHasMore(!done);
        setIsLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error("Failed to load"));
        setIsLoading(false);
      }
    } finally {
      fetchingRef.current = false;
      if (mountedRef.current) setIsFetchingMore(false);
    }
  }, [artist, queryClient]);

  useEffect(() => {
    mountedRef.current = true;
    fetchingRef.current = false;
    nextPageRef.current = 1;
    totalPagesRef.current = null;
    setTracks([]);
    setIsLoading(true);
    setHasMore(true);
    setError(null);
    fetchBatch();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchBatch]);

  // Auto-fetch one more batch if we don't have enough yet
  useEffect(() => {
    if (
      tracks.length < MIN_INITIAL_TRACKS &&
      hasMore &&
      !fetchingRef.current &&
      !isLoading
    ) {
      fetchBatch();
    }
  }, [tracks.length, hasMore, isLoading, fetchBatch]);

  const diversified = useMemo(() => {
    // Deduplicate by id in case of race conditions
    const seen = new Set<string>();
    const deduped = tracks.filter((t) => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    return artist ? deduped : diversifyTracks(deduped);
  }, [tracks, artist]);

  return {
    tracks: diversified,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore: fetchBatch,
    error,
  };
}
