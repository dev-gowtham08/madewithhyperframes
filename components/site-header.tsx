import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Made With Hyperframes home">
          <img className="brand-mark" src="/icon.svg" alt="" width={35} height={35} />
          <span className="brand-words"><strong>Made With</strong><span>Hyperframes</span></span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          <Link href="/#explore">Directory</Link>
        </nav>
        <div className="header-actions">
          <a
            className="github-link"
            href="https://github.com/dev-gowtham08/awesome-hyperframes"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View community GitHub (opens in a new tab)"
            title="View community GitHub (opens in a new tab)"
          >
            <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true" focusable="false">
              <path d="M12 .75a11.25 11.25 0 0 0-3.558 21.923c.563.104.768-.244.768-.542 0-.267-.01-.975-.015-1.914-3.13.68-3.791-1.508-3.791-1.508-.512-1.3-1.25-1.646-1.25-1.646-1.022-.699.078-.685.078-.685 1.13.08 1.725 1.16 1.725 1.16 1.005 1.723 2.637 1.225 3.279.937.102-.729.393-1.225.715-1.507-2.498-.284-5.124-1.249-5.124-5.563 0-1.229.439-2.233 1.159-3.02-.116-.285-.503-1.43.11-2.98 0 0 .945-.302 3.094 1.154a10.79 10.79 0 0 1 2.813-.378c.956.005 1.919.129 2.818.378 2.147-1.456 3.09-1.154 3.09-1.154.615 1.55.228 2.695.112 2.98.722.787 1.157 1.791 1.157 3.02 0 4.325-2.63 5.276-5.136 5.554.404.35.766 1.042.766 2.1 0 1.516-.014 2.739-.014 3.11 0 .3.202.65.774.54A11.25 11.25 0 0 0 12 .75Z" />
            </svg>
            <span>GitHub</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
