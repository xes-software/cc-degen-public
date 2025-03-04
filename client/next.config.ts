import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  webpack: function (config, { isServer }) {
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true,
    };
    // fix warnings for async functions in the browser (https://github.com/vercel/next.js/issues/64792)
    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }

    return config;
  },
};

export default nextConfig;
