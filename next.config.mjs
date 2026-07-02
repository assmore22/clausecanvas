/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["genlayer-js", "@rainbow-me/rainbowkit", "konva", "react-konva"],
  webpack: (config) => {
    // react-konva pulls in konva's node entry which optionally requires the
    // native `canvas` package; alias it away for the browser/server bundle.
    config.resolve = config.resolve || {};
    config.resolve.alias = { ...(config.resolve.alias || {}), canvas: false };
    return config;
  },
};
export default nextConfig;
