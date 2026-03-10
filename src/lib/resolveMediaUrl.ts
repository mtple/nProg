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
 * Resolve audio URI — uses Irys gateway which serves
 * bundled data items that arweave.net can't resolve.
 */
export function resolveAudioUrl(uri: string): string {
  if (!uri) return "";

  if (uri.startsWith("ar://")) {
    return resolveArweave(uri.slice(5), IRYS_GATEWAY);
  }

  if (uri.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}/${uri.slice(7)}`;
  }

  if (uri.startsWith("https://") || uri.startsWith("http://")) {
    return uri;
  }

  return uri;
}
