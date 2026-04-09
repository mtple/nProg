"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatArtistName } from "@/lib/utils";
import type { CollectorStats } from "@/hooks/useCollectors";

export default function CollectorTile({ collector }: { collector: CollectorStats }) {
  const [imgError, setImgError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const displayName = collector.username
    ? collector.username
    : formatArtistName(collector.address);

  return (
    <Link href={`/collector/${collector.address}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded bg-zinc-900">
        {collector.latestArtworkUrl && !imgError ? (
          <Image
            src={collector.latestArtworkUrl}
            alt={displayName}
            fill
            sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
            <span className="text-2xl">◎</span>
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="truncate text-[13px] font-medium text-zinc-100 transition-colors group-hover:text-white">
          {displayName}
        </p>
        <p className="text-[13px] text-zinc-500">
          {collector.collectCount} collected
        </p>
      </div>
    </Link>
  );
}
