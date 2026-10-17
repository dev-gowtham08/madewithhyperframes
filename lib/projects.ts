import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { VIDEO_CATEGORIES } from '@/lib/video-categories';

export type Tool = 'Hyperframes' | 'Opus' | 'Remotion';

export type Project = {
  slug: string;
  title: string;
  creator: string;
  stack: Tool[];
  category: string;
  prompt: string;
  prompt_partial: boolean;
  videoUrl: string;
  playbackUrl?: string;
  thumbnailUrl?: string;
  creatorUrl?: string;
  duration?: string;
  submittedAt?: string;
  featured?: boolean;
};

const projectsFile = join(process.cwd(), 'data', 'projects.json');

export async function getProjects(): Promise<Project[]> {
  const contents = await readFile(projectsFile, 'utf8');
  const projects: unknown = JSON.parse(contents);
  if (!Array.isArray(projects)) throw new Error('data/projects.json must contain a project array.');
  const missingStack = projects.find((project) => !Array.isArray(project?.stack) || project.stack.length === 0);
  if (missingStack) throw new Error(`data/projects.json: "${missingStack.slug}" needs a stack list, such as ["Opus"].`);
  return projects as Project[];
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getProjects()).find((project) => project.slug === slug);
}

export function durationInSeconds(project: Project): number | undefined {
  const match = project.duration?.match(/^(\d+):(\d{2})$/);
  return match ? Number(match[1]) * 60 + Number(match[2]) : undefined;
}

// One sentence for search results, share previews, and structured data, built from the entry's
// fields so every video page gets an accurate description.
export function describeProject(project: Project): string {
  const article = /^[aeiou]/i.test(project.category) ? 'an' : 'a';
  const length = project.duration ? ` (${project.duration})` : '';
  const prompt = project.prompt_partial ? '' : ' Includes the full prompt.';
  return `${project.title} by ${project.creator}: ${article} ${project.category} video made with ${project.stack.join(' and ')}${length}.${prompt}`;
}

export function getCategories(projectList: Project[]): string[] {
  return [...new Set(projectList.map((project) => project.category))].sort((a, b) => {
    const first = VIDEO_CATEGORIES.findIndex((category) => category === a);
    const second = VIDEO_CATEGORIES.findIndex((category) => category === b);
    return (first < 0 ? VIDEO_CATEGORIES.length : first) - (second < 0 ? VIDEO_CATEGORIES.length : second) || a.localeCompare(b);
  });
}
