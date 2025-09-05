// next.config.mjs (na RAIZ do projeto)
 /** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      { source: '/backend/:path*', destination: 'http://localhost:8000/:path*' },
    ];
  },
};

export default nextConfig;
