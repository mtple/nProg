"use client";

import { useEffect, useRef } from "react";
import { useCollectors } from "@/hooks/useCollectors";
import CollectorsGrid from "@/components/Collectors/CollectorsGrid";
import Scribble from "@/components/ui/Scribble";

export default function CollectorsPage() {
  const { collectors, isLoading, isFetchingMore, hasMore, loadMore, error } =
    useCollectors();

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || isFetchingMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "1500px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, loadMore]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-serif text-2xl font-bold text-zinc-50">Collectors</h1>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <p className="mb-4">Failed to load collectors</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Scribble className="h-20 w-20 text-zinc-500" />
        </div>
      ) : collectors.length === 0 ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <p>No collectors found</p>
        </div>
      ) : (
        <>
          <CollectorsGrid collectors={collectors} />
          {hasMore && (
            <div ref={sentinelRef} className="mt-10 flex justify-center">
              {isFetchingMore && <Scribble className="h-10 w-10 text-zinc-500" />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
