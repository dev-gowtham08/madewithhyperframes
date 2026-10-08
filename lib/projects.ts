import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { VIDEO_CATEGORIES } from '@/lib/video-categories';

export type Project = {
  slug: string;
  title: string;
  creator: string;
  tool: 'Hyperframes' | 'Opus' | 'Both';
  category: string;
  description: string;
  videoUrl: string;
  playbackUrl?: string;
  thumbnailUrl?: string;
  creatorUrl?: string;
  duration?: string;
  prompt?: string | null;
  prompt_partial?: boolean;
  submittedAt?: string;
  featured?: boolean;
};

const projectsFile = join(process.cwd(), 'data', 'projects.json');

export async function getProjects(): Promise<Project[]> {
  const contents = await readFile(projectsFile, 'utf8');
  const projects: unknown = JSON.parse(contents);
  if (!Array.isArray(projects)) throw new Error('data/projects.json must contain a project array.');
  return projects as Project[];
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((project) => project.slug === slug);
}

export function getCategories(projectList: Project[]): string[] {
  return [...new Set(projectList.map((project) => project.category))].sort((a, b) => {
    const first = VIDEO_CATEGORIES.findIndex((category) => category === a);
    const second = VIDEO_CATEGORIES.findIndex((category) => category === b);
    return (first < 0 ? VIDEO_CATEGORIES.length : first) - (second < 0 ? VIDEO_CATEGORIES.length : second) || a.localeCompare(b);
  });
}
