import type { Metadata } from 'next';
import Link from 'next/link';
import { CopyPromptButton } from '@/components/copy-prompt-button';
import { ProjectCard } from '@/components/project-card';
import { getProjects } from '@/lib/projects';
import { SITE_NAME } from '@/lib/site';

const title = 'Hyperframes Prompts with Video Examples';
const description = 'Read and copy creator-shared Hyperframes prompts alongside their finished video examples. Find source posts, creator credits, and ideas for adapting each prompt.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/hyperframes/prompts' },
  openGraph: { type: 'website', siteName: SITE_NAME, title, description, url: '/hyperframes/prompts' },
};

export default async function HyperframesPromptsPage() {
  const projects = (await getProjects())
    .filter((project) => project.stack.includes('Hyperframes') && !project.prompt_partial)
    .sort((a, b) => (Date.parse(b.submittedAt ?? '') || 0) - (Date.parse(a.submittedAt ?? '') || 0));

  return (
    <>
      <header className="directory-hero shell">
        <div className="hero-copy">
          <h1>Hyperframes prompts with video examples</h1>
          <p>Read {projects.length} full prompts shared by creators of Hyperframes videos. Each prompt is paired with its video and source post, so you can compare the instructions with the finished work before adapting it.</p>
          <nav className="collection-links" aria-label="Related collections">
            <Link href="/hyperframes">Browse Hyperframes examples</Link>
            <Link href="/?prompt=full#explore">Full prompts across all tools</Link>
          </nav>
        </div>
      </header>
      <div className="shell prompt-collection">
        {projects.map((project) => (
          <section className="prompt-example" key={project.slug} aria-labelledby={`prompt-${project.slug}`}>
            <h2 id={`prompt-${project.slug}`}>{project.title} prompt</h2>
            <div className="prompt-example-content">
              <ProjectCard project={project} directoryQuery="tool=Hyperframes&prompt=full" />
              <div className="detail-prompt-panel">
                <div className="prompt-panel-heading">
                  <p>Shared by {project.creator}</p>
                  <CopyPromptButton text={project.prompt} label="Copy prompt" />
                </div>
                <p className="detail-prompt-panel-note"><a href={project.videoUrl} target="_blank" rel="noopener noreferrer">View the original source ↗</a></p>
                <p className="prompt-panel-text">{project.prompt}</p>
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="directory-about shell" aria-labelledby="prompt-guide">
        <h2 id="prompt-guide">Adapt a prompt to your own project</h2>
        <p>Watch the example first and identify the parts you want to reuse: the pacing, scene sequence, camera movement, or typography. Replace product names, links, copy, and assets with your own. If a prompt refers to a source video or product post, follow its original source link to understand the reference.</p>
        <h3>Why are there fewer prompts than videos?</h3>
        <p>Many creators share their finished video without publishing the full prompt. This page includes only Hyperframes entries marked Full prompt in the directory. You can still explore the other videos and their available context in the <Link href="/hyperframes">Hyperframes examples collection</Link>.</p>
      </section>
    </>
  );
}
