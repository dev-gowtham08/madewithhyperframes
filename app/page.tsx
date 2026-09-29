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
          <span className="eyebrow"><span className="eyebrow-dot" /> Made With Hyperframes</span>
          <h1>Hyperframes &amp; Opus videos</h1>
          <p>Discover videos and creative work made by the community. Browse by tool or category, then open any entry to watch and learn more.</p>
        </div>
      </section>

      <DirectoryGrid projects={projects} categories={categories} />

      <section className="bottom-cta shell"><div><span className="eyebrow">Made something worth watching?</span><h2>Put your video<br />in the directory<span>.</span></h2><p>Share work created with Hyperframes or Opus and help the collection grow.</p></div><Link className="button button-dark" href="/submit">Submit your video <span aria-hidden="true">↗</span></Link></section>
    </>
  );
}
