"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Scribble from "@/components/ui/Scribble";
import type { Track } from "@/types/audio";

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
              unoptimized
              onLoad={() => setImageLoaded(true)}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-800">
            <Scribble className="h-10 w-10 text-zinc-600" />
          </div>
        )}
      </div>
      <div className="mt-2.5">
        <p className="truncate text-[13px] font-medium leading-tight text-zinc-100">
          {album.name}
        </p>
        <p className="mt-0.5 truncate text-[13px] leading-tight text-zinc-500">
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  if (albums.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold text-zinc-50">Albums</h2>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Scroll left"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full p-1.5 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
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
