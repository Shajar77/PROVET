/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    optimizeServerReact: true,
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Separate Web3 libraries into their own chunks
            web3: {
              name: 'web3',
              test: /[\\/]node_modules[\\/](wagmi|viem|@wagmi|@rainbow-me|@reown)[\\/]/,
              priority: 40,
              reuseExistingChunk: true,
            },
            // Separate React and Next.js
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              priority: 50,
              reuseExistingChunk: true,
            },
            // Separate heavy animation libraries
            animations: {
              name: 'animations',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              priority: 30,
              reuseExistingChunk: true,
            },
            // Everything else
            vendors: {
              name: 'vendors',
              test: /[\\/]node_modules[\\/]/,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      }
    }
    return config
  },
}

export default nextConfig
