import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Made With Hyperframes — Video directory', template: '%s | Made With Hyperframes' },
  description: 'Discover videos and creative work made with Hyperframes and Opus.',
  icons: { icon: '/icon.svg' }
};

export const viewport: Viewport = { themeColor: '#f3f1eb' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body><Script src="/theme-init.js" strategy="beforeInteractive" /><SiteHeader /><main>{children}</main><SiteFooter /></body></html>;
}
