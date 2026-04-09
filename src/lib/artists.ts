import type { Track } from "@/types/audio";

export interface ArtistGroup {
  name: string;
  address: string;
  tracks: Track[];
}

/**
 * Group tracks by artist address. Only artists with at least `minTracks`
 * tracks are returned. Preserves first-seen order.
 */
export function groupTracksByArtist(
  tracks: Track[],
  minTracks: number = 2,
): ArtistGroup[] {
  const groups = new Map<string, ArtistGroup>();
  for (const track of tracks) {
    const key = track.artistAddress.toLowerCase();
    if (!groups.has(key)) {
      groups.set(key, {
        name: track.artist,
        address: track.artistAddress,
        tracks: [],
      });
    }
    groups.get(key)!.tracks.push(track);
  }
  return Array.from(groups.values()).filter((g) => g.tracks.length >= minTracks);
}
