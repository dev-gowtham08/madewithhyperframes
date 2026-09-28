import projectsData from '@/data/projects.json';

export type Project = {
  slug: string;
  title: string;
  creator: string;
  tool: 'Hyperframes' | 'Opus' | 'Both';
  category: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  creatorUrl?: string;
  featured?: boolean;
};

export const projects = projectsData as Project[];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getCategories(): string[] {
  return [...new Set(projects.map((project) => project.category))].sort();
}
