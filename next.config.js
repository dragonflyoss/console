/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// module.exports = {
//   async redirects() {
//     return [
//       {
//         source: '/',
//         destination: '/signin',
//         permanent: true,
//       },
//     ];
//   },
// };
const nextConfig = {
  async rewrites() {
    return {
      fallback: [
        {
          source: '/:path*',
          destination: `http://dragonfly-manager.alipay.net:8080`,
        },
      ],
    };
  },
};

module.exports = nextConfig;
