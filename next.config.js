/** @type {import('next').NextConfig} */
/** @type {import('tailwindcss').Config} */

module.exports = {
  async rewrites() {
    return [
      {
        source: '/fonts/:path*',
        destination: '/static/fonts/:path*',
      },
    ];
  },
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
