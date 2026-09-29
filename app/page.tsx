import Link from 'next/link';
import { connection } from 'next/server';
import { DirectoryGrid } from '@/components/directory-grid';
import { getCategories, getProjects } from '@/lib/projects';

export default async function HomePage() {
  await connection();
  const projects = await getProjects();
  const categories = getCategories(projects);

  return (
    <>
      <section className="directory-hero shell">
        <div className="hero-copy">
          <span className="eyebrow"><span className="eyebrow-dot" /> The video directory</span>
          <h1>Videos made with<br /><em>Hyperframes &amp; Opus.</em></h1>
        </div>
        <div className="hero-side">
          <p>Discover motion, product stories, tutorials, and creative experiments from the community.</p>
          <div className="hero-links"><Link href="/#explore">Browse the collection <span aria-hidden="true">↓</span></Link><Link href="/submit">Submit your video <span aria-hidden="true">↗</span></Link></div>
          <div className="hero-tally" aria-label="Directory summary"><span><strong>{String(projects.length).padStart(2, '0')}</strong> {projects.length === 1 ? 'video' : 'videos'}</span><span><strong>{String(categories.length).padStart(2, '0')}</strong> {categories.length === 1 ? 'category' : 'categories'}</span></div>
        </div>
      </section>

      <DirectoryGrid projects={projects} categories={categories} />

      <section className="bottom-cta shell"><div><span className="eyebrow">Made something worth watching?</span><h2>Put your video<br />in the directory<span>.</span></h2><p>Share work created with Hyperframes or Opus and help the collection grow.</p></div><Link className="button button-dark" href="/submit">Submit your video <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
