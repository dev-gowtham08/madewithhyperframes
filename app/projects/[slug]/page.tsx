import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { ProjectCard } from '@/components/project-card';
import { getProject, getProjects } from '@/lib/projects';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const project = await getProject((await params).slug);
  return project ? { title: project.title, description: project.description } : { title: 'Project not found' };
}

export default async function ProjectPage({ params }: Props) {
  await connection();
  const slug = (await params).slug;
  const projects = await getProjects();
  const project = projects.find((entry) => entry.slug === slug);
  if (!project) notFound();
  const related = projects
    .filter((entry) => entry.slug !== project.slug)
    .sort((a, b) => Number(b.category === project.category) - Number(a.category === project.category) || Number(b.tool === project.tool) - Number(a.tool === project.tool) || (Date.parse(b.submittedAt ?? '') || 0) - (Date.parse(a.submittedAt ?? '') || 0))
    .slice(0, 3);

  return (
    <div className="detail-page shell">
      <Link className="back-link" href="/#explore"><span aria-hidden="true">←</span> Back to directory</Link>
      <header className="detail-header">
        <div className="detail-heading-copy">
          <div className="detail-kicker"><span>{project.category}</span><span aria-hidden="true">/</span><span>{project.tool}</span>{project.duration && <><span aria-hidden="true">/</span><span>{project.duration}</span></>}</div>
          <h1>{project.title}<span>.</span></h1>
        </div>
        <div className="detail-creator"><small>CREATED BY</small>{project.creatorUrl ? <a href={project.creatorUrl} target="_blank" rel="noopener noreferrer">{project.creator} <span aria-hidden="true">↗</span></a> : <strong>{project.creator}</strong>}</div>
      </header>
      <a className="detail-media" href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${project.title} on the original site (opens in a new tab)`}>
        {project.thumbnailUrl ? <Image src={project.thumbnailUrl} alt={`Video preview for ${project.title}`} fill priority unoptimized={project.thumbnailUrl.startsWith('http')} sizes="(max-width: 1000px) 100vw, 1320px" /> : <span className="thumbnail-fallback"><span className="fallback-top">VIDEO / MADE WITH {project.tool.toUpperCase()}</span><span className="fallback-symbol">✳</span><span className="fallback-title">{project.title}</span></span>}
        <span className="media-play" aria-hidden="true"><i /></span><span className="media-caption">WATCH ON ORIGINAL SITE <span aria-hidden="true">↗</span></span>
      </a>
      <div className="detail-body">
        <section className="detail-about" aria-labelledby="about-video"><span className="eyebrow">About this video</span><h2 id="about-video">The work, in context.</h2><p>{project.description}</p>{project.prompt && <div className="detail-prompt"><small>PROMPT</small><p>{project.prompt}</p></div>}<a className="inline-link" href={project.videoUrl} target="_blank" rel="noopener noreferrer">Open original video <span aria-hidden="true">↗</span></a></section>
        <aside className="detail-facts" aria-label="Video details"><div><small>CREATOR</small>{project.creatorUrl ? <a href={project.creatorUrl} target="_blank" rel="noopener noreferrer">{project.creator} ↗</a> : <strong>{project.creator}</strong>}</div><div><small>MADE WITH</small><strong>{project.tool}</strong></div><div><small>CATEGORY</small><strong>{project.category}</strong></div>{project.duration && <div><small>DURATION</small><strong>{project.duration}</strong></div>}<div><small>ORIGINAL</small><a href={project.videoUrl} target="_blank" rel="noopener noreferrer">Open video ↗</a></div></aside>
      </div>
      {related.length > 0 && <section className="related-section" aria-labelledby="related-title"><div className="related-heading"><div><span className="eyebrow">Keep discovering</span><h2 id="related-title">More videos<span>.</span></h2></div><Link href="/#explore">View the directory <span aria-hidden="true">↗</span></Link></div><div className="project-grid related-grid">{related.map((entry, index) => <ProjectCard key={entry.slug} project={entry} index={index + 1} />)}</div></section>}
      <div className="detail-end"><Link href="/#explore">← Back to all videos</Link><Link href="/submit">Submit your video ↗</Link></div>
    </div>
  );
}
