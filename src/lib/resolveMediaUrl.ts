import { API_BASE } from "./consts";

/**
 * Resolve media URI to an image URL via the InProcess API image proxy.
 * Supports ar://, ipfs://, and https:// URIs with optional resizing/format conversion.
 */
export function resolveMediaUrl(uri: string, opts?: { w?: number; h?: number; f?: string; q?: number }): string {
  if (!uri) return "";
  const params = new URLSearchParams({ url: uri });
  if (opts?.w) params.set("w", String(opts.w));
  if (opts?.h) params.set("h", String(opts.h));
  if (opts?.f) params.set("f", opts.f);
  if (opts?.q) params.set("q", String(opts.q));
  return `${API_BASE}/media/image?${params}`;
}

/**
 * Resolve audio URI via the InProcess API streaming endpoint.
 * Supports ar://, ipfs://, and https:// URIs with range request support.
 */
export function resolveAudioUrl(uri: string): string {
  if (!uri) return "";
  return `${API_BASE}/media/stream?url=${encodeURIComponent(uri)}`;
}
