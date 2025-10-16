import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração híbrida: flexível em desenvolvimento, rigorosa em produção
  typescript: {
    // Ignora erros de TypeScript apenas em desenvolvimento
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  eslint: {
    // Ignora erros de ESLint apenas em desenvolvimento
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  // Configuração de rotas tipadas
  typedRoutes: process.env.NODE_ENV === 'production',
  // Configurações para desenvolvimento mais rápido
  compiler: {
    // Remove console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Configurações de performance
  poweredByHeader: false,
  compress: true,
  // Configurações de build
  output: 'standalone',
  // Configurações de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
