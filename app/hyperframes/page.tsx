import type { Metadata } from 'next';
import Link from 'next/link';
import { ProjectCard } from '@/components/project-card';
import { getCategories, getProjects } from '@/lib/projects';
import { SITE_NAME } from '@/lib/site';

const title = 'Hyperframes Video Examples';
const description = 'Explore community videos made with Hyperframes, grouped by category. Watch motion graphics, product demos, and explainers with creator credits and source links.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/hyperframes' },
  openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: '/hyperframes' },
};

export default async function HyperframesPage() {
  const projects = (await getProjects())
    .filter((project) => project.stack.includes('Hyperframes'))
    .sort((a, b) => (Date.parse(b.submittedAt ?? '') || 0) - (Date.parse(a.submittedAt ?? '') || 0));
  const categories = getCategories(projects);
  const promptCount = projects.filter((project) => !project.prompt_partial).length;

  return (
    <>
      <header className="directory-hero shell">
        <div className="hero-copy">
          <h1>Hyperframes video examples</h1>
          <p>Explore {projects.length} videos whose creators used Hyperframes. Browse by category to compare product demos, motion graphics, explainers, and other community work. Open an example to watch it, see the tools used, and visit the original post.</p>
          <nav className="collection-links" aria-label="Related collections">
            <Link href="/hyperframes/prompts">Full Hyperframes prompts ({promptCount})</Link>
            <Link href="/#explore">All Hyperframes and Opus videos</Link>
          </nav>
        </div>
      </header>
      <nav className="collection-links collection-categories shell" aria-label="Example categories">
        {categories.map((category, index) => <a key={category} href={`#category-${index}`}>{category}</a>)}
      </nav>
      {categories.map((category, index) => (
        <section key={category} id={`category-${index}`} className="collection-section shell" aria-labelledby={`category-title-${index}`}>
          <h2 id={`category-title-${index}`}>{category} examples</h2>
          <div className="project-grid">
            {projects.filter((project) => project.category === category).map((project) => <ProjectCard key={project.slug} project={project} directoryQuery="tool=Hyperframes" />)}
          </div>
        </section>
      ))}
      <section className="directory-about shell" aria-labelledby="examples-guide">
        <h2 id="examples-guide">What to look for in a video example</h2>
        <p>Choose a video with a similar goal to yours, then compare its format, duration, scene pacing, and use of text. The tool list shows whether the creator combined Hyperframes with Opus or other listed tools. Creator credits and original posts help you trace each example back to its source.</p>
        <h3>Which examples include a prompt?</h3>
        <p>The Full prompt badge identifies entries with a complete prompt in the directory. Other entries include only the context or excerpt the creator shared. Visit the <Link href="/hyperframes/prompts">Hyperframes prompt collection</Link> to read the available full prompts alongside their video examples.</p>
      </section>
    </>
  );
}
