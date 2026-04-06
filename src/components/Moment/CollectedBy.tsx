"use client";

import { useEffect, useState } from "react";
import { fetchCollectors } from "@/lib/api";
import type { Collector } from "@/lib/api";
import { truncateAddress } from "@/lib/utils";

export default function CollectedBy({
  collectionAddress,
  tokenId,
  chainId,
}: {
  collectionAddress: string;
  tokenId: string;
  chainId: number;
}) {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchCollectors(collectionAddress, tokenId, chainId)
      .then((data) => setCollectors(data.collectors ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [collectionAddress, tokenId, chainId]);

  if (loading) {
    return (
      <div className="mt-6">
        <h2 className="mb-3 font-serif text-lg font-semibold text-zinc-200">
          Collected by
        </h2>
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-zinc-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error || collectors.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="mb-3 font-serif text-lg font-semibold text-zinc-200">
        Collected by
        <span className="ml-2 text-sm font-normal text-zinc-500">
          {collectors.length}
        </span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {collectors.map((c) => (
          <span
            key={c.address}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-300"
          >
            {c.username || truncateAddress(c.address)}
            {c.quantity > 1 && (
              <span className="text-xs text-zinc-500">x{c.quantity}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
