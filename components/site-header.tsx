import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="Made With Hyperframes home">
          <span className="brand-mark" aria-hidden="true"><span>H</span><span>F</span></span>
          <span className="brand-words">Made With <strong>Hyperframes</strong></span>
        </Link>
        <nav className="top-nav" aria-label="Main navigation">
          <Link href="/#explore">Explore</Link>
          <Link href="/submit">Submit</Link>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Link className="button button-dark header-submit" href="/submit">Submit your video <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </header>
  );
}
