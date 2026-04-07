import { Suspense } from "react";
import FeedGrid from "@/components/Feed/FeedGrid";

function FeedSkeleton() {
  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 h-6 w-24 animate-pulse rounded bg-zinc-800" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 w-40 flex-shrink-0 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-3 h-6 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-40 w-40 flex-shrink-0 animate-pulse rounded-lg bg-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<FeedSkeleton />}>
        <FeedGrid />
      </Suspense>
    </div>
  );
}
