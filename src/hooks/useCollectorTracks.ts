"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchPayments } from "@/lib/api";
import type { Payment } from "@/lib/api";
import { resolveMediaUrl, resolveAudioUrl } from "@/lib/resolveMediaUrl";
import type { Track } from "@/types/audio";

const PAGE_SIZE = 50;

function paymentToTrack(payment: Payment): Track | null {
  const { moment } = payment;
  const meta = moment.metadata;

  const audioUrl =
    resolveAudioUrl(meta.content?.uri || "") ||
    resolveAudioUrl(meta.animation_url || "");

  if (!audioUrl) return null;

  const creatorAddress = moment.collection.creator;

  return {
    id: moment.id,
    title: meta.name || "Untitled",
    artist: creatorAddress,
    artistAddress: creatorAddress,
    artworkUrl: resolveMediaUrl(meta.image || ""),
    audioUrl,
    createdAt: payment.transferred_at,
    description: meta.description,
    address: moment.collection.address,
    tokenId: String(moment.token_id),
    chainId: moment.collection.chain_id,
  };
}

/**
 * Fetch the tracks collected by a specific address, paginated.
 *
 * Shared between /my-collection (where the address comes from the
 * logged-in user) and /collector/[address] (where it comes from the URL).
 */
export function useCollectorTracks(address: string | undefined) {
  const normalized = address?.toLowerCase();

  const {
    data,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ["collectorTracks", normalized],
    queryFn: ({ pageParam = 1 }) =>
      fetchPayments(normalized!, pageParam, PAGE_SIZE, "audio"),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    enabled: !!normalized,
    staleTime: 5 * 60 * 1000,
  });

  const tracks = useMemo(() => {
    if (!data?.pages) return [];
    const result: Track[] = [];
    const seen = new Set<string>();
    for (const page of data.pages) {
      for (const payment of page.payments) {
        const track = paymentToTrack(payment);
        if (track && !seen.has(track.id)) {
          seen.add(track.id);
          result.push(track);
        }
      }
    }
    return result;
  }, [data]);

  const totalCount = data?.pages[0]?.pagination.total_count ?? 0;

  // Username from the first payment's buyer, if available.
  const username = useMemo(() => {
    const firstBuyer = data?.pages[0]?.payments[0]?.buyer;
    return firstBuyer?.username || null;
  }, [data]);

  return {
    tracks,
    totalCount,
    username,
    isLoading: !!normalized && isPending,
    isFetchingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    loadMore: fetchNextPage,
    error: error as Error | null,
  };
}
