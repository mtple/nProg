"use client";

import { useAudio } from "@/providers/AudioProvider";

export function useAudioPlayer() {
  return useAudio();
}
