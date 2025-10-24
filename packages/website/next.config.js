/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'api.cargolink.com'],
  },
  env: {
    NEXT_PUBLIC_APP_NAME: 'CargoLink',
    NEXT_PUBLIC_APP_DESCRIPTION: 'Türkiye\'nin En Kapsamlı Lojistik Platformu',
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://api.cargolink.com' 
      : 'http://localhost:3001',
  },
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/overview',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;