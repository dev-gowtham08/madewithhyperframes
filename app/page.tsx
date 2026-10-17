import type { Metadata } from 'next';
import { connection } from 'next/server';
import { DirectoryGrid } from '@/components/directory-grid';
import { getCategories, getProjects } from '@/lib/projects';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE } from '@/lib/site';

// Filtered views (?category=, ?q=) all point search engines at the one directory page.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: SITE_NAME, title: SITE_TITLE, description: SITE_DESCRIPTION, url: '/' }
};

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
