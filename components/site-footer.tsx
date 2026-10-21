import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="footer-inner">
          <div className="footer-brand">
            <Link className="brand" href="/" aria-label="Made With Hyperframes home">
              <img className="brand-mark" src="/icon.svg" alt="" width={35} height={35} />
              <span className="brand-words"><strong>Made With</strong><span>Hyperframes</span></span>
            </Link>
            <p>A little inspiration for your next big idea. Explore videos, discover creators, and find a prompt to make your own.</p>
            <span className="footer-community-note"><span aria-hidden="true" /> Curated by the community</span>
          </div>
          <nav className="footer-navigation" aria-label="Footer navigation">
            <h2>Explore</h2>
            <div className="footer-links">
              <Link href="/#explore">Browse videos</Link>
              <Link href="/#about">About the directory</Link>
              <a href="https://github.com/dev-gowtham08/awesome-hyperframes" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
              <a href="https://github.com/dev-gowtham08/awesome-hyperframes/issues" target="_blank" rel="noopener noreferrer">Report an issue <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a>
            </div>
          </nav>
          <div className="footer-contribute">
            <span className="eyebrow">Made something?</span>
            <h2>Your next video belongs here.</h2>
            <p>Share your work and inspire someone&apos;s next creation.</p>
            <a className="submit-video-link footer-submit" href="https://github.com/dev-gowtham08/awesome-hyperframes/blob/main/CONTRIBUTING.md#video-submissions" target="_blank" rel="noopener noreferrer">Submit a video <span aria-hidden="true">↗</span><span className="sr-only"> (opens contribution instructions in a new tab)</span></a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>An independent community directory.</p>
          <p>Curated by <a href="https://x.com/gowthamtj0808" target="_blank" rel="noopener noreferrer">Gowtham <span aria-hidden="true">↗</span><span className="sr-only"> (opens in a new tab)</span></a></p>
        </div>
      </div>
    </footer>
  );
}
