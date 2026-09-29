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
          <h1>Hyperframes &amp; Opus videos</h1>
          <p>Discover videos and creative work made by the community. Browse by tool or category, then open any entry to watch and learn more.</p>
        </div>
      </section>

      <DirectoryGrid projects={projects} categories={categories} />

    </>
  );
}
