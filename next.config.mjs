/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  output: "export",

  // equivalent of Vite's base
  basePath: "/start-consultation",
};

export default nextConfig;
