import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.inprocess.world" },
    ],
  },
};

export default nextConfig;
