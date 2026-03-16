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
  return blockedSet.has(moment.creator.address.toLowerCase());
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
    address: moment.address,
    tokenId: moment.token_id,
    chainId: moment.chain_id,
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

/** Resolve metadata with concurrency limit, streaming results via callback */
async function resolveMetadataStreaming(
  moments: TimelineMoment[],
  queryClient: ReturnType<typeof useQueryClient>,
  onTracks: (tracks: Track[]) => void,
  concurrency = 20
) {
  const valid = moments.filter((m) => !isBlocked(m));
  if (valid.length === 0) return;

  let active = 0;
  let index = 0;
  const pending: Track[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  function flush() {
    if (pending.length > 0) {
      onTracks(pending.splice(0));
    }
    flushTimer = null;
  }

  // Batch flush every 50ms so we don't setState per-track
  function scheduleFlush() {
    if (!flushTimer) {
      flushTimer = setTimeout(flush, 50);
    }
  }

  return new Promise<void>((resolve) => {
    function next() {
      while (active < concurrency && index < valid.length) {
        const m = valid[index++];
        active++;
        queryClient
          .fetchQuery({
            queryKey: ["metadata", m.uri],
            queryFn: () => fetchMetadata(m.uri),
            staleTime: Infinity,
            retry: false,
          })
          .then((metadata) => {
            if (metadata) {
              const track = toTrack(m, metadata);
              if (track.audioUrl) {
                pending.push(track);
                scheduleFlush();
              }
            }
          })
          .catch(() => {})
          .finally(() => {
            active--;
            if (index < valid.length) {
              next();
            } else if (active === 0) {
              // All done — flush remaining
              if (flushTimer) clearTimeout(flushTimer);
              flush();
              resolve();
            }
          });
      }
    }
    next();
  });
}

const PAGES_PER_BATCH = 2;

export function useTimeline(artist?: string, collection?: string) {
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

  const appendTracks = useCallback((newTracks: Track[]) => {
    if (!mountedRef.current) return;
    setTracks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const unique = newTracks.filter((t) => !existingIds.has(t.id));
      if (unique.length === 0) return prev;
      return [...prev, ...unique];
    });
    // Clear loading as soon as first tracks arrive
    setIsLoading(false);
  }, []);

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

      // Fetch pages and start resolving metadata as each arrives.
      // Don't await metadata — let it stream in the background.
      const resolvePromises: Promise<void>[] = [];

      const timelineResults = await Promise.allSettled(
        pageNumbers.map((p) =>
          fetchTimeline(p, TIMELINE_PAGE_SIZE, artist, collection, {
            audioOnly: true,
            hidden: false,
          })
        )
      );

      for (const result of timelineResults) {
        if (result.status !== "fulfilled") continue;
        if (!mountedRef.current) break;

        totalPagesRef.current = result.value.pagination.total_pages;

        // Fire off metadata resolution — don't await, let it stream
        resolvePromises.push(
          resolveMetadataStreaming(
            result.value.moments,
            queryClient,
            appendTracks,
          )
        );
      }

      // Wait for all metadata to finish before allowing next batch
      await Promise.allSettled(resolvePromises);

      if (mountedRef.current) {
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
  }, [artist, collection, queryClient, appendTracks]);

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
    return (artist || collection) ? deduped : diversifyTracks(deduped);
  }, [tracks, artist, collection]);

  return {
    tracks: diversified,
    isLoading,
    isFetchingMore,
    hasMore,
    loadMore: fetchBatch,
    error,
  };
}
