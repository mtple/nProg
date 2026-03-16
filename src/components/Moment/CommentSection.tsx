"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchComments } from "@/lib/api";
import { truncateAddress } from "@/lib/utils";
import type { Comment } from "@/types/audio";

function timeAgo(unix: number): string {
  const seconds = Math.floor(Date.now() / 1000 - unix);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function CommentSection({
  collectionAddress,
  tokenId,
  chainId,
}: {
  collectionAddress: string;
  tokenId: string;
  chainId: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (offset: number) => {
      try {
        const data = await fetchComments(
          collectionAddress,
          tokenId,
          chainId,
          offset
        );
        if (data.comments.length === 0) {
          setHasMore(false);
        } else {
          setComments((prev) =>
            offset === 0 ? data.comments : [...prev, ...data.comments]
          );
        }
      } catch {
        setError("Failed to load comments");
      }
    },
    [collectionAddress, tokenId, chainId]
  );

  useEffect(() => {
    setLoading(true);
    load(0).finally(() => setLoading(false));
  }, [load]);

  const loadMore = async () => {
    setLoadingMore(true);
    await load(comments.length);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="mb-4 font-serif text-lg font-semibold text-zinc-200">Comments</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-3 w-24 rounded bg-zinc-800" />
              <div className="mt-1.5 h-3 w-48 rounded bg-zinc-800/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="mb-4 font-serif text-lg font-semibold text-zinc-200">
        Comments{comments.length > 0 && ` (${comments.length})`}
      </h2>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {!error && comments.length === 0 && (
        <p className="text-sm text-zinc-500">No comments yet</p>
      )}

      {comments.length > 0 && (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="group">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-zinc-300">
                  {c.username || truncateAddress(c.sender)}
                </span>
                <span className="text-xs text-zinc-600">
                  {timeAgo(c.timestamp)}
                </span>
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">
                {c.comment}
              </p>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
