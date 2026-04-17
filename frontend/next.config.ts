import { withSerwistInit } from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  // Disable PWA in development to avoid issues with Hot Module Replacement
  disable: process.env.NODE_ENV === "development",
  register: true,
  // Cache pages on search or link hover
  cacheOnNavigation: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Silence Turbopack/Webpack compatibility error in Next.js 16+
  // @ts-ignore - Turbopack key might not be in the type definition yet
  turbopack: {}
};

export default withSerwist(nextConfig);