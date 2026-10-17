import type { MetadataRoute } from 'next';
import { describeProject, durationInSeconds, getProjects } from '@/lib/projects';
import { absoluteUrl, SITE_URL } from '@/lib/site';

// Next writes sitemap values into the XML as-is, so escape them (some X video links contain "&").
const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
const xml = (value: string) => value.replace(/[&<>"']/g, (character) => entities[character]);

// Lists the directory and every video page, with each page's video so search engines can index it.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return [
    { url: xml(SITE_URL) },
    ...projects.map((project) => ({
      url: xml(absoluteUrl(`/projects/${project.slug}`)),
      videos: project.thumbnailUrl && project.playbackUrl ? [{
        title: xml(project.title),
        thumbnail_loc: xml(absoluteUrl(project.thumbnailUrl)),
        description: xml(describeProject(project)),
        content_loc: xml(absoluteUrl(project.playbackUrl)),
        duration: durationInSeconds(project),
        publication_date: project.submittedAt && xml(project.submittedAt),
      }] : undefined,
    })),
  ];
}
