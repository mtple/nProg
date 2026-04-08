"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchPayments } from "@/lib/api";
import type { Payment } from "@/lib/api";
import { resolveMediaUrl, resolveAudioUrl } from "@/lib/resolveMediaUrl";
import type { Track } from "@/types/audio";
import { useAuth } from "@/providers/AuthProvider";

const PAGE_SIZE = 20;

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

async function fetchUserAddress(token: string): Promise<string> {
  const res = await fetch("/api/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  const data = await res.json();
  return data.address;
}

export function useMyCollection() {
  const { token, isLoggedIn } = useAuth();

  const {
    data: userAddress,
    isLoading: isLoadingAddress,
    error: addressError,
  } = useQuery({
    queryKey: ["userAddress", token],
    queryFn: () => fetchUserAddress(token!),
    enabled: isLoggedIn && !!token,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const {
    data,
    isLoading: isLoadingPayments,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error: paymentsError,
  } = useInfiniteQuery({
    queryKey: ["myCollection", userAddress],
    queryFn: ({ pageParam = 1 }) =>
      fetchPayments(userAddress!, pageParam, PAGE_SIZE, "audio"),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    enabled: !!userAddress,
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

  return {
    tracks,
    totalCount,
    isLoading: isLoadingAddress || (!!userAddress && isLoadingPayments),
    isFetchingMore: isFetchingNextPage,
    hasMore: !!hasNextPage,
    loadMore: fetchNextPage,
    error: addressError || paymentsError,
    isLoggedIn,
  };
}
