import { API_BASE } from "./consts";
import type { TimelineResponse } from "@/types/timeline";
import type { TokenMetadata } from "@/types/metadata";
import type { Comment } from "@/types/audio";

export async function fetchTimeline(
  page: number = 1,
  limit: number = 50,
  artist?: string,
  collection?: string,
  { audioOnly = false, hidden }: { audioOnly?: boolean; hidden?: boolean } = {}
): Promise<TimelineResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (artist) params.set("artist", artist);
  if (collection) params.set("collection", collection);
  if (audioOnly) params.set("audioOnly", "true");
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

export interface PaymentMoment {
  id: string;
  token_id: number;
  uri: string;
  collection: {
    address: string;
    chain_id: number;
    creator: string;
  };
  metadata: {
    name: string;
    image: string;
    description?: string;
    content?: { uri: string; mime: string };
    animation_url?: string;
    external_url?: string;
  };
}

export interface Payment {
  id: string;
  amount: string;
  transferred_at: string;
  moment: PaymentMoment;
  buyer: { address: string; username: string | null };
}

export interface PaymentsResponse {
  status: string;
  payments: Payment[];
  pagination: { total_count: number; page: number; limit: number; total_pages: number };
}

export async function fetchPayments(
  collector: string,
  page: number = 1,
  limit: number = 20,
): Promise<PaymentsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    audioOnly: "true",
    collector,
    chainId: "8453",
  });
  const res = await fetch(`${API_BASE}/payments?${params}`);
  if (!res.ok) throw new Error(`Payments fetch failed: ${res.status}`);
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
