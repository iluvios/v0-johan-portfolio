/** @type {import('next').NextConfig} */
const nextConfig = {
  // Legacy demo links land on the work instead of a 404.
  // /services redirects to /projects on asjohan.com via proxy.ts so energymedia.com.co can serve /services.
  async redirects() {
    return [
      { source: "/demo/:path*", destination: "/projects", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  outputFileTracingExcludes: {
    "/api/prospects/sheet/[domain]": ["./.local-audits/**"],
    "/*": ["./.local-audits/**"],
  },
};

export default nextConfig;
