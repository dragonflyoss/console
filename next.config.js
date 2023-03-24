/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login/signin',
        permanent: true,
      },
    ];
  },
};
