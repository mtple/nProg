"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchTransfers } from "@/lib/api";
import type { Transfer } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";

export interface CollectorStats {
  address: string;
  username: string | null;
  collectCount: number;
  lastCollectedAt: string;
  latestArtworkUrl: string;
}

const PAGE_SIZE = 100;

/**
 * Aggregate collectors from the global /transfers feed.
 *
 * There is no "list all collectors" endpoint — we page through transfers
 * and build a map keyed by collector address. This is a best-effort view
 * of recently active collectors, not an exhaustive index.
 */
export function useCollectors() {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useInfiniteQuery({
      queryKey: ["collectors"],
      queryFn: ({ pageParam = 1 }) =>
        fetchTransfers(undefined, pageParam, PAGE_SIZE, "audio"),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        const { page, total_pages } = lastPage.pagination;
        return page < total_pages ? page + 1 : undefined;
      },
      staleTime: 5 * 60 * 1000,
      retry: 2,
    });

  const collectors = useMemo<CollectorStats[]>(() => {
    if (!data?.pages) return [];

    const map = new Map<string, CollectorStats>();
    for (const page of data.pages) {
      for (const transfer of page.transfers as Transfer[]) {
        const address = transfer.collector.address;
        if (!address) continue;
        const key = address.toLowerCase();

        const existing = map.get(key);
        if (existing) {
          existing.collectCount += 1;
          if (transfer.transferred_at > existing.lastCollectedAt) {
            existing.lastCollectedAt = transfer.transferred_at;
            existing.latestArtworkUrl = resolveMediaUrl(
              transfer.moment.metadata.image || "",
            );
            if (transfer.collector.username) existing.username = transfer.collector.username;
          }
        } else {
          map.set(key, {
            address,
            username: transfer.collector.username,
            collectCount: 1,
            lastCollectedAt: transfer.transferred_at,
            latestArtworkUrl: resolveMediaUrl(transfer.moment.metadata.image || ""),
          });
        }
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (b.collectCount !== a.collectCount) return b.collectCount - a.collectCount;
      return b.lastCollectedAt.localeCompare(a.lastCollectedAt);
    });
  }, [data]);

  return {
    collectors,
    isLoading: isPending,
    isFetchingMore: isFetchingNextPage,
    hasMore: hasNextPage ?? false,
    loadMore: fetchNextPage,
    error: error as Error | null,
  };
}
