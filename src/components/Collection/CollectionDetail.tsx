"use client";

import Link from "next/link";
import FeedGrid from "@/components/Feed/FeedGrid";

export default function CollectionDetail({ address }: { address: string }) {
  return (
    <div>
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <FeedGrid collection={address} />
    </div>
  );
}
