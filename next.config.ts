import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // atau '5mb', '10mb', dll
    },
  },
};

export default nextConfig;
