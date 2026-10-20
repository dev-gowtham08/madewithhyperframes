import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div><strong>Made With Hyperframes</strong><p>A community directory of videos and prompts.</p></div>
        <div className="footer-links"><Link href="/#explore">Browse videos</Link><Link href="/#about">About</Link></div>
      </div>
    </footer>
  );
}
