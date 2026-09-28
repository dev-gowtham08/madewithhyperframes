// Official example: https://github.com/heygen-com/hyperframes/blob/main/docs/examples.mdx
export const featuredExample = {
  id: 'website-to-video',
  title: 'Website → Video',
  creator: 'HeyGen',
  description: 'An official HyperFrames example that turns a live website into a short promotional film. Explore the finished video and its public composition source.',
  video: 'https://static.heygen.ai/hyperframes-oss/docs/images/showcase/launch-website-to-hyperframes-v1-s.mp4',
  poster: 'https://static.heygen.ai/hyperframes-oss/docs/images/showcase/launch-website-to-hyperframes-v1.jpg',
  product: 'https://github.com/heygen-com/hyperframes-launches/tree/main/website-to-hyperframes',
  category: 'Product demo',
  tools: 'HyperFrames',
  credit: 'Official example',
  linkLabel: 'Explore the source'
};

export function publicEntries(db) {
  // Exclude the older Poultry Path row until the owner chooses to submit it.
  const approved = db.prepare("SELECT id,title,creator,description,video,product,category,tools,created FROM entries WHERE status='approved' AND id != 'poultry-path' ORDER BY created DESC").all();
  return [featuredExample, ...approved];
}
