import Link from 'next/link';

export default function NotFound() {
  return <div className="not-found shell"><span className="eyebrow">404 / Page not found</span><h1>Nothing here yet<span>.</span></h1><p>That page may have moved. Head back to the directory and keep exploring.</p><Link className="button button-dark" href="/">Back to directory <span aria-hidden="true">↗</span></Link></div>;
}
