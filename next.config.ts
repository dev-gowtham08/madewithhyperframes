import type { NextConfig } from 'next';

const retiredDemoSlugs = [
  'frameflow-product-showcase-eo2jxa',
  'motion-field-study-demo',
  'frameflow-product-showcase-demo',
  'layered-animation-tutorial-demo',
  'prompt-to-story-explainer-demo',
  'soft-shapes-creative-demo',
  'launch-cut-marketing-demo',
  'orbit-objects-3d-demo',
  'saas-flow-walkthrough-demo',
  'ai-workflow-demo',
];

// Removed because they are screen recordings of apps, sites, games, 3D models, or simulations that
// Opus built, not videos made with HyperFrames or Opus.
const removedNonVideoSlugs = [
  'opus-5-5-motion-examples-tetumemo',
  'web-design-showcase-himanshubuildss',
  'voxyz-ai-345550',
  'konstantinsaifo-501736',
  'konstantinsaifo-587629',
  'browser-game-scene-xikhar',
  'eigeorguy-813651',
  'nicolamanzini-156628',
  '0xsolty-735200',
  'curieuxexplorer-272483',
  'acoramaa-248467',
  'explorations-iq-921682',
];

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      { source: '/submit', destination: '/#explore', permanent: false },
      ...[...retiredDemoSlugs, ...removedNonVideoSlugs].map((slug) => ({
        source: `/projects/${slug}`,
        destination: '/#explore',
        permanent: false,
      })),
    ];
  },
  async headers() {
    return [{ source: '/(.*)', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
    ] }];
  }
};

export default nextConfig;
