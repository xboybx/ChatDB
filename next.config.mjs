import nextBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = nextBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, {
        isServer
    }) => {
        if (isServer) {
            config.externals.push('pdf-parse');
        }
        return config;
    },
};

export default withBundleAnalyzer(nextConfig);