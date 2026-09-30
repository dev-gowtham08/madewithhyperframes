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

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      { source: '/submit', destination: '/#explore', permanent: false },
      ...retiredDemoSlugs.map((slug) => ({
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
