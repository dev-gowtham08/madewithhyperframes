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
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
