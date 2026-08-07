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
};

export default nextConfig;