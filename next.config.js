/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "export",
  basePath: "/ark-funds-monitor",
  images: {
    unoptimized: true, // Required for static export
  },
};

module.exports = nextConfig;
