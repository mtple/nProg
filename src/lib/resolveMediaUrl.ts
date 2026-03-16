const ARWEAVE_GATEWAY = "https://arweave.net";
const IRYS_GATEWAY = "https://node2.irys.xyz";
const IPFS_GATEWAY = "https://nftstorage.link/ipfs";

function resolveArweave(id: string, gateway: string): string {
  return `${gateway}/${id}`;
}

/**
 * Resolve media URI to an HTTP URL.
 * Default uses arweave.net (works for images).
 */
export function resolveMediaUrl(uri: string): string {
  if (!uri) return "";

  if (uri.startsWith("ar://")) {
    return resolveArweave(uri.slice(5), ARWEAVE_GATEWAY);
  }

  if (uri.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}/${uri.slice(7)}`;
  }

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return uri;
  }

  return uri;
}

/**
 * Resolve audio URI. Uses arweave.net as primary.
 * Some bundled content is only on Irys — use `getAudioFallbackUrl`
 * to get the alternate gateway URL when the primary fails.
 */
export function resolveAudioUrl(uri: string): string {
  if (!uri) return "";

  if (uri.startsWith("ar://")) {
    return resolveArweave(uri.slice(5), ARWEAVE_GATEWAY);
  }

  if (uri.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}/${uri.slice(7)}`;
  }

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return uri;
  }

  return uri;
}

/**
 * Get the fallback audio URL for a given primary URL.
 * Swaps between arweave.net and Irys gateways.
 */
export function getAudioFallbackUrl(url: string): string | null {
  if (url.includes(ARWEAVE_GATEWAY)) {
    const id = url.split(ARWEAVE_GATEWAY + "/")[1];
    return id ? resolveArweave(id, IRYS_GATEWAY) : null;
  }
  if (url.includes(IRYS_GATEWAY)) {
    const id = url.split(IRYS_GATEWAY + "/")[1];
    return id ? resolveArweave(id, ARWEAVE_GATEWAY) : null;
  }
  return null;
}
