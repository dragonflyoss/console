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
        destination: '/culster',
        permanent: true,
      },
    ];
  },
};

const nextConfig = {};

module.exports = nextConfig;
