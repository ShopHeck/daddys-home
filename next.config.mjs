/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['puppeteer'],
    instrumentationHook: true
  }
};

export default nextConfig;
