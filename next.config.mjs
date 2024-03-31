/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { perf_hooks: false };

    return config;
  },
};

export default nextConfig;
