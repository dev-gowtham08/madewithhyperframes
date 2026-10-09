import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { CopyPromptButton } from '@/components/copy-prompt-button';
import { ProjectCard } from '@/components/project-card';
import { VideoPlayer } from '@/components/video-player';
import { getProject, getProjects, type Project } from '@/lib/projects';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const project = await getProject((await params).slug);
  return project ? { title: project.title, description: project.prompt.replace(/\s+/g, ' ').slice(0, 160) } : { title: 'Project not found' };
}

export default async function ProjectPage({ params, searchParams }: Props) {
  await connection();
  const slug = (await params).slug;
  const projects = await getProjects();
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();
  const incoming = await searchParams;
  const directoryParams = new URLSearchParams();
  for (const key of ['q', 'tool', 'category', 'prompt', 'sort']) {
    const value = incoming[key];
    if (typeof value === 'string' && value) directoryParams.set(key, value);
  }
  const directoryQuery = directoryParams.toString();
  const directoryHref = `/${directoryQuery ? `?${directoryQuery}` : ''}#explore`;
  const sharedTools = (entry: Project) => entry.stack.filter((tool) => project.stack.includes(tool)).length;
  const related = projects
    .filter((entry) => entry.slug !== project.slug)
    .sort((a, b) => Number(b.category === project.category) - Number(a.category === project.category) || sharedTools(b) - sharedTools(a) || (Date.parse(b.submittedAt ?? '') || 0) - (Date.parse(a.submittedAt ?? '') || 0))
    .slice(0, 3);
  const promptText = project.prompt.trim();
  const promptNote = project.prompt_partial
    ? 'The full prompt was not shared. This is the available context for the video.'
    : 'Prompt shared by the creator.';

  return (
    <div className="detail-page shell">
      <div className="detail-topline">
        <Link className="back-link" href={directoryHref}><span aria-hidden="true">←</span> Back to directory</Link>
        <span>MADE WITH HYPERFRAMES / VIDEO DIRECTORY</span>
      </div>
      <VideoPlayer project={project} variant="detail" priority />
      <header className="detail-header">
        <div className="detail-heading-copy">
          <h1>{project.title}</h1>
          <p className="detail-byline">By {project.creatorUrl ? <a href={project.creatorUrl} target="_blank" rel="noopener noreferrer">{project.creator} <span aria-hidden="true">↗</span></a> : <strong>{project.creator}</strong>}</p>
        </div>
        <a className="button button-dark detail-original" href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open the original video for ${project.title} in a new tab`}>Open original <span aria-hidden="true">↗</span></a>
      </header>
      <dl className="detail-facts" aria-label="Video information">
        <div><dt>Made with</dt><dd>{project.stack.join(' + ')}</dd></div>
        <div><dt>Category</dt><dd>{project.category}</dd></div>
        {project.duration && <div><dt>Duration</dt><dd>{project.duration}</dd></div>}
      </dl>
      <section className="detail-prompt-panel" aria-labelledby="prompt-title">
        <div className="prompt-panel-heading">
          <div className="prompt-panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m4 6 6 6-6 6M12 18h8" /></svg>
            <h2 id="prompt-title">Prompt</h2>
          </div>
          <CopyPromptButton text={promptText} label="Copy prompt" />
        </div>
        <p className="prompt-panel-note">{promptNote}</p>
        <p className="prompt-panel-text">{promptText}</p>
      </section>
      {related.length > 0 && <section className="related-section" aria-labelledby="related-title"><div className="related-heading"><div><span className="eyebrow">Keep discovering</span><h2 id="related-title">Watch next<span>.</span></h2></div><Link href="/#explore">Browse all videos <span aria-hidden="true">↗</span></Link></div><div className="project-grid related-grid">{related.map((entry) => <ProjectCard key={entry.slug} project={entry} directoryQuery={directoryQuery} />)}</div></section>}
      <div className="detail-end"><Link href={directoryHref}>← Back to directory</Link></div>
    </div>
  );
}
