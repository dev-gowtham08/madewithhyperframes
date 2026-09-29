import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getProject } from '@/lib/projects';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await connection();
  const project = await getProject((await params).slug);
  return project ? { title: project.title, description: project.description } : { title: 'Project not found' };
}

export default async function ProjectPage({ params }: Props) {
  await connection();
  const project = await getProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="detail-page shell">
      <Link className="back-link" href="/#explore"><span aria-hidden="true">←</span> Back to directory</Link>
      <div className="detail-header"><div><span className="eyebrow">From the directory <span className="eyebrow-separator">/</span> {project.category}</span><h1>{project.title}<span>.</span></h1><p>{project.description}</p></div><a className="button button-dark detail-header-link" href={project.videoUrl} target="_blank" rel="noopener noreferrer">Open original project <span aria-hidden="true">↗</span></a></div>
      <a className="detail-media" href={project.videoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open original project: ${project.title} (opens in a new tab)`}>
        {project.thumbnailUrl ? <Image src={project.thumbnailUrl} alt={`${project.title} project cover`} fill priority unoptimized={project.thumbnailUrl.startsWith('http')} sizes="(max-width: 1000px) 100vw, 1200px" /> : <span className="thumbnail-fallback"><span className="fallback-top">MADE WITH {project.tool.toUpperCase()}</span><span className="fallback-symbol">✳</span><span className="fallback-title">{project.title}</span></span>}
        <span className="media-play" aria-hidden="true">↗</span><span className="media-caption">OPEN ORIGINAL PROJECT <span aria-hidden="true">↗</span></span>
      </a>
      <div className="detail-body"><div className="detail-about"><span className="eyebrow">The project</span><h2>About this work</h2><p>{project.description}</p><a className="inline-link" href={project.videoUrl} target="_blank" rel="noopener noreferrer">Open the original project <span aria-hidden="true">↗</span></a></div><aside className="detail-facts" aria-label="Project details"><div><small>CREATOR</small>{project.creatorUrl ? <a href={project.creatorUrl} target="_blank" rel="noopener noreferrer">{project.creator} ↗</a> : <strong>{project.creator}</strong>}</div><div><small>TOOL USED</small><strong>{project.tool}</strong></div><div><small>CATEGORY</small><strong>{project.category}</strong></div><div><small>ORIGINAL LINK</small><a href={project.videoUrl} target="_blank" rel="noopener noreferrer">View original ↗</a></div></aside></div>
      <div className="detail-end"><Link href="/#explore">← Explore more projects</Link><Link href="/submit">Share your work ↗</Link></div>
    </div>
  );
}
