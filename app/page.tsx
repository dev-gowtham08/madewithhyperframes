import Image from 'next/image';
import Link from 'next/link';
import { DirectoryGrid } from '@/components/directory-grid';
import { getCategories, projects } from '@/lib/projects';

export default function HomePage() {
  const featured = projects.find((project) => project.featured) ?? projects[0];

  return (
    <>
      <section className="hero shell">
        <div className="hero-intro"><span className="eyebrow"><span className="eyebrow-dot" />A community showcase</span><h1>Made to be <em>seen.</em></h1><p>Discover standout videos and projects made with Hyperframes and Opus. Explore the work, meet the makers, and find your next spark.</p><div className="hero-actions"><Link className="button button-dark" href="/#explore">Explore projects <span aria-hidden="true">↗</span></Link><Link className="inline-link" href="/submit">Submit your video <span aria-hidden="true">→</span></Link></div></div>
        <div className="hero-side"><span>01 / CURATED WORK</span><span>BUILT BY CREATORS<br />SHARED WITH EVERYONE</span></div>
      </section>

      {featured && <section className="featured-wrap shell" aria-labelledby="featured-title"><div className="feature-heading"><span className="eyebrow">Editor's pick</span><span className="feature-rule" /><span>FEATURED PROJECT / 001</span></div><article className="featured-card"><Link href={`/projects/${featured.slug}`} className="featured-image" aria-label={`View ${featured.title}`}><Image src={featured.thumbnailUrl ?? '/poultry-path-thumb.svg'} alt={`${featured.title} illustrated project cover`} fill priority unoptimized={Boolean(featured.thumbnailUrl?.startsWith("http"))} sizes="(max-width: 800px) 100vw, 60vw" /><span className="feature-image-label">FEATURED PROJECT</span><span className="feature-image-arrow" aria-hidden="true">↗</span></Link><div className="featured-copy"><div><span className="eyebrow">{featured.category} <span className="eyebrow-separator">/</span> {featured.tool}</span><h2 id="featured-title">{featured.title}</h2><p>{featured.description}. A thoughtful showcase of technology built for people on the ground.</p></div><div className="featured-lower"><div className="creator-chip"><span className="creator-avatar">{featured.creator.charAt(0)}</span><span><small>CREATED BY</small><strong>{featured.creator}</strong></span></div><Link className="button button-light" href={`/projects/${featured.slug}`}>View project <span aria-hidden="true">↗</span></Link></div></div></article></section>}

      <DirectoryGrid projects={projects} categories={getCategories()} />

      <section className="bottom-cta shell"><div><span className="eyebrow">Join the directory</span><h2>Your next project<br />belongs here<span>.</span></h2><p>Made something with Hyperframes or Opus? Share it with the community.</p></div><Link className="button button-cream" href="/submit">Submit your video <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
