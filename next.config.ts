import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
    // AVIF primero: pesa la mitad que JPG con la misma nitidez. Cada teléfono recibe el tamaño que necesita.
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
