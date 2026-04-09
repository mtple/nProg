"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { useCollectorTracks } from "./useCollectorTracks";

async function fetchUserAddress(token: string): Promise<string> {
  const res = await fetch("/api/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  const data = await res.json();
  return data.address;
}

export function useMyCollection() {
  const { token, isLoggedIn } = useAuth();

  const {
    data: userAddress,
    isLoading: isLoadingAddress,
    error: addressError,
  } = useQuery({
    queryKey: ["userAddress", token],
    queryFn: () => fetchUserAddress(token!),
    enabled: isLoggedIn && !!token,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const {
    tracks,
    totalCount,
    isLoading: isLoadingTracks,
    isFetchingMore,
    hasMore,
    loadMore,
    error: tracksError,
  } = useCollectorTracks(userAddress);

  return {
    tracks,
    totalCount,
    isLoading: isLoadingAddress || (!!userAddress && isLoadingTracks),
    isFetchingMore,
    hasMore,
    loadMore,
    error: addressError || tracksError,
    isLoggedIn,
  };
}
