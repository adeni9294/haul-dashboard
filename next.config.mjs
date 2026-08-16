import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* 🚀 Mode Static Export untuk Capacitor & Android Studio */
  output: 'export',

  /* 🖼️ Nonaktifkan optimasi gambar bawaan server */
  images: {
    unoptimized: true,
  },

  /* 🔗 Memastikan routing file statis Android berjalan lancar */
  trailingSlash: true,

  /* ✅ Mengabaikan error TypeScript saat build */
  typescript: {
    ignoreBuildErrors: true,
  },

  /* 🛠️ Paksa Turbopack & Webpack mengenali alias `@/` ke folder `src` */
  turbopack: {
    resolveAlias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

export default nextConfig;