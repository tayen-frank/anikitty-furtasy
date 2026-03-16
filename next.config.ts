import type { NextConfig } from "next";

const remotePatterns = (() => {
  const r2PublicUrl = process.env.R2_PUBLIC_URL?.trim();

  if (!r2PublicUrl) {
    return [];
  }

  const parsedUrl = new URL(r2PublicUrl);
  const normalizedPathname = parsedUrl.pathname.replace(/\/+$/g, "") || "";

  return [
    {
      protocol: parsedUrl.protocol.replace(":", "") as "http" | "https",
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      pathname: `${normalizedPathname || ""}/**`,
    },
  ];
})();

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    remotePatterns,
  },
};

export default nextConfig;
