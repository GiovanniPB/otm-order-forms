/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { dirs: ['src'] },
  // Servidor Node enxuto p/ container (Coolify). Gera .next/standalone/server.js.
  output: 'standalone'
};

module.exports = nextConfig;
