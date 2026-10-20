// The production address, used for canonical links, the sitemap, structured data, and share
// previews. Change it here if the site moves to its own domain.
export const SITE_URL = 'https://www.madewithhyperframes.com';
export const SITE_NAME = 'Made With Hyperframes';
export const SITE_TITLE = 'Hyperframes & Opus Videos | Made With Hyperframes';
export const SITE_DESCRIPTION = 'Explore a community directory of videos made with Hyperframes and Opus. Discover creators, watch video examples, and find full prompts when shared.';

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
