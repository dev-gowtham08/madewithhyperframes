import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div><strong>Made With Hyperframes</strong><p>Independent work. Shared with everyone.</p></div>
        <div className="footer-links"><Link href="/#explore">Browse directory</Link><Link href="/submit">Add your project</Link></div>
      </div>
    </footer>
  );
}
