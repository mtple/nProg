"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAudio } from "@/providers/AudioProvider";
import { useAuth } from "@/providers/AuthProvider";
import { useTimeline } from "@/hooks/useTimeline";
import { collectMoment } from "@/lib/api";
import { formatArtistName, formatDate } from "@/lib/utils";
import Scribble from "@/components/ui/Scribble";
import CollectedBy from "@/components/Moment/CollectedBy";
import CommentSection from "@/components/Moment/CommentSection";
import TrackTile from "@/components/Feed/TrackTile";
import type { Track } from "@/types/audio";

export default function MomentDetail({ id }: { id: string }) {
  const { tracks } = useTimeline();
  const { play, currentTrack, isPlaying, isBuffering, toggle } = useAudio();
  const { token, isLoggedIn } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [collecting, setCollecting] = useState(false);
  const [collected, setCollected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const track = tracks.find((t: Track) => t.id === id);

  const relatedTracks = useMemo(() => {
    if (!track) return [];
    return tracks
      .filter(
        (t) =>
          t.artistAddress.toLowerCase() === track.artistAddress.toLowerCase() &&
          t.id !== track.id
      )
      .slice(0, 5);
  }, [tracks, track]);

  if (!track) {
    return (
      <div className="flex items-center justify-center py-32">
        <Scribble className="h-20 w-20 text-zinc-500" />
      </div>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const displayArtist = formatArtistName(track.artist);

  const handlePlay = () => {
    if (isCurrentTrack) {
      toggle();
    } else {
      play(track, tracks);
    }
  };

  return (
    <div>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 transition-colors hover:text-zinc-50"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        {/* Artwork */}
        <div className="w-full flex-shrink-0 md:w-80 lg:w-96">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-900">
            {track.artworkUrl ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <Scribble className="h-16 w-16 text-zinc-600" />
                  </div>
                )}
                <Image
                  src={track.artworkUrl}
                  alt={track.title}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 100vw, 384px"
                  priority
                  unoptimized
                  onLoad={() => setImageLoaded(true)}
                />
              </>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800">
                <Scribble className="h-16 w-16 text-zinc-600" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold text-zinc-50 md:text-3xl">
              {track.title}
            </h1>
            <Link
              href={`/artist/${track.artistAddress}`}
              className="mt-1 inline-block font-serif text-lg italic text-zinc-400 transition-colors hover:text-zinc-50"
            >
              {displayArtist}
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className={`group/play relative flex items-center gap-2.5 rounded-full border px-6 py-3 font-medium transition-all duration-300 ${
                isCurrentTrack && isPlaying
                  ? "border-white/20 bg-white/10 text-white shadow-[0_0_25px_rgba(255,255,255,0.15)] backdrop-blur-md"
                  : "border-white/10 bg-white/5 text-white backdrop-blur-md hover:border-white/25 hover:bg-white/10 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]"
              }`}
            >
              {isCurrentTrack && isBuffering ? (
                <>
                  <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Loading
                </>
              ) : isCurrentTrack && isPlaying ? (
                <>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  Pause
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 transition-transform duration-300 group-hover/play:scale-110" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Play
                </>
              )}
            </button>

            <button
              onClick={async () => {
                if (!isLoggedIn || !token) return;
                setCollecting(true);
                setError(null);
                try {
                  await collectMoment({
                    collectionAddress: track.address,
                    tokenId: track.tokenId,
                    chainId: track.chainId,
                    amount: 1,
                    comment: "",
                    token,
                  });
                  setCollected(true);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Collect failed");
                } finally {
                  setCollecting(false);
                }
              }}
              disabled={collecting || collected || !isLoggedIn}
              title={!isLoggedIn ? "Log in to collect" : undefined}
              className={`flex items-center gap-2 rounded-full border px-6 py-3 font-medium transition-all duration-300 ${
                !isLoggedIn
                  ? "border-zinc-800 text-zinc-600 cursor-not-allowed"
                  : collected
                    ? "border-green-500/30 bg-green-500/10 text-green-400"
                    : collecting
                      ? "border-zinc-700 text-zinc-500 cursor-wait"
                      : "border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-zinc-50"
              }`}
            >
              {collected ? (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Collected
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  {!isLoggedIn ? "Log in to collect" : collecting ? "Collecting..." : "Collect"}
                </>
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          {track.description && (
            <p className="max-w-lg whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
              {track.description}
            </p>
          )}

          <p className="text-sm text-zinc-500">{formatDate(track.createdAt)}</p>
        </div>
      </div>

      <CollectedBy
        collectionAddress={track.address}
        tokenId={track.tokenId}
        chainId={track.chainId}
      />

      {/* Related tracks from same artist */}
      {relatedTracks.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-serif text-lg font-semibold text-zinc-50">
            More from{" "}
            <Link
              href={`/artist/${track.artistAddress}`}
              className="transition-colors hover:text-zinc-300"
            >
              {displayArtist}
            </Link>
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {relatedTracks.map((t) => (
              <TrackTile key={t.id} track={t} queue={tracks} />
            ))}
          </div>
        </div>
      )}

      <CommentSection
        collectionAddress={track.address}
        tokenId={track.tokenId}
        chainId={track.chainId}
      />
    </div>
  );
}
