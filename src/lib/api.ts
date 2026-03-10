import { API_BASE } from "./consts";
import type { TimelineResponse } from "@/types/timeline";
import type { TokenMetadata } from "@/types/metadata";

export async function fetchTimeline(
  page: number = 1,
  limit: number = 50,
  artist?: string,
  collection?: string
): Promise<TimelineResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (artist) params.set("artist", artist);
  if (collection) params.set("collection", collection);

  const res = await fetch(`${API_BASE}/timeline?${params}`);
  if (!res.ok) throw new Error(`Timeline fetch failed: ${res.status}`);
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
