/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
      minify: true,
    },
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add security headers but ensure Firebase connections work
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
            key: 'Content-Security-Policy',
            value: "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.firebaseio.com; connect-src 'self' *.firebaseio.com *.firebase.com *.firebase.googleapis.com *.solana.com firebase.googleapis.com firebaseinstallations.googleapis.com identitytoolkit.googleapis.com; img-src 'self' data:;",
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 