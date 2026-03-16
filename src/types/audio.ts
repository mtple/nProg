export interface Track {
  id: string;
  title: string;
  artist: string;
  artistAddress: string;
  artworkUrl: string;
  audioUrl: string;
  createdAt: string;
  description?: string;
  address: string;
  tokenId: string;
  chainId: number;
}

export interface Comment {
  id: string;
  sender: string;
  username: string;
  comment: string;
  timestamp: number;
}

export interface AudioPlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
}
