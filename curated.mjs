// Official example: https://github.com/heygen-com/hyperframes/blob/main/docs/examples.mdx
// Poultry Path media belongs to this site's owner and is served locally.
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

export const poultryPath = {
  id: 'poultry-path',
  title: 'Poultry Path',
  creator: 'Gowtham',
  description: 'A product walkthrough for Poultry Path, an application helping poultry farmers keep track of batches, egg production, feed stock, and orders.',
  video: '/media/poultry-path-en.mp4',
  poster: '/media/poultry-poster.png',
  product: 'https://www.hyperframes.dev/session/ea136626-42d0-4614-836f-c65ed60f4390',
  category: 'Product demo',
  tools: 'HyperFrames',
  credit: 'Creator project',
  linkLabel: 'View HyperFrames session'
};

export function publicEntries(db) {
  // Older local databases may contain this project as a separate approved row.
  const approved = db.prepare("SELECT id,title,creator,description,video,product,category,tools,created FROM entries WHERE status='approved' AND id != 'poultry-path' ORDER BY created DESC").all();
  return [featuredExample, poultryPath, ...approved];
}
