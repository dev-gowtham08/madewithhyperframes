import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/projects';

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <Link className="card-image" href={`/projects/${project.slug}`} aria-label={`View ${project.title}`}>
        {project.thumbnailUrl ? <Image src={project.thumbnailUrl} alt={`${project.title} project cover`} fill unoptimized={project.thumbnailUrl.startsWith("http")} sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" /> : <span className="thumbnail-fallback">{project.title}</span>}
        <span className="card-image-arrow" aria-hidden="true">↗</span>
      </Link>
      <div className="card-content">
        <div className="card-kicker"><span>{project.category}</span><span>{project.tool}</span></div>
        <h3><Link href={`/projects/${project.slug}`}>{project.title}</Link></h3>
        <p>{project.description}</p>
        <div className="card-bottom"><span>By {project.creator}</span><Link href={`/projects/${project.slug}`}>View project <span aria-hidden="true">→</span></Link></div>
      </div>
    </article>
  );
}
