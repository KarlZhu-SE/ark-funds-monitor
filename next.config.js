/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  output: "export",
  images: {
    unoptimized: true, // Required for static export
  },
  // Uncomment and set basePath if deploying to a subdirectory
  // basePath: '/ark-funds-monitor',
};

module.exports = nextConfig;
