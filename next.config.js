/** @type {import('next').NextConfig} */
/** @type {import('tailwindcss').Config} */
module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/clusters',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
      {
        source: '/fonts/:path*',
        destination: '/static/fonts/:path*',
      },
    ];
  },
};
