import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    remotePatterns: [
      { protocol: "https", hostname: "api.inprocess.world" },
      { protocol: "https", hostname: "*.mypinata.cloud" },
    ],
  },
};

export default nextConfig;
