import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // External packages for server components
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hostaway-platform.s3.us-west-2.amazonaws.com',
        port: '',
        pathname: '/listing/**',
      },
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Ensure proper build optimization for Netlify
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Handle API routes properly
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
  // Fix for Netlify deployment issues
  webpack: (config, { isServer, dev }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    }
    
    // Fix for client reference manifest issues on Netlify
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            ...config.optimization?.splitChunks?.cacheGroups,
            default: {
              ...config.optimization?.splitChunks?.cacheGroups?.default,
              minChunks: 1,
            },
          },
        },
      };
    }
    
    return config;
  },
  // Netlify-specific configuration
  trailingSlash: false,
};

export default nextConfig;
