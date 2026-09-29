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
        <div className="hero-panel">
          <div className="hero-content">
            <span className="hero-badge"><span aria-hidden="true" /> The creator directory</span>
            <h1>Made with<br /><em>imagination.</em><br />Shared with everyone.</h1>
            <p>Explore videos and projects created with Hyperframes and Opus. Every piece has a story. Find one worth watching.</p>
            <div className="hero-links">
              <Link className="button button-white" href="/#explore">Explore projects <span aria-hidden="true">↘</span></Link>
              <Link className="hero-text-link" href="/submit">Submit your work <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-orbit hero-orbit-one" />
            <div className="hero-orbit hero-orbit-two" />
            <div className="hero-display"><span className="display-top">A SPACE FOR CREATIVE WORK <span>↗</span></span><span className="display-symbol">✳</span><span className="display-bottom">MAKE IT. SHARE IT.<br />LET IT TRAVEL.</span></div>
            <span className="hero-visual-label">HYPERFRAMES / OPUS</span>
          </div>
          <div className="hero-meta">
            <span><strong>{String(projects.length).padStart(2, '0')}</strong> projects shared</span>
            <span><strong>{String(categories.length).padStart(2, '0')}</strong> categories to explore</span>
            <span>Independent work, all in one place.</span>
          </div>
        </div>
      </section>

      <DirectoryGrid projects={projects} categories={categories} />

      <section className="bottom-cta shell"><div><span className="eyebrow">The gallery is growing</span><h2>Your work belongs<br />in the mix<span>.</span></h2><p>Made a video or project with Hyperframes or Opus? Add it to the directory.</p></div><Link className="button button-dark" href="/submit">Submit your project <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
