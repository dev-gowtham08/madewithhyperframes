// Public example and media published in the official HyperFrames documentation.
// Source: https://github.com/heygen-com/hyperframes/blob/main/docs/examples.mdx
export const featuredExample = {
  id: 'hyperframes-launch',
  title: 'HyperFrames Launch',
  creator: 'HeyGen',
  description: 'The official HyperFrames launch film shows how code, motion, footage, and sound come together in a finished video. Its composition source is available to explore.',
  video: 'https://static.heygen.ai/hyperframes-oss/docs/images/showcase/launch-hyperframes-launch-v1-s.mp4',
  poster: 'https://static.heygen.ai/hyperframes-oss/docs/images/showcase/launch-hyperframes-launch-v1.jpg',
  product: 'https://github.com/heygen-com/hyperframes-launches/tree/main/hyperframes-launch',
  category: 'Launch video',
  tools: 'HyperFrames',
  credit: 'Official example'
};

export function publicEntries(db) {
  // Older local databases may still contain the owner's former showcase.
  const approved = db.prepare("SELECT id,title,creator,description,video,product,category,tools,created FROM entries WHERE status='approved' AND id != 'poultry-path' ORDER BY created DESC").all();
  return [featuredExample, ...approved];
}
