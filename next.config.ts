import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build for QA (NEXT_DIST_DIR=.next-prod) run alongside `next dev`
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    // Unsplash URLs are already sized/compressed; skipping the optimizer in dev avoids
    // upstream fetch timeouts on slow connections. Production keeps AVIF/WebP optimisation.
    unoptimized: process.env.NODE_ENV === "development",
    formats: ["image/avif", "image/webp"],
    // Widths that match real layouts (phones 360–430 @2–3x, tablets, desktop) instead of the
    // default ladder up to 3840px; small sizes cover avatars, thumbs and the closet cards
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1280, 1920],
    imageSizes: [48, 96, 128, 256, 384],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@react-three/drei"],
  },
};

export default nextConfig;
