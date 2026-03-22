import type { NextConfig } from "next"
import withPayload from "@payloadcms/next/withPayload"

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
      },
      {
        protocol: "https",
        hostname: "*.medusa.app",
      },
    ],
  },
}

export default withPayload(nextConfig)
