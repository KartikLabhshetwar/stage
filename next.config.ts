import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }]; // required to make Konva & react-konva work
    return config;
  },
};

export default nextConfig;
