"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Scribble from "@/components/ui/Scribble";
import { useScrollArrows } from "@/hooks/useScrollArrows";

export interface Album {
  address: string;
  name: string;
  artist: string;
  artworkUrl: string;
  trackCount: number;
}

function AlbumCard({ album }: { album: Album }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Link
      href={`/collection/${album.address}`}
      className="group block w-40 flex-shrink-0 sm:w-48"
    >
      <div className="relative aspect-square overflow-hidden rounded bg-zinc-900">
        {album.artworkUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <Scribble className="h-10 w-10 text-zinc-600" />
              </div>
            )}
            <Image
              src={album.artworkUrl}
              alt={album.name}
              fill
              className={`object-cover transition-all duration-300 group-hover:scale-[1.03] group-hover:brightness-75 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 640px) 160px, 192px"
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <Scribble className="h-10 w-10 text-zinc-600" />
          </div>
        )}
        {/* Hover overlay with track count */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/30">
          <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:opacity-100">
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <span className="text-xs font-medium">{album.trackCount}</span>
          </div>
        </div>
      </div>
      <div className="mt-2.5">
        <p className="truncate text-[13px] font-medium leading-tight text-zinc-100" title={album.name}>
          {album.name}
        </p>
        <p className="mt-0.5 truncate text-[13px] leading-tight text-zinc-500" title={`${album.artist} · ${album.trackCount} tracks`}>
          {album.artist} &middot; {album.trackCount} {album.trackCount === 1 ? "track" : "tracks"}
        </p>
      </div>
    </Link>
  );
}

export default function AlbumRow({
  albums,
}: {
  albums: Album[];
}) {
  const { scrollRef, canScrollLeft, canScrollRight, scroll } = useScrollArrows();

  if (albums.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-zinc-50">Albums</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Scroll left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Scroll right"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {albums.map((c) => (
          <AlbumCard key={c.address} album={c} />
        ))}
      </div>
    </section>
  );
}
