import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  // PWA is disabled in development by default. 
  // To test offline functionality, either run a production build or set this to false.
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  fallbacks: {
    document: "/",
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Silence Turbopack/Webpack compatibility error in Next.js 16+
  // @ts-ignore - Turbopack key might not be in the type definition yet
  turbopack: {}
};


export default withPWA(nextConfig);