// The production address, used for canonical links, the sitemap, structured data, and share
// previews. Change it here if the site moves to its own domain.
export const SITE_URL = 'https://www.madewithhyperframes.com';
export const SITE_NAME = 'Made With Hyperframes';
export const SITE_TITLE = 'Made With Hyperframes — Video directory';
export const SITE_DESCRIPTION = 'Discover videos and creative work made with Hyperframes and Opus.';

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
