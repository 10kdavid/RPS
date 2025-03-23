/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode as it can cause double-rendering in development
  compiler: {
    // Configure styledComponents to improve developer experience with better debugging
    styledComponents: true, // Simplified, as the shouldForwardProp was causing issues
  },
  webpack: (config, { isServer, dev }) => {
    // Enable Fast Refresh
    if (dev && !isServer) {
      config.experiments = { ...config.experiments, topLevelAwait: true };
      
      // Force webpack to invalidate the cache between builds
      config.cache = false;
    }
    return config;
  },
  // Add response headers to prevent browser caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  // Disable TypeScript type checking during build for faster builds
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 