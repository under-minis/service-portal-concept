/** @type {import('next').NextConfig} */
const repo = "service-portal-concept";

const nextConfig = {
  output: "export", // generates /out for static hosting
  images: { unoptimized: true }, // required if you use next/image on Pages
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  trailingSlash: true, // helps avoid refresh 404s for routes
};

module.exports = nextConfig;
