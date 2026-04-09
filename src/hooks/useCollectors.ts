"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchPayments } from "@/lib/api";
import type { Payment } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/resolveMediaUrl";

export interface CollectorStats {
  address: string;
  username: string | null;
  collectCount: number;
  lastCollectedAt: string;
  latestArtworkUrl: string;
}

const PAGE_SIZE = 200;

/**
 * Aggregate collectors from the global /payments feed.
 *
 * There is no "list all collectors" endpoint — we page through payments
 * and build a map keyed by buyer address. This is a best-effort view
 * of recently active collectors, not an exhaustive index.
 */
export function useCollectors() {
  const { data, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, error } =
    useInfiniteQuery({
      queryKey: ["collectors"],
      queryFn: ({ pageParam = 1 }) =>
        fetchPayments(undefined, pageParam, PAGE_SIZE, "audio"),
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
      for (const payment of page.payments as Payment[]) {
        const address = payment.buyer.address;
        if (!address) continue;
        const key = address.toLowerCase();

        const existing = map.get(key);
        if (existing) {
          existing.collectCount += 1;
          if (payment.transferred_at > existing.lastCollectedAt) {
            existing.lastCollectedAt = payment.transferred_at;
            existing.latestArtworkUrl = resolveMediaUrl(
              payment.moment.metadata.image || "",
            );
            if (payment.buyer.username) existing.username = payment.buyer.username;
          }
        } else {
          map.set(key, {
            address,
            username: payment.buyer.username,
            collectCount: 1,
            lastCollectedAt: payment.transferred_at,
            latestArtworkUrl: resolveMediaUrl(payment.moment.metadata.image || ""),
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
