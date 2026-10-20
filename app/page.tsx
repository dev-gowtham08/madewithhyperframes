import type { Metadata } from 'next';
import Link from 'next/link';
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
  const fullPromptCount = projects.filter((project) => !project.prompt_partial).length;

  return (
    <>
      <section className="directory-hero shell">
        <div className="hero-copy">
          <h1>Hyperframes video examples <span className="hero-join">&amp;</span> prompts</h1>
          <p>Explore {projects.length} community videos made with Hyperframes or Opus, including {fullPromptCount} full prompts shared by their creators.</p>
          <nav className="collection-links" aria-label="Explore Hyperframes">
            <Link href="/hyperframes">Hyperframes examples</Link>
            <Link href="/hyperframes/prompts">Hyperframes prompts</Link>
          </nav>
        </div>
      </section>

      <DirectoryGrid projects={projects} categories={categories} />

      <section id="about" className="directory-about shell" aria-labelledby="about-title">
        <h2 id="about-title">About the community directory</h2>
        <p>Made With Hyperframes is an independent collection curated by <a href="https://x.com/gowthamtj0808" target="_blank" rel="noopener noreferrer">Gowtham</a>. Discover motion graphics, product demos, explainers, and other videos collected from creators&apos; public posts. Each video page includes creator credits, the tools used, and a link to the original work.</p>
        <h3>Find a prompt for your next video</h3>
        <p>Filter by tool or category to find relevant examples. Choose <strong>Full prompt</strong> to see videos with a complete prompt shared by the creator, then open a video page to watch the result and copy the prompt. When a full prompt is unavailable, the page labels the available excerpt or context so you know what was shared.</p>
      </section>

    </>
  );
}
