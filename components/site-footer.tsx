import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div><strong>Made With Hyperframes</strong><p>A curated home for work made with Hyperframes and Opus.</p></div>
        <div className="footer-links"><Link href="/">Directory</Link><Link href="/submit">Submit a project</Link></div>
      </div>
    </footer>
  );
}
