import type { NextConfig } from "next"
import withPayload from "@payloadcms/next/withPayload"

const nextConfig: NextConfig = {
  experimental: {
    useCache: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
      },
      {
        protocol: "https",
        hostname: "*.medusa.app",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
    ],
  },
}

export default withPayload(nextConfig)
