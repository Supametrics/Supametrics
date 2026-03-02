import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  assetPrefix: "/dashboard-static",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatar.vercel.sh",
        pathname: "/*",
      },
      {
        protocol: "https",
        hostname: "avatar.idolo.dev",
        pathname: "/*",
      },
      {
        protocol: "https",
        hostname: "icons.duckduckgo.com",
        pathname: "/ip3/*",
      },
    ],
  },
};

export default nextConfig;
