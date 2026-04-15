"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchTransfers } from "@/lib/api";
import type { Transfer } from "@/lib/api";
import { resolveMediaUrl, resolveAudioUrl } from "@/lib/resolveMediaUrl";
import type { Track } from "@/types/audio";

function transferToTrack(transfer: Transfer): Track | null {
  const { moment } = transfer;
  const meta = moment.metadata;

  const audioUrl =
    resolveAudioUrl(meta.content?.uri || "") ||
    resolveAudioUrl(meta.animation_url || "");

  if (!audioUrl) return null;

  const artist = moment.collection.artist;

  return {
    id: `${moment.collection.address}-${moment.token_id}`,
    title: meta.name || "Untitled",
    artist: artist.username || artist.address,
    artistAddress: artist.address,
    artworkUrl: resolveMediaUrl(meta.image || ""),
    audioUrl,
    createdAt: transfer.transferred_at,
    description: meta.description,
    address: moment.collection.address,
    tokenId: String(moment.token_id),
    chainId: moment.collection.chain_id,
  };
}

export function useRecentlyCollected() {
  const { data, isPending, error } = useQuery({
    queryKey: ["recentlyCollected"],
    queryFn: () => fetchTransfers(undefined, 1, 100, "audio"),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const tracks = useMemo(() => {
    if (!data?.transfers) return [];
    const result: Track[] = [];
    const seen = new Set<string>();
    for (const transfer of data.transfers) {
      const track = transferToTrack(transfer);
      if (track && !seen.has(track.id)) {
        seen.add(track.id);
        result.push(track);
      }
    }
    return result;
  }, [data]);

  return { tracks, isLoading: isPending, error };
}
