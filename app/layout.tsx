import type { Metadata, Viewport } from 'next';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  // The SVG for current browsers, favicon.ico for everything that requests it directly, and a PNG
  // for iPhone home screens. All three show the logo in public/icon.svg.
  icons: { icon: [{ url: '/favicon.ico', sizes: '32x32' }, { url: '/icon.svg', type: 'image/svg+xml' }], apple: '/apple-touch-icon.png' },
  // Each page sets its own Open Graph title, description, and image, which X falls back to.
  twitter: { card: 'summary_large_image' }
};

export const viewport: Viewport = { themeColor: '#f3f1eb' };

// Runs while the browser parses <head>, so the saved or system theme applies before the first
// paint instead of the page flashing light first. components/theme-toggle.tsx uses the same rules.
const themeScript = `(() => {
  let saved;
  try { saved = localStorage.getItem('showcase-theme'); } catch { /* Use system preference. */ }
  const theme = saved === 'dark' || saved === 'light' ? saved : matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111312' : '#f7f7f4');
})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><SiteHeader /><main>{children}</main><SiteFooter /></body></html>;
}
