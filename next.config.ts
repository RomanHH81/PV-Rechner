import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone-Output: kleines Runtime-Image, perfekt für Docker.
  // next start läuft mit dem Inhalt von .next/standalone.
  output: "standalone",
};

export default nextConfig;
