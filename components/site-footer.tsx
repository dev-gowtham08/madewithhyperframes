import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div><strong>Made With Hyperframes</strong><p>Videos made with Hyperframes and Opus.</p></div>
        <div className="footer-links"><Link href="/#explore">Browse videos</Link></div>
      </div>
    </footer>
  );
}
