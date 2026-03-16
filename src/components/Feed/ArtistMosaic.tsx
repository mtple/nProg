"use client";

import { useMemo, useRef } from "react";
import ArtistBlock from "./ArtistBlock";
import type { Track } from "@/types/audio";

interface ArtistGroup {
  name: string;
  address: string;
  tracks: Track[];
}

/** Shuffle array (Fisher-Yates) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface LayoutSlot {
  address: string;
  leftWide: boolean;
}

interface PairedLayout {
  left: LayoutSlot;
  right: LayoutSlot | null;
}

/**
 * Generate a stable layout: shuffled order + random 2/3 col splits.
 * This is computed once and stored in a ref so streaming data
 * doesn't cause re-shuffles.
 */
function generateLayout(addresses: string[]): PairedLayout[] {
  const shuffled = shuffle(addresses);
  const rows: PairedLayout[] = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    const left: LayoutSlot = {
      address: shuffled[i],
      leftWide: Math.random() > 0.5,
    };
    const right: LayoutSlot | null = shuffled[i + 1]
      ? { address: shuffled[i + 1], leftWide: false }
      : null;
    rows.push({ left, right });
  }

  return rows;
}

export default function ArtistMosaic({
  groups,
  allTracks,
}: {
  groups: ArtistGroup[];
  allTracks: Track[];
}) {
  const groupMap = useMemo(() => {
    const map = new Map<string, ArtistGroup>();
    for (const g of groups) {
      map.set(g.address.toLowerCase(), g);
    }
    return map;
  }, [groups]);

  // Generate layout once. When new artists appear, append them.
  const layoutRef = useRef<PairedLayout[]>([]);
  const knownRef = useRef<Set<string>>(new Set());

  const currentAddresses = Array.from(groupMap.keys());
  const newAddresses = currentAddresses.filter((a) => !knownRef.current.has(a));

  if (newAddresses.length > 0) {
    for (const a of newAddresses) knownRef.current.add(a);

    if (layoutRef.current.length === 0) {
      // First time — shuffle everything
      layoutRef.current = generateLayout(currentAddresses);
    } else {
      // Append new artists into the existing layout
      // If the last row has an empty right slot, fill it first
      const lastRow = layoutRef.current[layoutRef.current.length - 1];
      let remaining = [...newAddresses];

      if (lastRow && !lastRow.right && remaining.length > 0) {
        lastRow.right = {
          address: remaining.shift()!,
          leftWide: false,
        };
      }

      if (remaining.length > 0) {
        layoutRef.current = [
          ...layoutRef.current,
          ...generateLayout(remaining),
        ];
      }
    }
  }

  const layout = layoutRef.current;

  return (
    <div className="space-y-8">
      {layout.map((row, i) => {
        const leftGroup = groupMap.get(row.left.address);
        const rightGroup = row.right ? groupMap.get(row.right.address) : null;

        if (!leftGroup) return null;

        if (!rightGroup) {
          return (
            <div key={`${row.left.address}-${i}`}>
              <ArtistBlock
                name={leftGroup.name}
                address={leftGroup.address}
                tracks={leftGroup.tracks}
                allTracks={allTracks}
              />
            </div>
          );
        }

        const leftClass = row.left.leftWide
          ? "md:col-span-3"
          : "md:col-span-2";
        const rightClass = row.left.leftWide
          ? "md:col-span-2"
          : "md:col-span-3";

        return (
          <div
            key={`${row.left.address}-${row.right!.address}-${i}`}
            className="grid grid-cols-1 gap-6 md:grid-cols-5"
          >
            <div className={leftClass}>
              <ArtistBlock
                name={leftGroup.name}
                address={leftGroup.address}
                tracks={leftGroup.tracks}
                allTracks={allTracks}
              />
            </div>
            <div className={rightClass}>
              <ArtistBlock
                name={rightGroup.name}
                address={rightGroup.address}
                tracks={rightGroup.tracks}
                allTracks={allTracks}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
