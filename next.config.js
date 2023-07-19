/** @type {import('next').NextConfig} */
/** @type {import('tailwindcss').Config} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/signin',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: '/static/fonts/:path*',
      },
    ];
  },
};

const nextConfig = {};

module.exports = nextConfig;
