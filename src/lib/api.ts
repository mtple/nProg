import { API_BASE } from "./consts";
import type { TimelineResponse } from "@/types/timeline";
import type { TokenMetadata } from "@/types/metadata";
import type { Comment } from "@/types/audio";

export async function fetchTimeline(
  page: number = 1,
  limit: number = 50,
  artist?: string,
  collection?: string,
  { contentType, hidden }: { contentType?: string; hidden?: boolean } = {}
): Promise<TimelineResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (artist) params.set("artist", artist);
  if (collection) params.set("collection", collection);
  if (contentType) params.set("content_type", contentType);
  if (hidden !== undefined) params.set("hidden", String(hidden));

  const res = await fetch(`${API_BASE}/timeline?${params}`);
  if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
  return res.json();
}

export async function collectMoment({
  collectionAddress,
  tokenId,
  chainId = 8453,
  amount,
  comment,
  token,
}: {
  collectionAddress: string;
  tokenId: string;
  chainId?: number;
  amount: number;
  comment: string;
  token: string;
}): Promise<{ hash: string; chainId: number }> {
  const res = await fetch("/api/collect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      moment: { collectionAddress, tokenId, chainId },
      amount,
      comment,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Collect failed" }));
    throw new Error(err.message ?? "Collect failed");
  }
  return res.json();
}

export async function fetchComments(
  collectionAddress: string,
  tokenId: string,
  chainId: number = 8453,
  offset: number = 0
): Promise<{ comments: Comment[] }> {
  const params = new URLSearchParams({
    collectionAddress,
    tokenId,
    chainId: String(chainId),
    offset: String(offset),
  });
  const res = await fetch(`${API_BASE}/moment/comments?${params}`);
  if (!res.ok) throw new Error(`Comments fetch failed: ${res.status}`);
  return res.json();
}

export interface TransferMoment {
  token_id: number;
  metadata: {
    name: string;
    image: string;
    description?: string;
    content?: { uri: string; mime: string };
    animation_url?: string;
    external_url?: string;
  };
  collection: {
    address: string;
    chain_id: number;
    protocol: string;
    artist: { address: string; username: string | null };
  };
}

export interface Transfer {
  id: string;
  transferred_at: string;
  quantity: number;
  value: string | number | null;
  currency: string | null;
  transaction_hash: string;
  moment: TransferMoment;
  collector: { address: string; username: string | null };
}

export interface TransfersResponse {
  transfers: Transfer[];
  pagination: { total_count: number; page: number; limit: number; total_pages: number };
}

export async function fetchTransfers(
  collector?: string,
  page: number = 1,
  limit: number = 100,
  contentType?: string,
): Promise<TransfersResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    chainId: "8453",
  });
  if (collector) params.set("collector", collector);
  if (contentType) params.set("content_type", contentType);
  // Go through our Next.js proxy route so responses are cached server-side.
  // Upstream /transfers TTFB is 3–9s; the proxy turns repeat requests instant.
  const res = await fetch(`/api/transfers?${params}`);
  if (!res.ok) throw new Error(`Transfers fetch failed: ${res.status}`);
  const json = await res.json();
  if (json.status === "error") throw new Error(json.message || "Transfers fetch failed");
  return json;
}

export interface Collector {
  address: string;
  username: string | null;
  quantity: number;
  collected_at: string;
}

export interface CollectorsResponse {
  status: string;
  collectors: Collector[];
}

export async function fetchCollectors(
  collectionAddress: string,
  tokenId: string,
  chainId: number = 8453
): Promise<CollectorsResponse> {
  const params = new URLSearchParams({
    collectionAddress,
    tokenId,
    chainId: String(chainId),
  });
  const res = await fetch(`${API_BASE}/moment/collectors?${params}`);
  if (!res.ok) throw new Error(`Collectors fetch failed: ${res.status}`);
  return res.json();
}

export async function fetchMetadata(
  uri: string
): Promise<TokenMetadata | null> {
  const res = await fetch(
    `${API_BASE}/metadata?uri=${encodeURIComponent(uri)}`
  );
  // Return null for client/server errors — don't throw, don't retry
  if (!res.ok) return null;
  return res.json();
}
