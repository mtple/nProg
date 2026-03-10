"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMetadata } from "@/lib/api";

export function useMetadata(uri: string) {
  return useQuery({
    queryKey: ["metadata", uri],
    queryFn: () => fetchMetadata(uri),
    staleTime: Infinity,
    enabled: !!uri,
  });
}
