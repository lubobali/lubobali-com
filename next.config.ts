import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export — serves from Caddy on Hetzner (no Node runtime).
  // Research-locked 2026-10-05 (see docs/phase-1-foundation.md).
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
