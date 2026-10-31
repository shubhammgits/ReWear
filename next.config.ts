import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Unsplash URLs are already sized/compressed; skipping the optimizer in dev avoids
    // upstream fetch timeouts on slow connections. Production keeps AVIF/WebP optimisation.
    unoptimized: process.env.NODE_ENV === "development",
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@react-three/drei"],
  },
};

export default nextConfig;
