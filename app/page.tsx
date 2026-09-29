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
        <div className="hero-badge"><span aria-hidden="true" /> The community showcase</div>
        <div className="hero-grid">
          <div>
            <h1>See what creators are building with <span>Hyperframes.</span></h1>
            <p>Explore videos, product stories, and creative experiments from the people shaping a new way to make.</p>
          </div>
          <div className="hero-rail">
            <div className="directory-stats" aria-label="Directory statistics">
              <div><strong>{projects.length.toString().padStart(2, '0')}</strong><span>Projects</span></div>
              <div><strong>02</strong><span>Creative tools</span></div>
              <div><strong>{categories.length.toString().padStart(2, '0')}</strong><span>Categories</span></div>
            </div>
            <Link className="hero-submit" href="/submit"><span>Share your project</span><span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      </section>

      <DirectoryGrid projects={projects} categories={categories} />

      <section className="bottom-cta shell"><div><span className="eyebrow">Open directory</span><h2>Made something<br />worth discovering?</h2><p>Share your Hyperframes or Opus project with the creative community.</p></div><Link className="button button-cream" href="/submit">Add your project <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
