import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/projects';

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <article className="project-card">
      <Link className="card-image" href={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>
        {project.thumbnailUrl ? <Image src={project.thumbnailUrl} alt={`${project.title} project cover`} fill unoptimized={project.thumbnailUrl.startsWith('http')} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /> : <span className="thumbnail-fallback"><span className="fallback-top">MADE WITH {project.tool.toUpperCase()}</span><span className="fallback-symbol">✳</span><span className="fallback-title">{project.title}</span></span>}
        <span className="card-number">#{String(index).padStart(2, '0')}</span>
        <span className="card-hover-link">View project <span aria-hidden="true">↗</span></span>
      </Link>
      <div className="card-content">
        <div className="card-title-row"><h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3><Link className="card-image-arrow" href={`/projects/${project.slug}`} aria-label={`Open ${project.title}`}><span aria-hidden="true">↗</span></Link></div>
        <div className="card-kicker"><span>{project.category}</span><span aria-hidden="true">·</span><span>{project.tool}</span></div>
        <p>{project.description}</p>
        <div className="card-bottom"><span className="creator-avatar">{project.creator.charAt(0)}</span><span>By <strong>{project.creator}</strong></span></div>
      </div>
    </article>
  );
}
