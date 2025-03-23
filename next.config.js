/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode as it can cause double-rendering in development
  compiler: {
    // Configure styledComponents to improve developer experience with better debugging
    styledComponents: {
      // Exclude all common props that we use in styled components
      shouldForwardProp: (prop) => ![
        'isOpen', 'active', 'collapsed', 'isActive', 'isSelected', 'isWin', 
        'hasMine', 'revealed', 'isAnimating', 'success', 'red', 'isOnline',
        'isMine', 'isSystem'
      ].includes(prop),
    },
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
}

module.exports = nextConfig 