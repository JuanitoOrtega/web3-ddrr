import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El monorepo vive en ../ ; sin esto Turbopack busca lockfiles fuera del repo.
  turbopack: { root: import.meta.dirname },
};

export default nextConfig;
