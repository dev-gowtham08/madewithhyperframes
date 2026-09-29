import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/projects';

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const palette = [...project.slug].reduce((total, character) => total + character.charCodeAt(0), 0) % 3;

  return (
    <article className={`project-card poster-${palette}`}>
      <Link className="card-image" href={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>
        {project.thumbnailUrl ? <Image src={project.thumbnailUrl} alt={`Preview of ${project.title}`} fill unoptimized={project.thumbnailUrl.startsWith('http')} sizes="(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 33vw" /> : <span className="thumbnail-fallback"><span className="fallback-top">MADE WITH {project.tool.toUpperCase()}</span><span className="fallback-symbol">✳</span><span className="fallback-title">{project.title}</span></span>}
        <span className="card-number">{String(index).padStart(2, '0')}</span>
        <span className="card-hover-link" aria-hidden="true"><i /> <b>View video</b></span>
      </Link>
      <div className="card-content">
        <div className="card-kicker"><span>{project.category}</span><span aria-hidden="true">/</span><span>{project.tool}</span>{project.duration && <><span aria-hidden="true">/</span><span>{project.duration}</span></>}</div>
        <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
        <div className="card-bottom"><span>By <strong>{project.creator}</strong></span><Link href={`/projects/${project.slug}`} aria-label={`Open ${project.title}`}>Watch <span aria-hidden="true">↗</span></Link></div>
      </div>
    </article>
  );
}
