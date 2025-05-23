/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.fallback = { fs: false };
    return config;
  },
  transpilePackages: ['viem'],
};

module.exports = nextConfig;
