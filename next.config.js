/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    // Add your custom configuration here
    // For example, to add a new webpack rule:
    webpack: (config) => {
        config.module.rules.push({
            test: /\.cdc$/,
            use: 'raw-loader',
        });
        return config;
    },
    // Add other Next.js configuration options as needed
};

module.exports = nextConfig;
