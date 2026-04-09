import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.inprocess.world/api";

// Cache upstream responses for 60s. The upstream /payments endpoint is
// slow (3–9s TTFB), so route-level caching turns repeat visits instant.
const REVALIDATE_SECONDS = 60;

export async function GET(req: NextRequest) {
  const incoming = req.nextUrl.searchParams;
  const params = new URLSearchParams();

  // Pass through only the keys the upstream API expects, in a stable order
  // so Next's fetch cache keys are consistent.
  const allowed = ["page", "limit", "chainId", "collector", "content_type"];
  for (const key of allowed) {
    const value = incoming.get(key);
    if (value) params.set(key, value);
  }

  const url = `${API_BASE}/payments?${params.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  const data = await res.json().catch(() => ({ status: "error", message: "Payments fetch failed" }));

  return NextResponse.json(data, {
    status: res.status,
    headers: {
      // Browser-side cache too, so even client-side revisits within the window are instant
      "Cache-Control": `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=300`,
    },
  });
}
