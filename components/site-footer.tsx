import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div><strong>Made With Hyperframes</strong><p>A community directory of videos and prompts.</p></div>
        <div className="footer-links"><Link href="/#explore">All videos</Link><Link href="/hyperframes">Hyperframes examples</Link><Link href="/hyperframes/prompts">Hyperframes prompts</Link><Link href="/#about">About</Link></div>
      </div>
    </footer>
  );
}
