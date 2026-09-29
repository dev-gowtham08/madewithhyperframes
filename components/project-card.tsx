import Link from 'next/link';
import type { Project } from '@/lib/projects';
import { VideoPlayer } from './video-player';

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const palette = [...project.slug].reduce((total, character) => total + character.charCodeAt(0), 0) % 3;

  return (
    <article className={`project-card poster-${palette}`}>
      <VideoPlayer project={project} variant="card" index={index} />
      <div className="card-content">
        <div className="card-meta"><span>{project.category}</span><span aria-hidden="true">/</span><span>{project.tool}</span>{project.duration && <><span aria-hidden="true">/</span><span>{project.duration}</span></>}</div>
        <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
        <div className="card-creator"><span>By</span><strong>{project.creator}</strong></div>
      </div>
    </article>
  );
}
