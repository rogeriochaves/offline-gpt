import nextPWA from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { perf_hooks: false };

    return config;
  },
};

const withPWA = nextPWA({
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false,
  swcMinify: true,
  dest: "public",
  fallbacks: {
    //image: "/static/images/fallback.png",
    // document: "/offline", // if you want to fallback to a custom page rather than /_offline
    // font: '/static/font/fallback.woff2',
    // audio: ...,
    // video: ...,
  },
  publicExcludes: ["!models/**/*"],
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(nextConfig);
