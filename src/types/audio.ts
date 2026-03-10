export interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  artworkUrl: string;
  audioUrl: string;
  createdAt: string;
  description?: string;
}

export interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
}
