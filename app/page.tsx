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
          <h1>Hyperframes <span className="hero-join">&amp;</span> Opus videos</h1>
          <p>Explore videos and creative experiments from the community.</p>
        </div>
      </section>

      <DirectoryGrid projects={projects} categories={categories} />

    </>
  );
}
