"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchPayments } from "@/lib/api";
import type { Payment } from "@/lib/api";
import { resolveMediaUrl, resolveAudioUrl } from "@/lib/resolveMediaUrl";
import type { Track } from "@/types/audio";

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

export function useRecentlyCollected() {
  const { data, isPending, error } = useQuery({
    queryKey: ["recentlyCollected"],
    queryFn: () => fetchPayments(undefined, 1, 200, "audio"),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const tracks = useMemo(() => {
    if (!data?.payments) return [];
    const result: Track[] = [];
    const seen = new Set<string>();
    for (const payment of data.payments) {
      const track = paymentToTrack(payment);
      if (track && !seen.has(track.id)) {
        seen.add(track.id);
        result.push(track);
      }
    }
    return result;
  }, [data]);

  return { tracks, isLoading: isPending, error };
}
